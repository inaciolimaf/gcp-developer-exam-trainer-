// Chart palette + small numeric helpers shared by every chart in the app.
//
// Re-stepped for the white chart surface (#FFFFFF): every slot sits in OKLCH
// L 0.48–0.62 with chroma >= 0.1, clearing >= 3:1 contrast against the panel
// and holding adjacent separation under deuteranopia.
//
// Green and red are NOT in this ramp — they are reserved app-wide to mean
// "certo" and "errado", so a categorical slot can never be mistaken for a
// verdict. The order is chosen so neighbouring slots stay apart for
// colour-blind readers (blue→amber is the strongest such pair).
//
// Assign them IN ORDER and never cycle: past five slots the hues stop being
// distinguishable, so anything beyond folds into "Outros".
export const SERIES = ['#1A6FE0', '#B26A00', '#8B3FD9', '#0E8E9B', '#D6398B']

export const seriesColor = (i) => SERIES[i % SERIES.length]

// Reserved state colours — never used as "series 6". Always shipped next to a
// number or a label, never as the only signal.
export const STATUS = {
  good: '#12894C',
  warn: '#B26A00',
  bad: '#C92A35',
  idle: '#C3CEDE',
}

export const GRID = 'rgba(19,23,32,0.09)'
export const AXIS = 'rgba(19,23,32,0.45)'
export const SURFACE = '#FFFFFF'

// Accuracy → status colour. 70% is the mock-exam pass mark, 50% is "at risk".
export function accColor(pct) {
  if (pct == null) return STATUS.idle
  return pct < 50 ? STATUS.bad : pct < 70 ? STATUS.warn : STATUS.good
}

// Single-hue sequential ramp (green), light→dark for a white surface:
// near-zero stays near the panel, high values deepen.
export function heatColor(n, max = 16) {
  if (!n) return '#EDF1F7'
  const t = Math.min(1, Math.log1p(n) / Math.log1p(max))
  const steps = [0.18, 0.36, 0.56, 0.78, 1]
  const a = steps[Math.min(steps.length - 1, Math.floor(t * steps.length))]
  return `rgba(18,137,76,${a})`
}

// ---- numbers -------------------------------------------------------------

export const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n))
export const pct = (n, d) => (d ? (n / d) * 100 : 0)
export const round = (n, d = 0) => {
  const f = 10 ** d
  return Math.round(n * f) / f
}

export function median(xs) {
  if (!xs.length) return 0
  const a = [...xs].sort((x, y) => x - y)
  const m = a.length >> 1
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2
}

export function mean(xs) {
  return xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0
}

// Pearson correlation — used to answer "does rushing cost you accuracy?".
export function correlation(xs, ys) {
  const n = Math.min(xs.length, ys.length)
  if (n < 5) return null
  const mx = mean(xs.slice(0, n))
  const my = mean(ys.slice(0, n))
  let num = 0
  let dx = 0
  let dy = 0
  for (let i = 0; i < n; i++) {
    const a = xs[i] - mx
    const b = ys[i] - my
    num += a * b
    dx += a * a
    dy += b * b
  }
  if (!dx || !dy) return null
  return num / Math.sqrt(dx * dy)
}

// Least-squares slope of y over its own index (points per step).
export function trendSlope(ys) {
  const n = ys.length
  if (n < 3) return 0
  const mx = (n - 1) / 2
  const my = mean(ys)
  let num = 0
  let den = 0
  for (let i = 0; i < n; i++) {
    num += (i - mx) * (ys[i] - my)
    den += (i - mx) ** 2
  }
  return den ? num / den : 0
}

// ---- dates ---------------------------------------------------------------

export function ymd(ts) {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const DAY_MS = 86_400_000

export const MONTHS_PT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
export const WEEKDAYS_PT = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']

export function shortDate(ts) {
  const d = new Date(ts)
  return `${d.getDate()} ${MONTHS_PT[d.getMonth()]}`
}

// "2 min 30 s" / "45 s" / "1 h 12 min" — compact, never scientific.
export function fmtDuration(ms) {
  if (!ms || ms < 0) return '—'
  const s = Math.round(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  if (m < 60) return s % 60 ? `${m}m ${s % 60}s` : `${m}m`
  const h = Math.floor(m / 60)
  return m % 60 ? `${h}h ${m % 60}m` : `${h}h`
}

export function fmtDateBr(ts) {
  const d = new Date(ts)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}
