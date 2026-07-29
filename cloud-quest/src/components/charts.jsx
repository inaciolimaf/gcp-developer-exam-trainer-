// Hand-rolled SVG chart primitives — no chart library, no runtime deps.
// Every plot ships a hover layer (crosshair or per-mark tooltip), a single y
// axis (never two scales in one frame), recessive grid lines and a legend
// whenever more than one series is on screen.

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { AXIS, GRID, SERIES, STATUS, accColor, seriesColor } from '../lib/viz'

// ---- plumbing ------------------------------------------------------------

// Charts size themselves to the panel they sit in.
export function useMeasure() {
  const ref = useRef(null)
  const [w, setW] = useState(0)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)))
    ro.observe(el)
    setW(el.clientWidth)
    return () => ro.disconnect()
  }, [])
  return [ref, w]
}

// Shared floating tooltip. `show(x, y, node)` positions it inside the wrapper.
function Tooltip({ tip }) {
  if (!tip) return null
  return (
    <div
      className="pointer-events-none absolute z-20 min-w-[92px] -translate-x-1/2 rounded-lg border border-line bg-surface px-2.5 py-1.5 font-body text-[11px] leading-tight text-ink shadow-glow-soft backdrop-blur"
      style={{ left: tip.x, top: tip.y, transform: `translate(-50%, calc(-100% - 10px))` }}
    >
      {tip.node}
    </div>
  )
}

function useTip() {
  const [tip, setTip] = useState(null)
  const show = useCallback((x, y, node) => setTip({ x, y, node }), [])
  const hide = useCallback(() => setTip(null), [])
  return { tip, show, hide }
}

function TipRow({ color, label, value }) {
  return (
    <div className="flex items-center gap-1.5 whitespace-nowrap">
      {color && <span className="h-2 w-2 shrink-0 rounded-sm" style={{ background: color }} />}
      <span className="text-muted">{label}</span>
      <span className="ml-auto font-mono text-ink">{value}</span>
    </div>
  )
}

export function Legend({ items, className = '' }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-1.5 font-body text-[11px] text-muted ${className}`}>
      {items.map((it) => (
        <span key={it.label} className="inline-flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-sm"
            style={{ background: it.color, opacity: it.faded ? 0.45 : 1 }}
          />
          {it.label}
          {it.value != null && <span className="font-mono text-muted">{it.value}</span>}
        </span>
      ))}
    </div>
  )
}

export function Empty({ children = 'Sem dados ainda' }) {
  return (
    <div className="grid place-items-center rounded-xl border border-dashed border-line py-8 text-center font-body text-xs text-faint">
      {children}
    </div>
  )
}

// nice-ish axis ceiling so the top gridline lands on a round number
function niceMax(v) {
  if (v <= 5) return 5
  const mag = 10 ** Math.floor(Math.log10(v))
  const n = v / mag
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10
  return step * mag
}

// ---- line / area ---------------------------------------------------------

/**
 * Multi-series line chart over a shared x index.
 * series: [{ name, color, values: number[] (null = gap), area?: bool }]
 * labels: string[] aligned with values
 */
export function LineChart({
  series,
  labels,
  height = 170,
  yMax,
  yMin = 0,
  yFormat = (v) => v,
  refLine, // { value, label, color }
  padL = 34,
  showDots = false,
}) {
  const [ref, w] = useMeasure()
  const { tip, show, hide } = useTip()
  const [hoverI, setHoverI] = useState(null)
  const n = labels.length
  const padR = 10
  const padT = 10
  const padB = 20
  const iw = Math.max(10, w - padL - padR)
  const ih = height - padT - padB

  const top = useMemo(() => {
    if (yMax != null) return yMax
    const all = series.flatMap((s) => s.values.filter((v) => v != null))
    return niceMax(Math.max(1, ...all))
  }, [series, yMax])

  const xAt = (i) => padL + (n <= 1 ? iw / 2 : (i / (n - 1)) * iw)
  const yAt = (v) => padT + ih - ((v - yMin) / (top - yMin || 1)) * ih

  // Split into runs of consecutive non-null points so gaps stay gaps — both for
  // the line and (critically) for the area fill, which must not close across a
  // hole and paint a phantom wedge.
  const runs = (values) => {
    const out = []
    let cur = []
    values.forEach((v, i) => {
      if (v == null) {
        if (cur.length) out.push(cur)
        cur = []
      } else cur.push({ i, v })
    })
    if (cur.length) out.push(cur)
    return out
  }

  const path = (values) =>
    runs(values)
      .map((run) => run.map((p, k) => `${k ? 'L' : 'M'}${xAt(p.i).toFixed(1)},${yAt(p.v).toFixed(1)}`).join(' '))
      .join(' ')

  const areaPath = (values) =>
    runs(values)
      .filter((run) => run.length > 1)
      .map(
        (run) =>
          `M${xAt(run[0].i).toFixed(1)},${yAt(yMin).toFixed(1)} ` +
          run.map((p) => `L${xAt(p.i).toFixed(1)},${yAt(p.v).toFixed(1)}`).join(' ') +
          ` L${xAt(run[run.length - 1].i).toFixed(1)},${yAt(yMin).toFixed(1)} Z`,
      )
      .join(' ')

  const ticks = [0, 0.5, 1].map((f) => yMin + (top - yMin) * f)

  function onMove(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const i = Math.round(((x - padL) / (iw || 1)) * (n - 1))
    const idx = Math.max(0, Math.min(n - 1, i))
    setHoverI(idx)
    show(
      xAt(idx),
      yAt(top),
      <>
        <div className="mb-1 font-display text-[11px] font-semibold text-ink">{labels[idx]}</div>
        {series.map((s) => (
          <TipRow
            key={s.name}
            color={s.color}
            label={s.name}
            value={s.values[idx] == null ? '—' : yFormat(s.values[idx])}
          />
        ))}
      </>,
    )
  }

  return (
    <div ref={ref} className="relative">
      {w > 0 && (
        <svg
          width={w}
          height={height}
          onMouseMove={onMove}
          onMouseLeave={() => {
            hide()
            setHoverI(null)
          }}
        >
          {ticks.map((t) => (
            <g key={t}>
              <line x1={padL} x2={w - padR} y1={yAt(t)} y2={yAt(t)} stroke={GRID} strokeWidth="1" />
              <text x={padL - 6} y={yAt(t) + 3.5} textAnchor="end" fill={AXIS} className="font-mono" fontSize="9">
                {yFormat(Math.round(t))}
              </text>
            </g>
          ))}

          {refLine && (
            <g>
              <line
                x1={padL}
                x2={w - padR}
                y1={yAt(refLine.value)}
                y2={yAt(refLine.value)}
                stroke={refLine.color || STATUS.warn}
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.75"
              />
              {refLine.label && (
                <text x={w - padR} y={yAt(refLine.value) - 4} textAnchor="end" fill={refLine.color || STATUS.warn} className="font-mono" fontSize="9">
                  {refLine.label}
                </text>
              )}
            </g>
          )}

          {series.map((s) => (
            <g key={s.name}>
              {s.area && <path d={areaPath(s.values)} fill={s.color} opacity="0.12" />}
              <path d={path(s.values)} fill="none" stroke={s.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              {showDots &&
                s.values.map((v, i) =>
                  v == null ? null : (
                    <circle key={i} cx={xAt(i)} cy={yAt(v)} r="3" fill={s.color} stroke="#FFFFFF" strokeWidth="2" />
                  ),
                )}
            </g>
          ))}

          {hoverI != null && (
            <g>
              <line x1={xAt(hoverI)} x2={xAt(hoverI)} y1={padT} y2={padT + ih} stroke="rgba(19,23,32,0.30)" strokeWidth="1" />
              {series.map((s) =>
                s.values[hoverI] == null ? null : (
                  <circle
                    key={s.name}
                    cx={xAt(hoverI)}
                    cy={yAt(s.values[hoverI])}
                    r="4.5"
                    fill={s.color}
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
                ),
              )}
            </g>
          )}

          {/* sparse x labels so they never collide */}
          {labels.map((l, i) => {
            const every = Math.ceil(n / Math.max(3, Math.floor(iw / 62)))
            if (i % every !== 0 && i !== n - 1) return null
            return (
              <text
                key={i}
                x={xAt(i)}
                y={height - 5}
                textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}
                fill={AXIS}
                className="font-mono"
                fontSize="9"
              >
                {l}
              </text>
            )
          })}
        </svg>
      )}
      <Tooltip tip={tip} />
    </div>
  )
}

// ---- vertical bars -------------------------------------------------------

/**
 * bars: [{ label, value, color?, tip?: ReactNode }]
 */
export function BarChart({ bars, height = 150, yFormat = (v) => v, color = SERIES[0], labelEvery, yMax }) {
  const [ref, w] = useMeasure()
  const { tip, show, hide } = useTip()
  const padL = 30
  const padR = 6
  const padT = 8
  const padB = 18
  const n = bars.length
  const iw = Math.max(10, w - padL - padR)
  const ih = height - padT - padB
  const top = yMax ?? niceMax(Math.max(1, ...bars.map((b) => b.value)))
  const slot = iw / Math.max(1, n)
  const bw = Math.max(2, Math.min(28, slot - 2)) // 2px surface gap between bars
  const yAt = (v) => padT + ih - (v / top) * ih
  const every = labelEvery ?? Math.ceil(n / Math.max(3, Math.floor(iw / 42)))

  return (
    <div ref={ref} className="relative">
      {w > 0 && (
        <svg width={w} height={height} onMouseLeave={hide}>
          {[0, 0.5, 1].map((f) => (
            <g key={f}>
              <line x1={padL} x2={w - padR} y1={yAt(top * f)} y2={yAt(top * f)} stroke={GRID} strokeWidth="1" />
              <text x={padL - 5} y={yAt(top * f) + 3.5} textAnchor="end" fill={AXIS} className="font-mono" fontSize="9">
                {yFormat(Math.round(top * f))}
              </text>
            </g>
          ))}
          {bars.map((b, i) => {
            const x = padL + i * slot + (slot - bw) / 2
            const h = Math.max(b.value > 0 ? 2 : 0, (b.value / top) * ih)
            return (
              <g key={b.label + i}>
                <rect
                  x={x}
                  y={yAt(b.value)}
                  width={bw}
                  height={h}
                  rx={Math.min(4, bw / 2)}
                  fill={b.color || color}
                />
                {/* generous hit area */}
                <rect
                  x={padL + i * slot}
                  y={padT}
                  width={slot}
                  height={ih}
                  fill="transparent"
                  onMouseEnter={(e) =>
                    show(
                      padL + i * slot + slot / 2,
                      padT,
                      b.tip || (
                        <>
                          <div className="mb-0.5 font-display text-[11px] font-semibold text-ink">{b.label}</div>
                          <TipRow color={b.color || color} label="valor" value={yFormat(b.value)} />
                        </>
                      ),
                    )
                  }
                />
              </g>
            )
          })}
          {bars.map((b, i) =>
            i % every === 0 || i === n - 1 ? (
              <text
                key={`l${i}`}
                x={padL + i * slot + slot / 2}
                y={height - 4}
                textAnchor="middle"
                fill={AXIS}
                className="font-mono"
                fontSize="9"
              >
                {b.label}
              </text>
            ) : null,
          )}
        </svg>
      )}
      <Tooltip tip={tip} />
    </div>
  )
}

// ---- horizontal bar rows -------------------------------------------------

/**
 * Ranked rows — the go-to form for "accuracy by category" (labels stay readable).
 * rows: [{ key, label, sub, value, max, color, right, onClick }]
 */
export function BarRows({ rows, valueFormat = (v) => `${Math.round(v)}%` }) {
  return (
    <div className="grid gap-2">
      {rows.map((r) => {
        const max = r.max ?? 100
        const w = Math.max(0, Math.min(100, (r.value / max) * 100))
        const Tag = r.onClick ? 'button' : 'div'
        return (
          <Tag
            key={r.key}
            onClick={r.onClick}
            className={`group flex w-full items-center gap-3 rounded-lg px-1 py-1 text-left ${
              r.onClick ? 'transition-colors hover:bg-sunken' : ''
            }`}
          >
            <span className="w-[42%] min-w-0 shrink-0 sm:w-[34%]">
              <span className="block truncate font-body text-[13px] text-ink group-hover:text-ink">{r.label}</span>
              {r.sub && <span className="block truncate font-mono text-[10px] text-faint">{r.sub}</span>}
            </span>
            <span className="h-2.5 flex-1 overflow-hidden rounded-full border border-line bg-sunken">
              <span
                className="block h-full rounded-full transition-[width] duration-500"
                style={{ width: `${w}%`, background: r.color || accColor(r.value) }}
              />
            </span>
            <span className="w-24 shrink-0 whitespace-nowrap text-right font-mono text-[11px] text-muted">
              {r.right ?? valueFormat(r.value)}
            </span>
          </Tag>
        )
      })}
    </div>
  )
}

// ---- stacked single bar --------------------------------------------------

// segments: [{ label, value, color }] — 2px surface gap between segments.
export function StackedBar({ segments, total, height = 12 }) {
  const sum = total ?? segments.reduce((s, x) => s + x.value, 0)
  return (
    <div className="flex overflow-hidden rounded-full border border-line bg-sunken" style={{ height }}>
      {segments.map((s, i) =>
        s.value <= 0 ? null : (
          <span
            key={s.label}
            title={`${s.label}: ${s.value}`}
            className="h-full"
            style={{
              width: `${(s.value / (sum || 1)) * 100}%`,
              background: s.color,
              marginLeft: i ? 2 : 0,
            }}
          />
        ),
      )}
    </div>
  )
}

// ---- radar ---------------------------------------------------------------

/**
 * axes: [{ label, value (0-100), sub }]
 * A second faint polygon can carry a reference (e.g. share of the bank).
 */
export function Radar({ axes, size = 230, color = SERIES[0], refAxes, refColor = SERIES[1], refName, name }) {
  const { tip, show, hide } = useTip()
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 30
  const n = axes.length
  if (!n) return <Empty />
  const pt = (i, v) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2
    const rad = (Math.max(0, Math.min(100, v)) / 100) * r
    return [cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]
  }
  const poly = (vals) => vals.map((v, i) => pt(i, v).join(',')).join(' ')

  return (
    <div className="relative grid place-items-center">
      <svg width={size} height={size} onMouseLeave={hide}>
        {[25, 50, 75, 100].map((ring) => (
          <polygon
            key={ring}
            points={poly(axes.map(() => ring))}
            fill="none"
            stroke={GRID}
            strokeWidth="1"
          />
        ))}
        {axes.map((a, i) => {
          const [x, y] = pt(i, 100)
          return <line key={a.label} x1={cx} y1={cy} x2={x} y2={y} stroke={GRID} strokeWidth="1" />
        })}

        {refAxes && (
          <polygon points={poly(refAxes.map((a) => a.value))} fill={refColor} fillOpacity="0.1" stroke={refColor} strokeWidth="1.5" strokeDasharray="4 3" />
        )}
        <polygon points={poly(axes.map((a) => a.value))} fill={color} fillOpacity="0.18" stroke={color} strokeWidth="2" />

        {axes.map((a, i) => {
          const [x, y] = pt(i, a.value)
          const [lx, ly] = pt(i, 122)
          return (
            <g key={a.label}>
              <circle
                cx={x}
                cy={y}
                r="5"
                fill={color}
                stroke="#FFFFFF"
                strokeWidth="2"
                onMouseEnter={() =>
                  show(
                    x,
                    y,
                    <>
                      <div className="mb-0.5 font-display text-[11px] font-semibold text-ink">{a.label}</div>
                      <TipRow color={color} label={name || 'acerto'} value={`${Math.round(a.value)}%`} />
                      {refAxes && <TipRow color={refColor} label={refName} value={`${Math.round(refAxes[i].value)}%`} />}
                      {a.sub && <div className="mt-0.5 text-faint">{a.sub}</div>}
                    </>,
                  )
                }
              />
              <text
                x={lx}
                y={ly + 3}
                textAnchor={Math.abs(lx - cx) < 12 ? 'middle' : lx > cx ? 'start' : 'end'}
                fill="rgba(19,23,32,0.62)"
                className="font-mono"
                fontSize="10"
              >
                {a.label}
              </text>
            </g>
          )
        })}
      </svg>
      <Tooltip tip={tip} />
    </div>
  )
}

// ---- scatter / bubble ----------------------------------------------------

/**
 * points: [{ key, x, y, r, label, sub, color, onClick }]
 * x = volume, y = accuracy. Quadrant shading marks the "many tries, low score"
 * corner — the stuff worth drilling.
 */
export function Scatter({ points, height = 240, xLabel, yLabel, xMax, yBand = 70 }) {
  const [ref, w] = useMeasure()
  const { tip, show, hide } = useTip()
  const padL = 34
  const padR = 12
  const padT = 10
  const padB = 26
  const iw = Math.max(10, w - padL - padR)
  const ih = height - padT - padB
  const mx = xMax ?? niceMax(Math.max(1, ...points.map((p) => p.x)))
  const xAt = (v) => padL + (v / mx) * iw
  const yAt = (v) => padT + ih - (v / 100) * ih

  return (
    <div ref={ref} className="relative">
      {w > 0 && (
        <svg width={w} height={height} onMouseLeave={hide}>
          {/* danger quadrant: below the pass band */}
          <rect x={padL} y={yAt(yBand)} width={iw} height={padT + ih - yAt(yBand)} fill={STATUS.bad} opacity="0.05" />
          {[0, 25, 50, 75, 100].map((t) => (
            <g key={t}>
              <line x1={padL} x2={w - padR} y1={yAt(t)} y2={yAt(t)} stroke={GRID} strokeWidth="1" />
              <text x={padL - 5} y={yAt(t) + 3.5} textAnchor="end" fill={AXIS} className="font-mono" fontSize="9">
                {t}
              </text>
            </g>
          ))}
          <line x1={padL} x2={w - padR} y1={yAt(yBand)} y2={yAt(yBand)} stroke={STATUS.warn} strokeWidth="1.5" strokeDasharray="4 4" opacity="0.7" />

          {points.map((p) => (
            <circle
              key={p.key}
              cx={xAt(p.x)}
              cy={yAt(p.y)}
              r={p.r || 5}
              fill={p.color || SERIES[0]}
              fillOpacity="0.55"
              stroke={p.color || SERIES[0]}
              strokeWidth="2"
              className={p.onClick ? 'cursor-pointer' : ''}
              onClick={p.onClick}
              onMouseEnter={() =>
                show(
                  xAt(p.x),
                  yAt(p.y),
                  <>
                    <div className="mb-0.5 max-w-[180px] font-display text-[11px] font-semibold leading-snug text-ink">
                      {p.label}
                    </div>
                    <TipRow color={p.color || SERIES[0]} label="acerto" value={`${Math.round(p.y)}%`} />
                    <TipRow label="respondidas" value={p.x} />
                    {p.sub && <div className="mt-0.5 text-faint">{p.sub}</div>}
                  </>,
                )
              }
            />
          ))}
          <text x={w - padR} y={height - 4} textAnchor="end" fill={AXIS} className="font-mono" fontSize="9">
            {xLabel}
          </text>
          {/* y label rides the axis vertically so it never collides with ticks */}
          <text
            x={10}
            y={padT + ih / 2}
            fill={AXIS}
            className="font-mono"
            fontSize="9"
            textAnchor="middle"
            transform={`rotate(-90 10 ${padT + ih / 2})`}
          >
            {yLabel}
          </text>
        </svg>
      )}
      <Tooltip tip={tip} />
    </div>
  )
}

// ---- gauge ---------------------------------------------------------------

export function Gauge({ pct, stroke, size = 104, label }) {
  const r = size / 2 - 14
  const c = 2 * Math.PI * r
  const [dash, setDash] = useState(c)
  useEffect(() => {
    const t = setTimeout(() => setDash(c * (1 - Math.max(0, Math.min(100, pct)) / 100)), 60)
    return () => clearTimeout(t)
  }, [pct, c])
  return (
    <span className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(19,23,32,0.09)" strokeWidth="9" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={dash}
          style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(.2,.7,.3,1)' }}
        />
      </svg>
      <span className="absolute grid place-items-center">
        <span className="font-mono text-2xl font-bold leading-none text-ink">{Math.round(pct)}</span>
        {label && <span className="mt-0.5 font-mono text-[9px] uppercase tracking-wider text-faint">{label}</span>}
      </span>
    </span>
  )
}

// ---- calendar heatmap ----------------------------------------------------

/**
 * cells: [{ key: 'YYYY-MM-DD', count, acc }] oldest → newest, aligned so each
 * column is one week (row 0 = Sunday).
 */
export function Heatmap({ cells, colorFor, weeks }) {
  const { tip, show, hide } = useTip()
  const cell = 12
  const gap = 3
  const cols = weeks
  // one label per month, and never two labels within 3 columns of each other
  const monthTicks = []
  let lastMonth = -1
  cells.forEach((c, i) => {
    if (i % 7 !== 0) return // one candidate per column (its Sunday)
    const d = new Date(`${c.key}T00:00:00`)
    const col = Math.floor(i / 7)
    const prev = monthTicks[monthTicks.length - 1]
    // label the column whose week opens a month; skip a partial first month
    if (d.getMonth() !== lastMonth && d.getDate() <= 7) {
      lastMonth = d.getMonth()
      if (!prev || col - prev.col >= 3) monthTicks.push({ col, m: d.getMonth() })
    }
  })
  const MON = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
  const w = cols * (cell + gap) + 24
  const h = 7 * (cell + gap) + 16

  return (
    <div className="relative overflow-x-auto">
      <svg width={w} height={h} onMouseLeave={hide} style={{ minWidth: w }}>
        {monthTicks.map((t) => (
          <text key={`${t.col}-${t.m}`} x={24 + t.col * (cell + gap)} y={9} fill={AXIS} className="font-mono" fontSize="9">
            {MON[t.m]}
          </text>
        ))}
        {['seg', 'qua', 'sex'].map((d, i) => (
          <text key={d} x={0} y={16 + (i * 2 + 1) * (cell + gap) + 9} fill={AXIS} className="font-mono" fontSize="8">
            {d}
          </text>
        ))}
        {cells.map((c, i) => {
          const col = Math.floor(i / 7)
          const row = i % 7
          const x = 24 + col * (cell + gap)
          const y = 16 + row * (cell + gap)
          return (
            <rect
              key={c.key}
              x={x}
              y={y}
              width={cell}
              height={cell}
              rx="3"
              fill={colorFor(c)}
              onMouseEnter={() =>
                show(
                  x + cell / 2,
                  y,
                  <>
                    <div className="mb-0.5 font-display text-[11px] font-semibold text-ink">{c.key}</div>
                    <TipRow label="respostas" value={c.count} />
                    {c.acc != null && <TipRow color={accColor(c.acc)} label="acerto" value={`${Math.round(c.acc)}%`} />}
                  </>,
                )
              }
            />
          )
        })}
      </svg>
      <Tooltip tip={tip} />
    </div>
  )
}

// ---- sparkline -----------------------------------------------------------

export function Sparkline({ values, color = SERIES[0], height = 34, band }) {
  const [ref, w] = useMeasure()
  const vals = values.filter((v) => v != null)
  const min = band ? band[0] : Math.min(...vals)
  const max = band ? band[1] : Math.max(...vals)
  const span = max - min || 1
  const n = values.length
  const xAt = (i) => (n <= 1 ? w / 2 : (i / (n - 1)) * (w - 4) + 2)
  const yAt = (v) => height - 3 - ((v - min) / span) * (height - 6)
  // same run-splitting as LineChart so leading nulls don't drag the fill
  const segs = []
  let cur = []
  values.forEach((v, i) => {
    if (v == null) {
      if (cur.length) segs.push(cur)
      cur = []
    } else cur.push({ i, v })
  })
  if (cur.length) segs.push(cur)
  const line = segs
    .map((s) => s.map((p, k) => `${k ? 'L' : 'M'}${xAt(p.i).toFixed(1)},${yAt(p.v).toFixed(1)}`).join(' '))
    .join(' ')
  const area = segs
    .filter((s) => s.length > 1)
    .map(
      (s) =>
        `M${xAt(s[0].i).toFixed(1)},${height} ` +
        s.map((p) => `L${xAt(p.i).toFixed(1)},${yAt(p.v).toFixed(1)}`).join(' ') +
        ` L${xAt(s[s.length - 1].i).toFixed(1)},${height} Z`,
    )
    .join(' ')
  const lastI = [...values].reverse().findIndex((v) => v != null)
  const li = lastI === -1 ? -1 : n - 1 - lastI
  return (
    <div ref={ref}>
      {w > 0 && vals.length > 1 && (
        <svg width={w} height={height}>
          <path d={area} fill={color} opacity="0.1" />
          <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {li >= 0 && <circle cx={xAt(li)} cy={yAt(values[li])} r="3" fill={color} stroke="#FFFFFF" strokeWidth="2" />}
        </svg>
      )}
    </div>
  )
}

export { seriesColor, SERIES, STATUS }
