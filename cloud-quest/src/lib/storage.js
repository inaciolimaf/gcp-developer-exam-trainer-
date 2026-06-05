// Tiny localStorage-backed progress + gamification store.
// Everything is client-side; no account, no server.

const KEY = 'cloudquest.v1'

const DEFAULT = {
  xp: 0,
  streak: 0, // consecutive correct answers (resets on wrong)
  bestStreak: 0,
  answered: {}, // id -> { correct: bool, count: number }
  examsTaken: 0,
  examsPassed: 0,
  badges: [], // array of badge ids
  examHistory: [], // [{ date, correct, total, pct, passed }]
  daily: { date: null, count: 0 }, // questions answered today
  dayStreak: 0, // consecutive days with activity
  bestDayStreak: 0,
  lastActiveDate: null, // YYYY-MM-DD of last active day
  dailyGoal: 10,
  activityLog: {}, // YYYY-MM-DD -> questions answered that day (for heatmap)
}

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...DEFAULT }
    return { ...DEFAULT, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT }
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* storage full / disabled — ignore */
  }
}

export function resetState() {
  localStorage.removeItem(KEY)
  return { ...DEFAULT }
}

// XP curve: each level needs a bit more than the last.
export function levelInfo(xp) {
  let level = 1
  let need = 100
  let acc = 0
  while (xp >= acc + need) {
    acc += need
    level += 1
    need = Math.round(need * 1.25)
  }
  const into = xp - acc
  return { level, into, need, pct: Math.min(100, Math.round((into / need) * 100)) }
}

export const LEVEL_TITLES = [
  'Initiate',
  'Operator',
  'Engineer',
  'Architect',
  'Specialist',
  'Virtuoso',
  'Sage',
  'Legend',
]

export function levelTitle(level) {
  return LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)]
}

// Record one answer, mutating + returning a fresh state object.
export function recordAnswer(state, q, isCorrect, xpGain) {
  const prev = state.answered[q.id] || { correct: false, count: 0 }
  const answered = {
    ...state.answered,
    [q.id]: { correct: prev.correct || isCorrect, count: prev.count + 1 },
  }
  const streak = isCorrect ? state.streak + 1 : 0
  return {
    ...state,
    answered,
    xp: state.xp + (isCorrect ? xpGain : 0),
    streak,
    bestStreak: Math.max(state.bestStreak, streak),
  }
}

// ---- Exam history -------------------------------------------------------

export function recordExam(state, { correct, total, pct, passed }) {
  const entry = { date: new Date().toISOString(), correct, total, pct, passed }
  const examHistory = [...(state.examHistory || []), entry].slice(-100)
  return { ...state, examHistory }
}

export function examStats(state) {
  const h = state.examHistory || []
  if (!h.length) return { count: 0, passed: 0, passRate: 0, best: 0, avg: 0, last: null }
  const passed = h.filter((e) => e.passed).length
  return {
    count: h.length,
    passed,
    passRate: Math.round((passed / h.length) * 100),
    best: Math.max(...h.map((e) => e.pct)),
    avg: Math.round(h.reduce((s, e) => s + e.pct, 0) / h.length),
    last: h[h.length - 1],
  }
}

// ---- Daily goal & study-day streak --------------------------------------

function ymd(ts) {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Count n answered questions toward today's goal; bump the day streak the
// first time there's activity on a new calendar day.
export function recordActivity(state, n = 1, now = Date.now()) {
  const today = ymd(now)
  const log = { ...(state.activityLog || {}) }
  log[today] = (log[today] || 0) + n
  const daily = state.daily || { date: null, count: 0 }
  if (daily.date === today) {
    return { ...state, daily: { date: today, count: daily.count + n }, activityLog: log }
  }
  const yesterday = ymd(now - 86_400_000)
  const streak = state.lastActiveDate === yesterday ? (state.dayStreak || 0) + 1 : 1
  return {
    ...state,
    daily: { date: today, count: n },
    dayStreak: streak,
    bestDayStreak: Math.max(state.bestDayStreak || 0, streak),
    lastActiveDate: today,
    activityLog: log,
  }
}

// Streak only counts if the last active day was today or yesterday.
export function currentDayStreak(state, now = Date.now()) {
  const today = ymd(now)
  const yesterday = ymd(now - 86_400_000)
  if (state.lastActiveDate === today || state.lastActiveDate === yesterday) return state.dayStreak || 0
  return 0
}

export function dailyProgress(state, now = Date.now()) {
  const today = ymd(now)
  const daily = state.daily || { date: null, count: 0 }
  const count = daily.date === today ? daily.count : 0
  const goal = state.dailyGoal || 10
  return { count, goal, pct: Math.min(100, Math.round((count / goal) * 100)), met: count >= goal }
}

export const BADGES = [
  { id: 'first-blood', name: 'First Correct', emoji: '🎯', test: (s) => correctCount(s) >= 1 },
  { id: 'streak-5', name: 'Hot Streak', emoji: '🔥', test: (s) => s.bestStreak >= 5 },
  { id: 'streak-15', name: 'On Fire', emoji: '🌋', test: (s) => s.bestStreak >= 15 },
  { id: 'fifty', name: 'Half-Century', emoji: '🏏', test: (s) => correctCount(s) >= 50 },
  { id: 'two-hundred', name: 'Double Ton', emoji: '💪', test: (s) => correctCount(s) >= 200 },
  { id: 'exam-pass', name: 'Exam Slayer', emoji: '🛡️', test: (s) => s.examsPassed >= 1 },
  { id: 'exam-ace', name: 'Perfect Mock', emoji: '👑', test: (s) => (s.badges || []).includes('exam-ace') },
  { id: 'daily-goal', name: 'Daily Goal', emoji: '✅', test: (s) => dailyProgress(s).met },
  { id: 'week-streak', name: 'Seven-Day Streak', emoji: '📅', test: (s) => currentDayStreak(s) >= 7 },
  { id: 'completionist', name: 'Bank Breaker', emoji: '🏆', test: (s) => seenCount(s) >= 741 },
]

export function correctCount(s) {
  return Object.values(s.answered).filter((a) => a.correct).length
}
export function seenCount(s) {
  return Object.keys(s.answered).length
}

// ---- Study Guide checklist (separate key) -------------------------------

const GUIDE_KEY = 'cloudquest.guide.v1'

export function loadGuideDone() {
  try {
    return new Set(JSON.parse(localStorage.getItem(GUIDE_KEY) || '[]'))
  } catch {
    return new Set()
  }
}

export function saveGuideDone(set) {
  try {
    localStorage.setItem(GUIDE_KEY, JSON.stringify([...set]))
  } catch {
    /* ignore */
  }
}

// ---- Flashcards progress (separate key) ---------------------------------
// Tracks which cards the user has marked "got it" vs "again", independent of
// the question bank so it never pollutes the 741-question gamification.

const FC_KEY = 'cloudquest.flashcards.v1'

export function loadFlashProgress() {
  try {
    return JSON.parse(localStorage.getItem(FC_KEY) || '{}')
  } catch {
    return {}
  }
}

export function saveFlashProgress(progress) {
  try {
    localStorage.setItem(FC_KEY, JSON.stringify(progress))
  } catch {
    /* ignore */
  }
}

export function resetFlashProgress() {
  localStorage.removeItem(FC_KEY)
}

// Mark one flashcard. known=true => mastered. Returns fresh progress object.
export function markFlashcard(progress, id, known) {
  const prev = progress[id] || { known: false, reviews: 0 }
  return {
    ...progress,
    [id]: { known, reviews: prev.reviews + 1 },
  }
}

export function flashMasteredCount(progress) {
  return Object.values(progress).filter((c) => c.known).length
}

// Award raw XP (used by flashcards) without touching the answered map.
export function addXp(state, amount) {
  return { ...state, xp: state.xp + amount }
}

// ---- Sync (copy/paste a code between machines) --------------------------
// All progress lives in a handful of localStorage keys. We pack them into a
// single base64 string so you can copy it on one OS and paste it on the other
// (Linux <-> Windows dual boot) without any server, account or file.

const SYNC_KEYS = [
  KEY, // cloudquest.v1 — XP, streak, answered, exams, badges, activity
  GUIDE_KEY, // study-guide checklist
  FC_KEY, // flashcards progress
  'cloudquest.srs.v1', // spaced-repetition schedule
  // prefs (harmless if absent)
  'lessons_lang',
  'q_lang',
  'cq_hq_only',
]

// utf-8 safe base64 (handles any accents that might sneak in)
function b64encode(str) {
  return btoa(unescape(encodeURIComponent(str)))
}
function b64decode(str) {
  return decodeURIComponent(escape(atob(str)))
}

// Bundle every progress key into one copy-pasteable code.
export function exportProgress() {
  const bag = {}
  for (const k of SYNC_KEYS) {
    const v = localStorage.getItem(k)
    if (v !== null) bag[k] = v
  }
  const payload = { v: 1, ts: new Date().toISOString(), data: bag }
  return b64encode(JSON.stringify(payload))
}

// Restore from a code produced by exportProgress(). Throws on bad input.
// Returns the number of keys restored. Caller should reload the page after.
export function importProgress(code) {
  const clean = (code || '').trim()
  if (!clean) throw new Error('empty')
  const payload = JSON.parse(b64decode(clean))
  if (!payload || typeof payload.data !== 'object') throw new Error('invalid')
  let n = 0
  for (const k of SYNC_KEYS) {
    if (Object.prototype.hasOwnProperty.call(payload.data, k)) {
      localStorage.setItem(k, payload.data[k])
      n++
    }
  }
  return n
}

// Returns { state, newBadges } after re-checking all badges.
export function refreshBadges(state) {
  const have = new Set(state.badges)
  const newBadges = []
  for (const b of BADGES) {
    if (!have.has(b.id) && b.test(state)) {
      have.add(b.id)
      newBadges.push(b)
    }
  }
  return { state: { ...state, badges: [...have] }, newBadges }
}
