import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { marked } from 'marked'
import { ArrowLeft, GraduationCap, Play, Pause, Gauge, ArrowUpRight, Headphones } from 'lucide-react'

marked.setOptions({ gfm: true, breaks: false })

const SPEEDS = [1, 1.5, 2, 2.5, 3]

export default function Lessons({ onExit }) {
  const [list, setList] = useState(null)
  const [active, setActive] = useState(null)

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}lessons/index.json`)
      .then((r) => r.json())
      .then((d) => setList(d.lessons || []))
      .catch(() => setList([]))
  }, [])

  if (active) {
    return <LessonDetail lesson={active} onBack={() => setActive(null)} onHome={onExit} />
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-28 pt-6">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={onExit} className="btn">
          <ArrowLeft size={16} /> Home
        </button>
        <div className="flex items-center gap-2 font-display text-xl font-bold text-white">
          <GraduationCap size={20} className="text-violet" /> Aulas
        </div>
      </div>

      <p className="mb-6 max-w-2xl font-body text-sm text-white/55">
        Os tópicos cobrados na prova que o curso <strong className="text-white/80">não ensina</strong> — narração em
        áudio (ajuste a velocidade de 1× a 3×) com o quadro de cada aula para acompanhar.
      </p>

      {list === null ? (
        <div className="grid place-items-center pt-20 font-display text-white/60">
          <span className="animate-pulse">Carregando aulas…</span>
        </div>
      ) : list.length === 0 ? (
        <div className="glass p-6 font-body text-white/60">Nenhuma aula encontrada.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((l, i) => (
            <motion.button
              key={l.slug}
              onClick={() => setActive(l)}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i, type: 'spring', stiffness: 220, damping: 22 }}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="group glass relative flex flex-col items-start gap-3 overflow-hidden p-5 text-left transition-colors hover:border-white/25"
            >
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-violet/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="grid h-11 w-11 place-items-center rounded-xl border border-white/12 bg-white/[0.06] font-mono text-lg font-bold text-violet transition-shadow duration-300 group-hover:[box-shadow:0_0_26px_-6px_currentColor]">
                {String(l.id).padStart(2, '0')}
              </span>
              <div className="flex items-start gap-1 font-display text-base font-semibold leading-snug text-white">
                {l.title}
                <ArrowUpRight size={15} className="mt-0.5 shrink-0 opacity-0 -translate-x-1 transition-all group-hover:translate-x-0 group-hover:opacity-60" />
              </div>
              {l.audio && (
                <span className="chip border-white/12 text-white/55">
                  <Headphones size={12} /> áudio
                </span>
              )}
            </motion.button>
          ))}
        </div>
      )}
    </div>
  )
}

function LessonDetail({ lesson, onBack, onHome }) {
  const [html, setHtml] = useState('')

  useEffect(() => {
    setHtml('')
    fetch(`${import.meta.env.BASE_URL}lessons/${lesson.quadro}`)
      .then((r) => r.text())
      // remove o primeiro H1 (já mostramos o título no cabeçalho)
      .then((md) => setHtml(marked.parse(md.replace(/^#\s.*\n/, ''))))
      .catch(() => setHtml('<p>Não foi possível carregar o quadro desta aula.</p>'))
  }, [lesson])

  return (
    <div className="mx-auto max-w-4xl px-4 pb-28 pt-6">
      <div className="mb-5 flex items-center gap-3">
        <button onClick={onBack} className="btn">
          <ArrowLeft size={16} /> Aulas
        </button>
        <button onClick={onHome} className="btn text-white/55">
          Home
        </button>
        <span className="ml-auto font-mono text-sm text-white/40">
          Aula {String(lesson.id).padStart(2, '0')}
        </span>
      </div>

      <h1 className="mb-5 font-display text-2xl font-bold leading-tight text-white sm:text-3xl">
        {lesson.title}
      </h1>

      {lesson.audio && (
        <AudioPlayer src={`${import.meta.env.BASE_URL}lessons/${lesson.audio}`} />
      )}

      <motion.article
        key={lesson.slug}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="md-content glass-strong mt-6 min-w-0 p-5 shadow-glow-soft sm:p-8"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}

function fmt(s) {
  if (!isFinite(s) || s < 0) return '0:00'
  const m = Math.floor(s / 60)
  const ss = Math.floor(s % 60)
  return `${m}:${String(ss).padStart(2, '0')}`
}

function AudioPlayer({ src }) {
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
          aria-label={playing ? 'Pausar' : 'Reproduzir'}
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-cyan to-violet text-base shadow-glow-violet transition-transform hover:scale-105 active:scale-95"
        >
          {playing ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
        </button>

        <div className="min-w-0 flex-1">
          <div
            onClick={seek}
            className="group relative h-2.5 cursor-pointer overflow-hidden rounded-full border border-white/10 bg-white/[0.06]"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan to-violet"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-1.5 flex justify-between font-mono text-xs text-white/45">
            <span>{fmt(cur)}</span>
            <span>{fmt(dur)}</span>
          </div>
        </div>
      </div>

      {/* controle de velocidade 1x–3x */}
      <div className="flex items-center gap-2">
        <Gauge size={15} className="shrink-0 text-white/45" />
        <div className="flex flex-wrap gap-1.5">
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`rounded-lg px-2.5 py-1 font-mono text-xs font-bold transition-colors ${
                speed === s
                  ? 'bg-violet/25 text-white ring-1 ring-violet/50'
                  : 'text-white/50 hover:bg-white/[0.06] hover:text-white/80'
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
