// Lightweight Leitner-box spaced-repetition scheduler.
// One shared store keyed by item id — question ids (e.g. "rw1-...") and
// flashcard ids ("fc-...") live in the same map but are told apart by prefix.
// Every time you answer a question or grade a card, the item is (re)scheduled.

const KEY = 'cloudquest.srs.v1'
const DAY = 86_400_000

// interval (in days) the item waits before it's due again, per box.
// box 0 = "again" → due immediately; higher boxes wait longer.
const INTERVALS = [0, 1, 3, 7, 16, 35]
export const MAX_BOX = INTERVALS.length - 1

export function loadSrs() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}')
  } catch {
    return {}
  }
}

export function saveSrs(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}

export function resetSrs() {
  localStorage.removeItem(KEY)
}

// Promote on success, reset to box 0 on failure. Returns a fresh store.
export function scheduleItem(state, id, correct, now = Date.now()) {
  const prev = state[id] || { box: 0, reps: 0, lapses: 0 }
  const box = correct ? Math.min(prev.box + 1, MAX_BOX) : 0
  return {
    ...state,
    [id]: {
      box,
      reps: prev.reps + 1,
      lapses: prev.lapses + (correct ? 0 : 1),
      last: now,
      due: now + INTERVALS[box] * DAY,
    },
  }
}

export function isDue(state, id, now = Date.now()) {
  const it = state[id]
  return !!it && it.due <= now
}

export const isCard = (id) => typeof id === 'string' && id.startsWith('fc-')

// Split all currently-due ids into questions vs flashcards.
export function dueIds(state, now = Date.now()) {
  const q = []
  const c = []
  for (const [id, it] of Object.entries(state)) {
    if (it.due <= now) (isCard(id) ? c : q).push(id)
  }
  return { questions: q, cards: c }
}

// Aggregate counts for the dashboard.
export function srsStats(state, now = Date.now()) {
  let dueQ = 0
  let dueC = 0
  let scheduled = 0
  let mastered = 0 // sitting in a long-interval box
  for (const [id, it] of Object.entries(state)) {
    scheduled += 1
    if (it.box >= MAX_BOX - 1) mastered += 1
    if (it.due <= now) (isCard(id) ? dueC++ : dueQ++)
  }
  return { dueQ, dueC, due: dueQ + dueC, scheduled, mastered }
}
