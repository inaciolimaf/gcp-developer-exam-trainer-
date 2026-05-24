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

export const BADGES = [
  { id: 'first-blood', name: 'First Correct', emoji: '🎯', test: (s) => correctCount(s) >= 1 },
  { id: 'streak-5', name: 'Hot Streak', emoji: '🔥', test: (s) => s.bestStreak >= 5 },
  { id: 'streak-15', name: 'On Fire', emoji: '🌋', test: (s) => s.bestStreak >= 15 },
  { id: 'fifty', name: 'Half-Century', emoji: '🏏', test: (s) => correctCount(s) >= 50 },
  { id: 'two-hundred', name: 'Double Ton', emoji: '💪', test: (s) => correctCount(s) >= 200 },
  { id: 'exam-pass', name: 'Exam Slayer', emoji: '🛡️', test: (s) => s.examsPassed >= 1 },
  { id: 'exam-ace', name: 'Perfect Mock', emoji: '👑', test: (s) => (s.badges || []).includes('exam-ace') },
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
