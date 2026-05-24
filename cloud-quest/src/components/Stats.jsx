import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, BarChart3, Layers, TrendingUp, TrendingDown, Flame, CalendarDays, Gauge } from 'lucide-react'
import { shuffle, DOMAIN_LABELS } from '../lib/data'
import { examStats, currentDayStreak } from '../lib/storage'
import { srsStats } from '../lib/srs'

const HEAT_WEEKS = 18

function ymd(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function Stats({ bank, state, srs, onStartQuestions, onBack }) {
  const answered = state.answered || {}

  const data = useMemo(() => {
    const byId = new Map(bank.questions.map((q) => [q.id, q]))
    const seen = Object.keys(answered).length
    let solved = 0
    const dom = new Map()
    const top = new Map()
    for (const [id, a] of Object.entries(answered)) {
      const q = byId.get(id)
      if (!q) continue
      const ok = a.correct ? 1 : 0
      solved += ok
      const d = dom.get(q.domain) || { code: q.domain, name: q.domainName, seen: 0, solved: 0 }
      d.seen += 1
      d.solved += ok
      dom.set(q.domain, d)
      const t = top.get(q.topicCode) || { code: q.topicCode, name: q.topicName, seen: 0, solved: 0 }
      t.seen += 1
      t.solved += ok
      top.set(q.topicCode, t)
    }
    const domains = [...dom.values()].sort((a, b) => String(a.code).localeCompare(String(b.code)))
    const topics = [...top.values()].filter((t) => t.seen >= 2).map((t) => ({ ...t, ratio: t.solved / t.seen }))
    const strongest = [...topics].sort((a, b) => b.ratio - a.ratio || b.seen - a.seen).slice(0, 5)
    const weakest = [...topics].sort((a, b) => a.ratio - b.ratio || b.seen - a.seen).slice(0, 5)
    return { seen, solved, domains, strongest, weakest }
  }, [bank.questions, answered])

  const total = bank.indexes.total
  const exams = examStats(state)
  const srsM = srsStats(srs)
  const accuracy = data.seen ? data.solved / data.seen : 0
  const coverage = data.seen / total
  const base = 0.6 * accuracy + 0.4 * coverage
  const readiness = Math.round(100 * (exams.count ? 0.75 * base + 0.25 * (exams.avg / 100) : base))
  const verdict =
    readiness >= 80
      ? { label: 'Exam-ready', tint: 'text-mint', stroke: '#34d399' }
      : readiness >= 65
        ? { label: 'Almost there', tint: 'text-cyan', stroke: '#22d3ee' }
        : readiness >= 40
          ? { label: 'Building up', tint: 'text-amber', stroke: '#fbbf24' }
          : { label: 'Just starting', tint: 'text-coral', stroke: '#fb7185' }

  // heatmap cells (oldest → newest), column-major weeks
  const heat = useMemo(() => {
    const log = state.activityLog || {}
    const base = new Date()
    base.setHours(0, 0, 0, 0)
    const cells = HEAT_WEEKS * 7
    const out = []
    for (let i = cells - 1; i >= 0; i--) {
      const d = new Date(base)
      d.setDate(base.getDate() - i)
      const key = ymd(d)
      out.push({ key, count: log[key] || 0 })
    }
    return out
  }, [state.activityLog])

  const dayStreak = currentDayStreak(state)
  const empty = data.seen === 0

  const drill = (questions, title) => questions.length && onStartQuestions(title, shuffle(questions))

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-6">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={onBack} className="btn">
          <ArrowLeft size={16} /> Home
        </button>
        <div className="flex items-center gap-2 font-display text-xl font-bold text-white">
          <BarChart3 size={20} className="text-cyan" /> Statistics
        </div>
      </div>

      {empty ? (
        <div className="glass-strong flex flex-col items-center gap-3 p-10 text-center shadow-glow-soft">
          <Gauge size={40} className="text-cyan" />
          <h2 className="font-display text-2xl font-bold text-white">No data yet</h2>
          <p className="max-w-sm font-body text-white/55">
            Answer some questions and this dashboard fills with your accuracy by domain and topic, a readiness
            estimate, and a study-activity heatmap.
          </p>
        </div>
      ) : (
        <>
          {/* readiness + key metrics */}
          <div className="mb-6 grid gap-4 sm:grid-cols-[auto_1fr]">
            <div className="glass-strong flex items-center gap-5 p-6 shadow-glow-soft">
              <Gauge2 pct={readiness} stroke={verdict.stroke} />
              <div>
                <div className="label">Exam readiness</div>
                <div className={`font-display text-2xl font-bold ${verdict.tint}`}>{verdict.label}</div>
                <div className="mt-1 font-body text-xs text-white/45">estimate · keep practicing</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
              <Metric label="Accuracy" value={`${Math.round(accuracy * 100)}%`} sub={`${data.solved}/${data.seen} solved`} tint="text-mint" />
              <Metric label="Coverage" value={`${Math.round(coverage * 100)}%`} sub={`${data.seen}/${total} seen`} tint="text-cyan" />
              <Metric label="Exam avg" value={exams.count ? `${exams.avg}%` : '—'} sub={`${exams.count} taken`} tint="text-amber" />
              <Metric label="SRS mastered" value={srsM.mastered} sub={`${srsM.scheduled} scheduled`} tint="text-violet" />
            </div>
          </div>

          {/* domain breakdown */}
          <div className="glass mb-6 p-5">
            <div className="mb-4 flex items-center gap-2 label">
              <Layers size={14} /> Accuracy by exam domain
            </div>
            <div className="grid gap-3">
              {data.domains.map((d) => {
                const pct = Math.round((d.solved / d.seen) * 100)
                return (
                  <button
                    key={d.code}
                    onClick={() => drill(bank.questions.filter((q) => q.domain === d.code), `Domain · ${d.code}`)}
                    className="group flex items-center gap-3 text-left"
                  >
                    <span className="w-8 shrink-0 font-mono text-xs font-bold text-violet">{d.code}</span>
                    <span className="hidden min-w-0 flex-1 truncate font-body text-sm text-white/70 group-hover:text-white sm:block">
                      {DOMAIN_LABELS[d.code] || d.name}
                    </span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full border border-white/10 bg-white/[0.04] sm:flex-none sm:w-48">
                      <div
                        className={`h-full rounded-full ${pct < 50 ? 'bg-coral' : pct < 70 ? 'bg-amber' : 'bg-mint'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-14 shrink-0 text-right font-mono text-xs text-white/60">
                      {pct}% · {d.solved}/{d.seen}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* activity heatmap */}
          <div className="glass mb-6 p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2 label">
                <CalendarDays size={14} /> Activity · last {HEAT_WEEKS} weeks
              </span>
              <span className="chip border-amber/40 text-amber">
                <Flame size={13} /> {dayStreak} day{dayStreak === 1 ? '' : 's'}
              </span>
            </div>
            <div className="overflow-x-auto">
              <div className="grid grid-flow-col grid-rows-7 gap-1" style={{ width: 'max-content' }}>
                {heat.map((c) => (
                  <div
                    key={c.key}
                    title={`${c.key} · ${c.count} answered`}
                    className="h-3 w-3 rounded-sm"
                    style={{ background: heatColor(c.count) }}
                  />
                ))}
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 label">
              less
              {[0, 3, 7, 12, 20].map((n) => (
                <span key={n} className="h-3 w-3 rounded-sm" style={{ background: heatColor(n) }} />
              ))}
              more
            </div>
          </div>

          {/* strongest / weakest topics */}
          <div className="grid gap-4 sm:grid-cols-2">
            <TopicList title="Strongest topics" icon={TrendingUp} tint="text-mint" rows={data.strongest} onPick={(code, name) => drill(bank.questions.filter((q) => q.topicCode === code), `Topic · ${name}`)} />
            <TopicList title="Needs work" icon={TrendingDown} tint="text-coral" rows={data.weakest} onPick={(code, name) => drill(bank.questions.filter((q) => q.topicCode === code), `Topic · ${name}`)} />
          </div>
        </>
      )}
    </div>
  )
}

function heatColor(n) {
  if (n <= 0) return 'rgba(255,255,255,0.05)'
  if (n < 4) return 'rgba(52,211,153,0.30)'
  if (n < 8) return 'rgba(52,211,153,0.52)'
  if (n < 15) return 'rgba(52,211,153,0.78)'
  return 'rgba(52,211,153,1)'
}

function Gauge2({ pct, stroke }) {
  const r = 34
  const c = 2 * Math.PI * r
  const off = c * (1 - Math.min(pct, 100) / 100)
  return (
    <span className="relative grid h-24 w-24 shrink-0 place-items-center">
      <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
        <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
        <motion.circle
          cx="48"
          cy="48"
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: off }}
          transition={{ type: 'spring', stiffness: 80, damping: 18 }}
        />
      </svg>
      <span className="absolute font-mono text-2xl font-bold text-white">{pct}</span>
    </span>
  )
}

function Metric({ label, value, sub, tint }) {
  return (
    <div className="glass flex flex-col justify-center p-3.5">
      <div className={`font-mono text-2xl font-bold leading-none ${tint}`}>{value}</div>
      <div className="mt-1.5 label">{label}</div>
      <div className="mt-0.5 font-body text-xs text-white/40">{sub}</div>
    </div>
  )
}

function TopicList({ title, icon: Icon, tint, rows, onPick }) {
  return (
    <div className="glass p-5">
      <div className={`mb-3 flex items-center gap-2 label ${tint}`}>
        <Icon size={14} /> {title}
      </div>
      {rows.length === 0 ? (
        <p className="font-body text-sm text-white/40">Answer a few more to rank topics.</p>
      ) : (
        <ul className="space-y-1.5">
          {rows.map((t) => {
            const pct = Math.round(t.ratio * 100)
            return (
              <li key={t.code}>
                <button
                  onClick={() => onPick(t.code, t.name)}
                  className="group flex w-full items-center gap-3 rounded-lg px-1 py-1 text-left transition-colors hover:bg-white/[0.05]"
                >
                  <span className="min-w-0 flex-1 truncate font-body text-sm text-white/80">{t.name}</span>
                  <span className={`shrink-0 font-mono text-xs font-bold ${pct < 50 ? 'text-coral' : pct < 70 ? 'text-amber' : 'text-mint'}`}>
                    {pct}%
                  </span>
                  <span className="shrink-0 font-mono text-[11px] text-white/40">{t.solved}/{t.seen}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
