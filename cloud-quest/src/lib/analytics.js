// Every number the Stats screen shows is derived here, in one pass, from three
// inputs: the question bank, the saved game state and the SRS schedule.
// Pure functions only — no React, no storage access — so the whole dashboard is
// a single useMemo away and each metric stays testable in isolation.

import { DOMAIN_LABELS } from './data'
import { examStats, currentDayStreak } from './storage'
import { DAY_MS, correlation, mean, median, trendSlope, ymd } from './viz'

const SESSION_GAP = 30 * 60_000 // a >30 min pause starts a new study session
const STALE_DAYS = 14

// Weights of the readiness score. Anything missing (no mock exams yet) is
// dropped and the rest re-normalised, so the score never punishes you for a
// pillar you haven't started.
const PILLARS = [
  { key: 'accuracy', label: 'Domínio', weight: 0.34, hint: 'acerto ponderado por tentativa' },
  { key: 'coverage', label: 'Cobertura', weight: 0.26, hint: 'quanto do banco você já viu' },
  { key: 'exam', label: 'Simulados', weight: 0.2, hint: 'média dos simulados' },
  { key: 'retention', label: 'Retenção', weight: 0.2, hint: 'acerto de primeira + memória (SRS)' },
]

export function buildAnalytics({ bank, state, srs, now = Date.now() }) {
  const questions = bank.questions
  const byId = new Map(questions.map((q) => [q.id, q]))
  const answered = state.answered || {}
  const log = (state.answerLog || []).filter((e) => e && e.t)
  const total = questions.length

  // ---- per-question rollup ----------------------------------------------
  const rows = []
  for (const [id, a] of Object.entries(answered)) {
    const q = byId.get(id)
    if (!q) continue // excluded case-study questions still sitting in old saves
    const count = a.count || 1
    const right = a.right ?? (a.correct ? count : 0)
    rows.push({
      q,
      id,
      count,
      right,
      wrong: a.wrong ?? Math.max(0, count - right),
      ok: !!a.correct,
      firstOk: a.firstOk ?? (count === 1 ? !!a.correct : null),
      first: a.first || null,
      last: a.last || null,
      ms: a.ms || 0,
    })
  }

  const seen = rows.length
  const solved = rows.filter((r) => r.ok).length
  const attempts = rows.reduce((s, r) => s + r.count, 0)
  const rightTotal = rows.reduce((s, r) => s + r.right, 0)
  const once = rows.filter((r) => r.count === 1).length
  const twice = rows.filter((r) => r.count === 2).length
  const thrice = rows.filter((r) => r.count >= 3).length
  const notSolved = seen - solved
  const withFirst = rows.filter((r) => r.firstOk !== null)
  const firstTry = withFirst.filter((r) => r.firstOk).length

  const core = {
    total,
    seen,
    solved,
    notSolved,
    remaining: total - seen,
    attempts,
    rightTotal,
    once,
    twice,
    thrice,
    accuracy: seen ? (solved / seen) * 100 : 0, // "já acertei alguma vez"
    hitRate: attempts ? (rightTotal / attempts) * 100 : 0, // acerto por tentativa
    firstTryRate: withFirst.length ? (firstTry / withFirst.length) * 100 : null,
    firstTrySample: withFirst.length,
    coverage: total ? (seen / total) * 100 : 0,
    repeatRate: seen ? ((twice + thrice) / seen) * 100 : 0,
    attemptsPerQuestion: seen ? attempts / seen : 0,
  }

  // ---- time on task ------------------------------------------------------
  const timedRows = rows.filter((r) => r.ms > 0)
  const logMs = log.filter((e) => e.ms > 0)
  const okMs = logMs.filter((e) => e.o).map((e) => e.ms)
  const badMs = logMs.filter((e) => !e.o).map((e) => e.ms)
  const time = {
    totalMs: rows.reduce((s, r) => s + r.ms, 0),
    sample: logMs.length,
    medianMs: median(logMs.map((e) => e.ms)),
    medianOkMs: median(okMs),
    medianBadMs: median(badMs),
    // negative = quem corre erra mais; only meaningful with enough samples
    speedAccuracy: correlation(logMs.map((e) => e.ms), logMs.map((e) => e.o)),
    perQuestion: timedRows.length ? rows.reduce((s, r) => s + r.ms, 0) / timedRows.length : 0,
  }

  // ---- domains -----------------------------------------------------------
  const domainAgg = new Map()
  for (const q of questions) {
    const d = ensure(domainAgg, q.domain, () => ({
      code: q.domain,
      name: DOMAIN_LABELS[q.domain] || q.domainName || q.domain,
      bank: 0,
      seen: 0,
      solved: 0,
      attempts: 0,
      right: 0,
      firstOk: 0,
      firstSample: 0,
      ms: 0,
    }))
    d.bank += 1
  }
  for (const r of rows) {
    const d = domainAgg.get(r.q.domain)
    if (!d) continue
    d.seen += 1
    d.solved += r.ok ? 1 : 0
    d.attempts += r.count
    d.right += r.right
    d.ms += r.ms
    if (r.firstOk !== null) {
      d.firstSample += 1
      d.firstOk += r.firstOk ? 1 : 0
    }
  }
  const domains = [...domainAgg.values()]
    .map((d) => ({
      ...d,
      acc: d.seen ? (d.solved / d.seen) * 100 : null,
      hitRate: d.attempts ? (d.right / d.attempts) * 100 : null,
      firstTry: d.firstSample ? (d.firstOk / d.firstSample) * 100 : null,
      coverage: d.bank ? (d.seen / d.bank) * 100 : 0,
      share: total ? (d.bank / total) * 100 : 0,
    }))
    .sort((a, b) => String(a.code).localeCompare(String(b.code)))

  // ---- topics ------------------------------------------------------------
  const topicAgg = new Map()
  for (const q of questions) {
    const t = ensure(topicAgg, q.topicCode, () => ({
      code: q.topicCode,
      name: q.topicName,
      bank: 0,
      seen: 0,
      solved: 0,
      attempts: 0,
      right: 0,
      lastSeen: 0,
    }))
    t.bank += 1
  }
  for (const r of rows) {
    const t = topicAgg.get(r.q.topicCode)
    if (!t) continue
    t.seen += 1
    t.solved += r.ok ? 1 : 0
    t.attempts += r.count
    t.right += r.right
    t.lastSeen = Math.max(t.lastSeen, r.last || 0)
  }
  const topics = [...topicAgg.values()]
    .filter((t) => t.seen > 0)
    .map((t) => ({
      ...t,
      acc: (t.solved / t.seen) * 100,
      hitRate: t.attempts ? (t.right / t.attempts) * 100 : 0,
      coverage: (t.seen / t.bank) * 100,
      staleDays: t.lastSeen ? Math.floor((now - t.lastSeen) / DAY_MS) : null,
    }))
  const ranked = topics.filter((t) => t.seen >= 3)
  const strongest = [...ranked].sort((a, b) => b.hitRate - a.hitRate || b.seen - a.seen).slice(0, 6)
  const weakest = [...ranked].sort((a, b) => a.hitRate - b.hitRate || b.seen - a.seen).slice(0, 6)
  const stale = topics
    .filter((t) => t.staleDays != null && t.staleDays >= STALE_DAYS && t.hitRate < 80)
    .sort((a, b) => b.staleDays - a.staleDays)
    .slice(0, 6)
  const untouched = [...topicAgg.values()]
    .filter((t) => t.seen === 0)
    .sort((a, b) => b.bank - a.bank)
    .slice(0, 6)

  // ---- cuts: course coverage & question quality --------------------------
  const cutBy = (keyFn, labelFn) => {
    const m = new Map()
    for (const q of questions) {
      const k = keyFn(q)
      const e = ensure(m, k, () => ({ key: k, label: labelFn(k), bank: 0, seen: 0, solved: 0, attempts: 0, right: 0 }))
      e.bank += 1
    }
    for (const r of rows) {
      const e = m.get(keyFn(r.q))
      if (!e) continue
      e.seen += 1
      e.solved += r.ok ? 1 : 0
      e.attempts += r.count
      e.right += r.right
    }
    return [...m.values()]
      .filter((e) => e.bank > 0)
      .map((e) => ({ ...e, acc: e.seen ? (e.solved / e.seen) * 100 : null, hitRate: e.attempts ? (e.right / e.attempts) * 100 : null }))
  }
  const byCoverage = cutBy(
    (q) => q.coverage,
    (k) =>
      ({ ensinado: 'Ensinado no curso', 'pouco ensinado (gap)': 'Pouco ensinado (gap)', 'ausente do curso': 'Fora do curso' }[k] ||
      'Sem classificação'),
  ).sort((a, b) => b.bank - a.bank)
  const byQuality = cutBy(
    (q) => (q.highQuality ? 'high' : 'standard'),
    (k) => (k === 'high' ? 'Alta qualidade' : 'Padrão'),
  ).sort((a, b) => b.bank - a.bank)

  // ---- daily series ------------------------------------------------------
  // Volume comes from activityLog (kept since day one); accuracy comes from the
  // answer log, so it only exists from the day that log started.
  const activity = state.activityLog || {}
  const logByDay = new Map()
  for (const e of log) {
    const k = ymd(e.t)
    const d = ensure(logByDay, k, () => ({ n: 0, ok: 0, ms: 0, timed: 0 }))
    d.n += 1
    d.ok += e.o ? 1 : 0
    if (e.ms) {
      d.ms += e.ms
      d.timed += 1
    }
  }
  const dayKeys = [...new Set([...Object.keys(activity), ...logByDay.keys()])].sort()
  const firstDay = dayKeys[0] || ymd(now)
  const series30 = buildDailySeries(30, now, activity, logByDay)
  const series90 = buildDailySeries(90, now, activity, logByDay)

  // rolling accuracy over the last N answers (window = 20)
  const recent = log.slice(-150)
  const rolling = []
  const W = 20
  for (let i = 0; i < recent.length; i++) {
    if (i < W - 1) {
      rolling.push(null)
      continue
    }
    const w = recent.slice(i - W + 1, i + 1)
    rolling.push((w.reduce((s, e) => s + e.o, 0) / W) * 100)
  }

  // cumulative distinct questions seen, anchored so the curve ends at `seen`
  const firstSeenInLog = new Map()
  for (const e of log) if (!firstSeenInLog.has(e.i)) firstSeenInLog.set(e.i, e.t)
  const newPerDay = new Map()
  for (const [, t] of firstSeenInLog) {
    const k = ymd(t)
    newPerDay.set(k, (newPerDay.get(k) || 0) + 1)
  }
  // Anchor the curve so it lands exactly on `seen`: everything first answered
  // before the window is the starting plateau.
  const newInWindow = series30.reduce((s, d) => s + (newPerDay.get(d.key) || 0), 0)
  const cumulative = []
  let running = Math.max(0, seen - newInWindow)
  for (const d of series30) {
    running += newPerDay.get(d.key) || 0
    cumulative.push({ key: d.key, label: d.label, value: running })
  }

  // ---- habits ------------------------------------------------------------
  const byHour = Array.from({ length: 24 }, (_, h) => ({ h, n: 0, ok: 0 }))
  const byWeekday = Array.from({ length: 7 }, (_, d) => ({ d, n: 0, ok: 0 }))
  for (const e of log) {
    const dt = new Date(e.t)
    const h = byHour[dt.getHours()]
    h.n += 1
    h.ok += e.o
    const w = byWeekday[dt.getDay()]
    w.n += 1
    w.ok += e.o
  }
  const withAcc = (arr) => arr.map((x) => ({ ...x, acc: x.n ? (x.ok / x.n) * 100 : null }))
  const hours = withAcc(byHour)
  const weekdays = withAcc(byWeekday)
  const bestHour = [...hours].filter((h) => h.n >= 10).sort((a, b) => b.acc - a.acc)[0] || null
  const worstHour = [...hours].filter((h) => h.n >= 10).sort((a, b) => a.acc - b.acc)[0] || null
  const peakHour = [...hours].sort((a, b) => b.n - a.n)[0] || null

  // sessions = runs of answers separated by more than SESSION_GAP
  const sessions = []
  for (const e of log) {
    const cur = sessions[sessions.length - 1]
    if (cur && e.t - cur.end <= SESSION_GAP) {
      cur.end = e.t
      cur.n += 1
      cur.ok += e.o
    } else {
      sessions.push({ start: e.t, end: e.t, n: 1, ok: e.o })
    }
  }
  const sessionStats = {
    count: sessions.length,
    avgN: sessions.length ? mean(sessions.map((s) => s.n)) : 0,
    avgMs: sessions.length ? mean(sessions.map((s) => s.end - s.start)) : 0,
    longest: sessions.length ? [...sessions].sort((a, b) => b.n - a.n)[0] : null,
    best: sessions.filter((s) => s.n >= 10).sort((a, b) => b.ok / b.n - a.ok / a.n)[0] || null,
    last: sessions[sessions.length - 1] || null,
  }

  const activeDays = dayKeys.length
  const spanDays = Math.max(1, Math.round((now - new Date(`${firstDay}T00:00:00`).getTime()) / DAY_MS) + 1)
  const streak = {
    current: currentDayStreak(state, now),
    best: state.bestDayStreak || 0,
    activeDays,
    spanDays,
    consistency: (activeDays / spanDays) * 100,
    bestAnswerStreak: state.bestStreak || 0,
    currentAnswerStreak: state.streak || 0,
  }

  // heatmap: 26 weeks, padded so every column is a full Sun→Sat week
  const heat = buildHeat(26, now, activity, logByDay)
  const heatMax = Math.max(4, ...heat.map((c) => c.count))

  // ---- SRS ---------------------------------------------------------------
  const srsEntries = Object.entries(srs || {})
  const boxes = Array.from({ length: 6 }, (_, b) => ({ box: b, q: 0, c: 0 }))
  const forecastMap = new Map()
  let dueQ = 0
  let dueC = 0
  let lapsesTotal = 0
  const leeches = []
  for (const [id, it] of srsEntries) {
    const isCard = id.startsWith('fc-')
    const b = boxes[Math.min(5, Math.max(0, it.box || 0))]
    if (isCard) b.c += 1
    else b.q += 1
    if ((it.due || 0) <= now) isCard ? dueC++ : dueQ++
    else {
      const k = ymd(it.due)
      forecastMap.set(k, (forecastMap.get(k) || 0) + 1)
    }
    lapsesTotal += it.lapses || 0
    if (!isCard && (it.lapses || 0) >= 2 && byId.has(id)) {
      leeches.push({ id, lapses: it.lapses, reps: it.reps || 0, box: it.box || 0, q: byId.get(id) })
    }
  }
  leeches.sort((a, b) => b.lapses - a.lapses || a.box - b.box)
  // Overdue items are reported separately instead of piling onto "today" —
  // a backlog of hundreds would flatten the next two weeks into invisible slivers.
  const forecast = Array.from({ length: 14 }, (_, i) => {
    const t = now + i * DAY_MS
    const d = new Date(t)
    const k = ymd(t)
    return {
      key: k,
      label: i === 0 ? 'hoje' : `${d.getDate()}/${d.getMonth() + 1}`,
      value: forecastMap.get(k) || 0,
    }
  })
  const scheduled = srsEntries.length
  const matured = boxes.slice(4).reduce((s, b) => s + b.q + b.c, 0)
  const srsData = {
    boxes,
    forecast,
    leeches: leeches.slice(0, 8),
    leechCount: leeches.length,
    scheduled,
    matured,
    dueQ,
    dueC,
    due: dueQ + dueC,
    lapsesTotal,
    maturity: scheduled ? (matured / scheduled) * 100 : 0,
  }

  // ---- exams -------------------------------------------------------------
  const ex = examStats(state)
  const history = (state.examHistory || []).map((e, i) => ({ ...e, i, ts: Date.parse(e.date) || 0 }))
  const examDomains = new Map()
  for (const e of history) {
    for (const [code, d] of Object.entries(e.domains || {})) {
      const agg = ensure(examDomains, code, () => ({ code, correct: 0, total: 0 }))
      agg.correct += d.correct
      agg.total += d.total
    }
  }
  const timedExams = history.filter((e) => e.ms > 0)
  const exams = {
    ...ex,
    history,
    recent: history.slice(-12),
    slope: trendSlope(history.map((e) => e.pct)),
    last5Avg: history.length ? mean(history.slice(-5).map((e) => e.pct)) : 0,
    first5Avg: history.length ? mean(history.slice(0, 5).map((e) => e.pct)) : 0,
    byDomain: [...examDomains.values()]
      .map((d) => ({ ...d, name: DOMAIN_LABELS[d.code] || d.code, acc: d.total ? (d.correct / d.total) * 100 : 0 }))
      .sort((a, b) => String(a.code).localeCompare(String(b.code))),
    avgSecPerQuestion: timedExams.length
      ? mean(timedExams.map((e) => e.ms / 1000 / Math.max(1, e.total)))
      : null,
  }

  // ---- pace & projection -------------------------------------------------
  const win = (fromDaysAgo, toDaysAgo) => {
    const from = now - fromDaysAgo * DAY_MS
    const to = now - toDaysAgo * DAY_MS
    const slice = log.filter((e) => e.t > from && e.t <= to)
    return { n: slice.length, acc: slice.length ? (slice.reduce((s, e) => s + e.o, 0) / slice.length) * 100 : null }
  }
  const last7 = win(7, 0)
  const prev7 = win(14, 7)
  const volume7 = sumDays(activity, now, 7)
  const volume14 = sumDays(activity, now, 14)
  const perDay = volume7 / 7 || (volume14 - volume7) / 7
  const newPerDay7 = countNewSince(firstSeenInLog, now - 7 * DAY_MS) / 7
  const daysToFinish = newPerDay7 > 0 ? Math.ceil(core.remaining / newPerDay7) : null
  const pace = {
    last7,
    prev7,
    deltaN: last7.n - prev7.n,
    deltaAcc: last7.acc != null && prev7.acc != null ? last7.acc - prev7.acc : null,
    perDay,
    volume7,
    volume30: sumDays(activity, now, 30),
    newPerDay7,
    daysToFinish,
    finishEta: daysToFinish != null ? now + daysToFinish * DAY_MS : null,
    goal: state.dailyGoal || 10,
  }

  // ---- readiness ---------------------------------------------------------
  const retention =
    core.firstTryRate != null
      ? 0.6 * core.firstTryRate + 0.4 * srsData.maturity
      : srsData.maturity || null
  const rawParts = {
    accuracy: seen >= 10 ? core.hitRate : seen ? core.hitRate * 0.8 : null,
    coverage: core.coverage,
    exam: ex.count ? ex.avg : null,
    retention: srsData.scheduled || core.firstTrySample ? retention : null,
  }
  const active = PILLARS.filter((p) => rawParts[p.key] != null)
  const wsum = active.reduce((s, p) => s + p.weight, 0) || 1
  const parts = PILLARS.map((p) => ({
    ...p,
    value: rawParts[p.key],
    effWeight: rawParts[p.key] == null ? 0 : p.weight / wsum,
    contrib: rawParts[p.key] == null ? 0 : (rawParts[p.key] * p.weight) / wsum,
  }))
  const score = Math.round(parts.reduce((s, p) => s + p.contrib, 0))
  const verdict =
    score >= 80
      ? { label: 'Pronto pro exame', tint: 'text-mint', stroke: '#34d399' }
      : score >= 65
        ? { label: 'Quase lá', tint: 'text-cyan', stroke: '#22d3ee' }
        : score >= 40
          ? { label: 'Construindo base', tint: 'text-amber', stroke: '#fbbf24' }
          : { label: 'Começando', tint: 'text-coral', stroke: '#fb7185' }

  // readiness needed per day to hit 80 — rough, but it turns the gauge into a plan
  const gap = Math.max(0, 80 - score)
  const readiness = { score, verdict, parts, gap, weakestPillar: [...parts].filter((p) => p.value != null).sort((a, b) => a.value - b.value)[0] || null }

  const result = {
    core,
    time,
    domains,
    topics,
    strongest,
    weakest,
    stale,
    untouched,
    byCoverage,
    byQuality,
    daily: series30,
    daily90: series90,
    cumulative,
    rolling,
    hours,
    weekdays,
    bestHour,
    worstHour,
    peakHour,
    sessions: sessionStats,
    streak,
    heat,
    heatMax,
    srs: srsData,
    exams,
    pace,
    readiness,
    hasLog: log.length > 0,
    logSize: log.length,
    firstDay,
  }
  result.insights = buildInsights(result, now)
  return result
}

// ---- helpers -------------------------------------------------------------

function ensure(map, key, make) {
  let v = map.get(key)
  if (!v) {
    v = make()
    map.set(key, v)
  }
  return v
}

function buildDailySeries(days, now, activity, logByDay) {
  const out = []
  const base = new Date(now)
  base.setHours(0, 0, 0, 0)
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(base)
    d.setDate(base.getDate() - i)
    const key = ymd(d.getTime())
    const l = logByDay.get(key)
    out.push({
      key,
      label: `${d.getDate()}/${d.getMonth() + 1}`,
      answers: activity[key] || l?.n || 0,
      correct: l?.ok ?? null,
      acc: l && l.n ? (l.ok / l.n) * 100 : null,
      avgMs: l && l.timed ? l.ms / l.timed : null,
    })
  }
  return out
}

// Calendar cells padded to whole weeks (column = week, row 0 = Sunday).
function buildHeat(weeks, now, activity, logByDay) {
  const end = new Date(now)
  end.setHours(0, 0, 0, 0)
  const start = new Date(end)
  start.setDate(end.getDate() - (weeks * 7 - 1))
  start.setDate(start.getDate() - start.getDay()) // back up to Sunday
  const cells = []
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const key = ymd(d.getTime())
    const l = logByDay.get(key)
    cells.push({
      key,
      count: activity[key] || l?.n || 0,
      acc: l && l.n ? (l.ok / l.n) * 100 : null,
    })
  }
  return cells
}

function sumDays(activity, now, days) {
  let s = 0
  for (let i = 0; i < days; i++) s += activity[ymd(now - i * DAY_MS)] || 0
  return s
}

function countNewSince(firstSeen, since) {
  let n = 0
  for (const [, t] of firstSeen) if (t >= since) n += 1
  return n
}

// ---- insights ------------------------------------------------------------
// Small rule engine: each rule looks at the computed metrics and, when it
// fires, returns a card. `ids` (when present) turns the card into a drill.

function buildInsights(a, now) {
  const out = []
  const push = (tone, title, text, extra = {}) => out.push({ tone, title, text, ...extra })

  const { core, readiness, pace, srs, exams, time, streak } = a

  if (readiness.weakestPillar && core.seen >= 20) {
    const p = readiness.weakestPillar
    push('info', `Pilar mais fraco: ${p.label}`, `${Math.round(p.value)}/100 · ${p.hint}. É onde o próximo ponto de readiness sai mais barato.`)
  }

  const weakDomain = a.domains.filter((d) => d.seen >= 8).sort((x, y) => x.hitRate - y.hitRate)[0]
  if (weakDomain && weakDomain.hitRate < 70) {
    push('bad', `${weakDomain.code} está abaixo da linha de corte`, `${Math.round(weakDomain.hitRate)}% de acerto em ${weakDomain.seen} questões — ${weakDomain.name}.`, {
      drill: { kind: 'domain', code: weakDomain.code, title: `Domínio · ${weakDomain.code}` },
    })
  }

  const thinDomain = a.domains.filter((d) => d.bank >= 20).sort((x, y) => x.coverage - y.coverage)[0]
  if (thinDomain && thinDomain.coverage < 50) {
    push('warn', `Cobertura baixa em ${thinDomain.code}`, `Você viu só ${Math.round(thinDomain.coverage)}% das ${thinDomain.bank} questões desse domínio.`, {
      drill: { kind: 'domain-new', code: thinDomain.code, title: `${thinDomain.code} · não respondidas` },
    })
  }

  if (core.notSolved >= 5) {
    push('warn', `${core.notSolved} questões nunca acertadas`, 'Elas continuam contando contra o seu domínio até você fechar cada uma.', {
      drill: { kind: 'unsolved', title: 'Ainda sem acerto' },
    })
  }

  if (srs.leechCount >= 3) {
    push('bad', `${srs.leechCount} questões viciadas`, 'Erradas 2+ vezes depois de já terem sido acertadas — normalmente é conceito mal entendido, não distração.', {
      drill: { kind: 'leeches', title: 'Questões viciadas' },
    })
  }

  if (a.stale.length) {
    const t = a.stale[0]
    push('warn', `"${t.name}" está esfriando`, `${t.staleDays} dias sem tocar e ${Math.round(t.hitRate)}% de acerto.`, {
      drill: { kind: 'topic', code: t.code, title: `Tópico · ${t.name}` },
    })
  }

  if (core.firstTryRate != null && core.firstTrySample >= 30 && core.firstTryRate < 60) {
    push('info', 'Acerto de primeira ainda baixo', `${Math.round(core.firstTryRate)}% das questões você acerta na primeira tentativa — o resto você só fecha revendo.`)
  }

  if (pace.deltaAcc != null && Math.abs(pace.deltaAcc) >= 5 && pace.last7.n >= 15) {
    const up = pace.deltaAcc > 0
    push(up ? 'good' : 'warn', up ? 'Ritmo em alta' : 'Queda de rendimento', `Acerto dos últimos 7 dias ${up ? 'subiu' : 'caiu'} ${Math.abs(Math.round(pace.deltaAcc))} pts contra a semana anterior.`)
  }

  if (pace.daysToFinish != null && core.remaining > 0) {
    const eta = new Date(pace.finishEta)
    push('info', `Banco completo em ~${pace.daysToFinish} dias`, `No ritmo de ${pace.newPerDay7.toFixed(1)} questões novas/dia você fecha as ${core.remaining} restantes por volta de ${eta.toLocaleDateString('pt-BR')}.`)
  } else if (core.remaining > 0 && pace.volume7 === 0) {
    push('warn', 'Sem questões novas esta semana', `Faltam ${core.remaining} questões que você nunca viu.`, {
      drill: { kind: 'unseen', title: 'Ainda não respondidas' },
    })
  }

  if (time.speedAccuracy != null && time.speedAccuracy < -0.15 && time.sample >= 40) {
    push('info', 'Você acerta mais quando corre', 'Respostas rápidas estão saindo melhores — sinal de que as demoradas são as que você realmente não sabe.')
  } else if (time.speedAccuracy != null && time.speedAccuracy > 0.15 && time.sample >= 40) {
    push('warn', 'Pressa está custando pontos', `Suas respostas erradas levam ${fmtSec(time.medianBadMs)} contra ${fmtSec(time.medianOkMs)} das certas — desacelerar deve render.`)
  }

  if (exams.count === 0 && core.seen >= 60) {
    push('info', 'Hora do primeiro simulado', 'Você já tem base suficiente; o simulado é o que calibra o readiness de verdade.')
  } else if (exams.count >= 3 && exams.slope > 1.5) {
    push('good', 'Simulados subindo', `Tendência de +${exams.slope.toFixed(1)} pts por prova · média das últimas 5: ${Math.round(exams.last5Avg)}%.`)
  } else if (exams.count >= 3 && exams.slope < -1.5) {
    push('warn', 'Simulados caindo', `Tendência de ${exams.slope.toFixed(1)} pts por prova — vale revisar antes de fazer o próximo.`)
  }

  if (srs.due >= 20) {
    push('warn', `${srs.due} revisões vencidas`, 'A fila do SRS acumulada é o jeito mais rápido de perder o que já foi aprendido.')
  }

  if (streak.current >= 7) {
    push('good', `${streak.current} dias seguidos`, `Consistência de ${Math.round(streak.consistency)}% desde o primeiro dia de estudo.`)
  } else if (streak.current === 0 && streak.activeDays > 3) {
    push('warn', 'Sequência zerada', 'Responder uma única questão hoje já reinicia o contador.')
  }

  if (a.bestHour && a.worstHour && a.bestHour.h !== a.worstHour.h && a.bestHour.acc - a.worstHour.acc >= 12) {
    push('info', `Seu melhor horário é ${String(a.bestHour.h).padStart(2, '0')}h`, `${Math.round(a.bestHour.acc)}% de acerto contra ${Math.round(a.worstHour.acc)}% às ${String(a.worstHour.h).padStart(2, '0')}h.`)
  }

  const gapBucket = a.byCoverage.find((b) => b.key === 'pouco ensinado (gap)')
  if (gapBucket && gapBucket.seen >= 10 && gapBucket.hitRate != null && gapBucket.hitRate < 65) {
    push('warn', 'Os gaps do curso estão cobrando', `${Math.round(gapBucket.hitRate)}% nas questões pouco cobertas pelo curso, ${gapBucket.seen} respondidas.`, {
      drill: { kind: 'gaps', title: 'Study the Gaps' },
    })
  }

  if (!out.length) push('info', 'Sem alertas', 'Responda mais algumas questões para o painel começar a apontar padrões.')
  return out.slice(0, 8)
}

function fmtSec(ms) {
  return `${Math.round((ms || 0) / 1000)}s`
}
