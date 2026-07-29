import { useEffect, useRef, useState } from 'react'
import { Play, Pause, Gauge } from 'lucide-react'

const SPEEDS = [1, 1.5, 2, 2.5, 3]

function fmt(s) {
  if (!isFinite(s) || s < 0) return '0:00'
  const m = Math.floor(s / 60)
  const ss = Math.floor(s % 60)
  return `${m}:${String(ss).padStart(2, '0')}`
}

// Player reutilizável (aulas e explicações das questões):
// play/pause, barra de progresso clicável (pular) e velocidade 1×–3×.
export default function AudioPlayer({ src }) {
  const ref = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [cur, setCur] = useState(0)
  const [dur, setDur] = useState(0)
  const [speed, setSpeed] = useState(1)

  // mantém a velocidade aplicada (alguns browsers resetam no play)
  useEffect(() => {
    if (ref.current) ref.current.playbackRate = speed
  }, [speed, playing])

  function toggle() {
    const a = ref.current
    if (!a) return
    if (a.paused) a.play()
    else a.pause()
  }

  function seek(e) {
    const a = ref.current
    if (!a || !dur) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    a.currentTime = pct * dur
    setCur(a.currentTime)
  }

  const pct = dur ? (cur / dur) * 100 : 0

  return (
    <div className="glass-strong flex flex-col gap-4 p-4 shadow-glow-soft sm:p-5">
      <audio
        ref={ref}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={() => ref.current && setCur(ref.current.currentTime)}
        onLoadedMetadata={() => {
          if (!ref.current) return
          setDur(ref.current.duration)
          ref.current.playbackRate = speed
        }}
      />

      <div className="flex items-center gap-4">
        <button
          onClick={toggle}
          aria-label={playing ? 'Pause' : 'Play'}
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-cyan to-violet text-base shadow-glow-violet transition-transform hover:scale-105 active:scale-95"
        >
          {playing ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
        </button>

        <div className="min-w-0 flex-1">
          <div
            onClick={seek}
            className="group relative h-2.5 cursor-pointer overflow-hidden rounded-full border border-line bg-sunken"
          >
            <div className="h-full rounded-full bg-gradient-to-r from-cyan to-violet" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-1.5 flex justify-between font-mono text-xs text-faint">
            <span>{fmt(cur)}</span>
            <span>{fmt(dur)}</span>
          </div>
        </div>
      </div>

      {/* controle de velocidade 1x–3x */}
      <div className="flex items-center gap-2">
        <Gauge size={15} className="shrink-0 text-faint" />
        <div className="flex flex-wrap gap-1.5">
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`rounded-lg px-2.5 py-1 font-mono text-xs font-bold transition-colors ${
                speed === s
                  ? 'bg-violet/25 text-white ring-1 ring-violet/50'
                  : 'text-muted hover:bg-sunken hover:text-ink'
              }`}
            >
              {s}×
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
