// Loads and indexes the GCP question bank that lives in /public/all_questions.json

let _cache = null

const EMPTY_SET = new Set()

// HipLocal case-study questions (26). The HipLocal case study was dropped from
// the current Professional Cloud Developer exam (the April 2026 official exam
// guide lists no case study), so we exclude them from the whole app.
//  - std-cep-q*: the original case-study questions (4–5k chars, prefixed
//    "This is a case study").
//  - rw4-vmexam-*: still say "HipLocal" literally.
//  - rw1-cep-*: long rewritten versions (CivicCircles, NeighborNet, CityConnect,
//    Brookline Hub, PineLoop) that reuse the same HipLocal scenario.
export const EXCLUDED_IDS = new Set([
  // original case-study questions
  'std-cep-q042', 'std-cep-q043', 'std-cep-q044', 'std-cep-q045', 'std-cep-q046',
  'std-cep-q047', 'std-cep-q048', 'std-cep-q049', 'std-cep-q079', 'std-cep-q080',
  'std-cep-q081', 'std-cep-q082', 'std-cep-q166', 'std-cep-q167', 'std-cep-q168',
  'std-cep-q185', 'std-cep-q186', 'std-cep-q187', 'std-cep-q188',
  // literal HipLocal
  'rw4-vmexam-q006', 'rw4-vmexam-q009',
  // rewritten HipLocal (long scenario)
  'rw1-cep-e3-q005', 'rw1-cep-e4-q026', 'rw1-cep-e4-q045', 'rw1-cep-e5-q040', 'rw1-cep-e5-q049',
])

export async function loadBank() {
  if (_cache) return _cache
  const [res, manRes] = await Promise.all([
    fetch(`${import.meta.env.BASE_URL}all_questions.json`),
    fetch(`${import.meta.env.BASE_URL}q-audio/manifest.json`).catch(() => null),
  ])
  if (!res.ok) throw new Error(`Failed to load question bank (${res.status})`)
  const data = await res.json()
  let enSet = EMPTY_SET
  let ptSet = EMPTY_SET
  if (manRes && manRes.ok) {
    try {
      const m = await manRes.json()
      enSet = new Set(m.en || [])
      ptSet = new Set(m.pt || [])
    } catch {
      /* no audio manifest — buttons just won't show */
    }
  }
  const questions = (data.questions || [])
    .filter((q) => !EXCLUDED_IDS.has(q.id))
    .map((q) => normalize(q, enSet, ptSet))
  _cache = { meta: data.metadata || {}, questions, indexes: buildIndexes(questions) }
  return _cache
}

// Flatten the rich nested fields into something the UI consumes easily.
function normalize(q, enSet = EMPTY_SET, ptSet = EMPTY_SET) {
  const audioId = String(q.id || '').replace(/[^A-Za-z0-9_-]/g, '_')
  const t = q.topics || {}
  const cr = q.course_reference || {}
  const correctSet = String(q.correct_answer || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  return {
    id: q.id,
    number: q.question_number,
    question: q.question,
    options: q.options || [],
    answer: q.correct_answer,
    correctSet, // e.g. ["A"] or ["A","F"]
    multi: correctSet.length > 1,
    answerText: q.correct_text,
    explanation: q.explanation || '',
    explanationPt: q.explanation_pt || '',
    audioId,
    audioEn: enSet.has(audioId),
    audioPt: ptSet.has(audioId),
    images: q.images || [],
    topicCode: t.primary || 'MISC',
    topicName: t.primary_name || t.primary || 'Miscellaneous',
    topicsAll: t.all || [],
    domain: t.exam_domain || '—',
    domainName: t.exam_domain_name || '',
    modules: (cr.primary_modules || []).map((m) => ({ id: m.module, title: m.title })),
    coverage: cr.coverage || 'unknown',
    bestLectures: cr.best_lectures || [],
    quality: q.quality || 'standard',
    highQuality: q.quality === 'high',
    needsEnrichment: !!q.needs_enrichment,
  }
}

// ---- Flashcards ----------------------------------------------------------
// Loads the GCP service/concept flashcards (term → short description) that
// live in /public/flashcards.json, derived from the Anki cheatsheet deck.

let _fcCache = null

export async function loadFlashcards() {
  if (_fcCache) return _fcCache
  const res = await fetch(`${import.meta.env.BASE_URL}flashcards.json`)
  if (!res.ok) throw new Error(`Failed to load flashcards (${res.status})`)
  const data = await res.json()
  const cards = data.cards || []
  const cats = new Map()
  for (const c of cards) bump(cats, c.category, { code: c.category, name: c.category })
  const categories = [...cats.values()].sort((a, b) => b.count - a.count)
  _fcCache = {
    meta: data.meta || {},
    cards,
    categories,
    total: cards.length,
    newCount: cards.filter((c) => c.isNew).length,
  }
  return _fcCache
}

export function buildIndexes(questions) {
  const domains = new Map()
  const topics = new Map()
  const modules = new Map()
  const coverage = new Map()

  for (const q of questions) {
    bump(domains, q.domain, { code: q.domain, name: q.domainName })
    bump(topics, q.topicCode, { code: q.topicCode, name: q.topicName })
    bump(coverage, q.coverage, { code: q.coverage })
    for (const m of q.modules) bump(modules, m.id, { code: m.id, name: m.title })
  }

  const toSorted = (map, by = 'count') =>
    [...map.values()].sort((a, b) =>
      by === 'count' ? b.count - a.count : String(a.code).localeCompare(String(b.code), undefined, { numeric: true }),
    )

  return {
    domains: toSorted(domains, 'code'),
    topics: toSorted(topics),
    modules: toSorted(modules, 'code'),
    coverage: toSorted(coverage),
    total: questions.length,
  }
}

function bump(map, key, base) {
  if (!key && key !== 0) return
  const cur = map.get(key)
  if (cur) cur.count += 1
  else map.set(key, { ...base, count: 1 })
}

// ---- helpers -------------------------------------------------------------

// Normalize a given answer to an array of letters (handles single & multi).
export function asLetters(given) {
  return Array.isArray(given) ? given : given ? [given] : []
}

export function hasAnswer(given) {
  return asLetters(given).length > 0
}

// True if `given` matches the question's correct set (order-independent).
export function isAnswerCorrect(q, given) {
  const correct = q.correctSet && q.correctSet.length ? q.correctSet : [q.answer]
  const g = asLetters(given)
  if (q.multi) return g.length === correct.length && correct.every((l) => g.includes(l))
  return g.length === 1 && g[0] === correct[0]
}

export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function sample(arr, n) {
  return shuffle(arr).slice(0, n)
}

export const COVERAGE_LABELS = {
  ensinado: 'Taught in course',
  'pouco ensinado (gap)': 'Light coverage (gap)',
  'ausente do curso': 'Not in course',
  unknown: 'Uncategorized',
}

export const DOMAIN_LABELS = {
  S1: 'Design scalable, secure & reliable apps',
  S2: 'Build & test applications',
  S3: 'Configure apps for deployment',
  S4: 'Integrate apps with Google Cloud services',
}
