import { motion } from 'framer-motion'
import { ArrowLeft, Trophy, Target, TrendingUp, CheckCircle2, Timer, ArrowRight } from 'lucide-react'
import { examStats } from '../lib/storage'

const PASS_PCT = 70

export default function ExamHistory({ state, onStartExam, onBack }) {
  const history = state.examHistory || []
  const stats = examStats(state)

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-6">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={onBack} className="btn">
          <ArrowLeft size={16} /> Home
        </button>
        <div className="flex items-center gap-2 font-display text-xl font-bold text-white">
          <Trophy size={20} className="text-amber" /> Exam History
        </div>
        <button onClick={onStartExam} className="btn-accent ml-auto px-4 py-2">
          New exam <ArrowRight size={16} />
        </button>
      </div>

      {history.length === 0 ? (
        <div className="glass-strong flex flex-col items-center gap-3 p-10 text-center shadow-glow-soft">
          <Timer size={40} className="text-coral" />
          <h2 className="font-display text-2xl font-bold text-white">No exams yet</h2>
          <p className="max-w-sm font-body text-white/55">
            Take a timed mock exam and your scores will plot here so you can watch your readiness trend toward the{' '}
            {PASS_PCT}% pass mark.
          </p>
          <button onClick={onStartExam} className="btn-accent mt-2">
            Start a mock exam <ArrowRight size={18} />
          </button>
        </div>
      ) : (
        <>
          {/* summary */}
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Attempts" value={stats.count} icon={Target} tint="text-cyan" />
            <Stat label="Passed" value={`${stats.passed}/${stats.count}`} icon={CheckCircle2} tint="text-mint" />
            <Stat label="Best" value={`${stats.best}%`} icon={Trophy} tint="text-amber" />
            <Stat label="Average" value={`${stats.avg}%`} icon={TrendingUp} tint="text-violet" />
          </div>

          {/* chart */}
          <div className="glass-strong mb-6 p-5 shadow-glow-soft">
            <div className="mb-4 flex items-center justify-between">
              <span className="label">Score trend</span>
              <span className="label text-mint">pass · {PASS_PCT}%</span>
            </div>
            <ScoreChart history={history} />
          </div>

          {/* attempt list (newest first) */}
          <div className="glass divide-y divide-white/[0.06] overflow-hidden">
            {[...history].reverse().map((e, i) => {
              const d = new Date(e.date)
              const when = d.toLocaleDateString(undefined, { day: '2-digit', month: 'short' }) +
                ' · ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
              return (
                <div key={e.date + i} className="flex items-center gap-4 px-4 py-3">
                  <span className="font-mono text-xs text-white/45">#{history.length - i}</span>
                  <span className="min-w-0 flex-1 truncate font-body text-sm text-white/70">{when}</span>
                  <span className="font-mono text-xs text-white/55">
                    {e.correct}/{e.total}
                  </span>
                  <span className={`font-mono text-base font-bold ${e.passed ? 'text-mint' : 'text-coral'}`}>
                    {e.pct}%
                  </span>
                  <span
                    className={`chip shrink-0 ${
                      e.passed ? 'border-mint/40 text-mint' : 'border-coral/40 text-coral'
                    }`}
                  >
                    {e.passed ? 'PASS' : 'FAIL'}
                  </span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

// Lightweight responsive SVG line chart — no chart library.
function ScoreChart({ history }) {
  const W = 640
  const H = 200
  const pad = { l: 30, r: 12, t: 12, b: 22 }
  const iw = W - pad.l - pad.r
  const ih = H - pad.t - pad.b
  const n = history.length
  const x = (i) => pad.l + (n === 1 ? iw / 2 : (i / (n - 1)) * iw)
  const y = (pct) => pad.t + (1 - pct / 100) * ih
  const passY = y(PASS_PCT)

  const pts = history.map((e, i) => ({ x: x(i), y: y(e.pct), e }))
  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
  const areaPath = `${linePath} L ${pts[pts.length - 1].x.toFixed(1)} ${(pad.t + ih).toFixed(1)} L ${pts[0].x.toFixed(1)} ${(pad.t + ih).toFixed(1)} Z`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="scoreLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>

      {/* y gridlines */}
      {[0, 25, 50, 75, 100].map((g) => (
        <g key={g}>
          <line x1={pad.l} y1={y(g)} x2={W - pad.r} y2={y(g)} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
          <text x={pad.l - 6} y={y(g) + 3} textAnchor="end" fontSize="9" fill="rgba(255,255,255,0.35)" fontFamily="monospace">
            {g}
          </text>
        </g>
      ))}

      {/* pass threshold */}
      <line x1={pad.l} y1={passY} x2={W - pad.r} y2={passY} stroke="#34d399" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.7" />

      {/* area + line */}
      {n > 1 && <path d={areaPath} fill="url(#scoreFill)" />}
      {n > 1 && <path d={linePath} fill="none" stroke="url(#scoreLine)" strokeWidth="2.5" strokeLinejoin="round" />}

      {/* points */}
      {pts.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="4"
          fill={p.e.passed ? '#34d399' : '#fb7185'}
          stroke="#08080f"
          strokeWidth="2"
        />
      ))}
    </svg>
  )
}

function Stat({ label, value, icon: Icon, tint }) {
  return (
    <div className="glass flex items-center gap-3 p-3.5">
      <span className={`grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/[0.05] ${tint}`}>
        <Icon size={18} />
      </span>
      <div>
        <div className="font-mono text-xl font-bold leading-none text-white">{value}</div>
        <div className="mt-1 label">{label}</div>
      </div>
    </div>
  )
}
