// Loads and indexes the GCP question bank that lives in /public/all_questions.json

let _cache = null

export async function loadBank() {
  if (_cache) return _cache
  const res = await fetch(`${import.meta.env.BASE_URL}all_questions.json`)
  if (!res.ok) throw new Error(`Failed to load question bank (${res.status})`)
  const data = await res.json()
  const questions = (data.questions || []).map(normalize)
  _cache = { meta: data.metadata || {}, questions, indexes: buildIndexes(questions) }
  return _cache
}

// Flatten the rich nested fields into something the UI consumes easily.
function normalize(q) {
  const t = q.topics || {}
  const cr = q.course_reference || {}
  return {
    id: q.id,
    number: q.question_number,
    question: q.question,
    options: q.options || [],
    answer: q.correct_answer,
    answerText: q.correct_text,
    explanation: q.explanation || '',
    images: q.images || [],
    topicCode: t.primary || 'MISC',
    topicName: t.primary_name || t.primary || 'Miscellaneous',
    topicsAll: t.all || [],
    domain: t.exam_domain || '—',
    domainName: t.exam_domain_name || '',
    modules: (cr.primary_modules || []).map((m) => ({ id: m.module, title: m.title })),
    coverage: cr.coverage || 'unknown',
    bestLectures: cr.best_lectures || [],
  }
}

function buildIndexes(questions) {
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
