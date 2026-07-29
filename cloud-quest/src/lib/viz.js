// Chart palette + small numeric helpers shared by every chart in the app.
//
// The categorical slots below are the app's own hues (cyan / violet / mint /
// amber / pink) re-stepped for the dark chart surface (~#0f1018) so they clear
// every gate of the data-viz colour checks: OKLCH L inside 0.48–0.67, chroma
// >= 0.1, adjacent colour-blind separation ΔE 8.2 (deutan), adjacent
// normal-vision ΔE 15.9, and >= 3:1 contrast against the panel.
//
// Assign them IN ORDER and never cycle: with a 6th series the pink/coral pair
// stops being distinguishable, so anything past five folds into "Outros".
export const SERIES = ['#33a3b4', '#9e71fd', '#23ac74', '#b48c2b', '#e652a3']

export const seriesColor = (i) => SERIES[i % SERIES.length]

// Reserved state colours — never used as "series 6". Always shipped next to a
// number or a label, never as the only signal.
export const STATUS = {
  good: '#34d399',
  warn: '#fbbf24',
  bad: '#fb7185',
  idle: 'rgba(255,255,255,0.22)',
}

export const GRID = 'rgba(255,255,255,0.07)'
export const AXIS = 'rgba(255,255,255,0.40)'
export const SURFACE = '#0f1018'

// Accuracy → status colour. 70% is the mock-exam pass mark, 50% is "at risk".
export function accColor(pct) {
  if (pct == null) return STATUS.idle
  return pct < 50 ? STATUS.bad : pct < 70 ? STATUS.warn : STATUS.good
}

// Single-hue sequential ramp (mint), light→dark reversed for a dark surface:
// near-zero recedes into the panel, high values glow.
export function heatColor(n, max = 16) {
  if (!n) return 'rgba(255,255,255,0.045)'
  const t = Math.min(1, Math.log1p(n) / Math.log1p(max))
  const steps = [0.22, 0.4, 0.6, 0.8, 1]
  const a = steps[Math.min(steps.length - 1, Math.floor(t * steps.length))]
  return `rgba(52,211,153,${a})`
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
