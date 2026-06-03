import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { marked } from 'marked'
import { ArrowLeft, GraduationCap, Play, Pause, Gauge, ArrowUpRight, Headphones } from 'lucide-react'

marked.setOptions({ gfm: true, breaks: false })

const SPEEDS = [1, 1.5, 2, 2.5, 3]

const T = {
  pt: {
    aulas: 'Aulas',
    intro: 'Tópicos cobrados na prova, com áudio narrado e o quadro de cada aula. Ajuste a velocidade de 1× a 3× e escolha o idioma no canto.',
    loading: 'Carregando aulas…',
    empty: 'Nenhuma aula encontrada.',
    gaps: 'Tópicos fora do curso (gaps)',
    gapsHint: 'Cobrados na prova, mas o curso não ensina.',
    course: 'Tópicos do curso',
    courseHint: 'Os módulos que valem a pena — na ordem do curso.',
    home: 'Home',
    backList: 'Aulas',
    lesson: 'Aula',
    audioBadge: 'áudio',
    audioSoon: 'Áudio em breve — por enquanto, acompanhe pelo quadro abaixo.',
    audioEnSoon: 'Áudio em inglês em breve — por enquanto, leia o quadro abaixo.',
    loadErr: 'Não foi possível carregar o quadro desta aula.',
  },
  en: {
    aulas: 'Lessons',
    intro: 'Exam topics, with narrated audio and each lesson’s board. Adjust speed 1× to 3× and pick the language in the corner.',
    loading: 'Loading lessons…',
    empty: 'No lessons found.',
    gaps: 'Outside the course (gaps)',
    gapsHint: 'Tested on the exam, but the course doesn’t teach them.',
    course: 'Course topics',
    courseHint: 'The modules worth it — in course order.',
    home: 'Home',
    backList: 'Lessons',
    lesson: 'Lesson',
    audioBadge: 'audio',
    audioSoon: 'Audio coming soon — for now, follow along with the board below.',
    audioEnSoon: 'English audio coming soon — for now, read the board below.',
    loadErr: 'Could not load this lesson’s board.',
  },
}

export default function Lessons({ onExit }) {
  const [list, setList] = useState(null)
  const [active, setActive] = useState(null)
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('lessons_lang') || 'pt'
    } catch {
      return 'pt'
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('lessons_lang', lang)
    } catch {
      /* ignore */
    }
  }, [lang])

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}lessons/index.json`)
      .then((r) => r.json())
      .then((d) => setList(d.lessons || []))
      .catch(() => setList([]))
  }, [])

  const t = T[lang]

  if (active) {
    return (
      <LessonDetail
        lesson={active}
        lang={lang}
        setLang={setLang}
        t={t}
        onBack={() => setActive(null)}
        onHome={onExit}
      />
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-28 pt-6">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={onExit} className="btn">
          <ArrowLeft size={16} /> {t.home}
        </button>
        <div className="flex items-center gap-2 font-display text-xl font-bold text-white">
          <GraduationCap size={20} className="text-violet" /> {t.aulas}
        </div>
        <LangToggle lang={lang} setLang={setLang} />
      </div>

      <p className="mb-6 max-w-2xl font-body text-sm text-white/55">{t.intro}</p>

      {list === null ? (
        <div className="grid place-items-center pt-20 font-display text-white/60">
          <span className="animate-pulse">{t.loading}</span>
        </div>
      ) : list.length === 0 ? (
        <div className="glass p-6 font-body text-white/60">{t.empty}</div>
      ) : (
        <>
          <Section
            label={t.gaps}
            hint={t.gapsHint}
            items={list.filter((l) => l.group !== 'course')}
            lang={lang}
            onPick={setActive}
          />
          <Section
            label={t.course}
            hint={t.courseHint}
            items={list.filter((l) => l.group === 'course')}
            lang={lang}
            onPick={setActive}
          />
        </>
      )}
    </div>
  )
}

function LangToggle({ lang, setLang }) {
  return (
    <div className="ml-auto flex items-center rounded-lg border border-white/12 bg-white/[0.05] p-0.5 font-display text-xs font-bold">
      {['pt', 'en'].map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`rounded-md px-2.5 py-1 transition-colors ${
            lang === l ? 'bg-violet/30 text-white' : 'text-white/45 hover:text-white/80'
          }`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

function lessonTitle(l, lang) {
  return lang === 'en' ? l.title_en || l.title : l.title
}

function Section({ label, hint, items, lang, onPick }) {
  if (!items.length) return null
  return (
    <section className="mb-10">
      <div className="mb-1 flex items-baseline gap-3">
        <h2 className="font-display text-lg font-bold text-white">{label}</h2>
        <span className="font-mono text-xs text-white/40">{items.length}</span>
      </div>
      <p className="mb-4 font-body text-sm text-white/45">{hint}</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((l, i) => (
          <LessonCard key={l.slug} lesson={l} index={i} lang={lang} onPick={onPick} />
        ))}
      </div>
    </section>
  )
}

function LessonCard({ lesson: l, index: i, lang, onPick }) {
  const badge = l.module != null ? String(l.module).padStart(2, '0') : String(l.id).padStart(2, '0')
  return (
    <motion.button
      onClick={() => onPick(l)}
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 * i, type: 'spring', stiffness: 220, damping: 22 }}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      className="group glass relative flex flex-col items-start gap-3 overflow-hidden p-5 text-left transition-colors hover:border-white/25"
    >
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-violet/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <span className="grid h-11 w-11 place-items-center rounded-xl border border-white/12 bg-white/[0.06] font-mono text-lg font-bold text-violet transition-shadow duration-300 group-hover:[box-shadow:0_0_26px_-6px_currentColor]">
        {badge}
      </span>
      <div className="flex items-start gap-1 font-display text-base font-semibold leading-snug text-white">
        {lessonTitle(l, lang)}
        <ArrowUpRight size={15} className="mt-0.5 shrink-0 opacity-0 -translate-x-1 transition-all group-hover:translate-x-0 group-hover:opacity-60" />
      </div>
    </motion.button>
  )
}

function LessonDetail({ lesson, lang, setLang, t, onBack, onHome }) {
  const [html, setHtml] = useState('')
  const quadroPath = lang === 'en' && lesson.quadro_en ? lesson.quadro_en : lesson.quadro
  const audioPath = lang === 'en' ? lesson.audio_en : lesson.audio

  useEffect(() => {
    setHtml('')
    fetch(`${import.meta.env.BASE_URL}lessons/${quadroPath}`)
      .then((r) => r.text())
      // remove o primeiro H1 (já mostramos o título no cabeçalho)
      .then((md) => setHtml(marked.parse(md.replace(/^#\s.*\n/, ''))))
      .catch(() => setHtml(`<p>${t.loadErr}</p>`))
  }, [quadroPath, t.loadErr])

  return (
    <div className="mx-auto max-w-4xl px-4 pb-28 pt-6">
      <div className="mb-5 flex items-center gap-3">
        <button onClick={onBack} className="btn">
          <ArrowLeft size={16} /> {t.backList}
        </button>
        <button onClick={onHome} className="btn text-white/55">
          {t.home}
        </button>
        <LangToggle lang={lang} setLang={setLang} />
      </div>

      <div className="mb-5 flex items-baseline gap-3">
        <h1 className="font-display text-2xl font-bold leading-tight text-white sm:text-3xl">
          {lessonTitle(lesson, lang)}
        </h1>
        <span className="shrink-0 font-mono text-sm text-white/40">
          {t.lesson} {String(lesson.id).padStart(2, '0')}
        </span>
      </div>

      {audioPath ? (
        <AudioPlayer key={audioPath} src={`${import.meta.env.BASE_URL}lessons/${audioPath}`} />
      ) : (
        <div className="glass flex items-center gap-2 p-3 font-body text-sm text-white/45">
          <Headphones size={15} /> {lang === 'en' ? t.audioEnSoon : t.audioSoon}
        </div>
      )}

      <motion.article
        key={quadroPath}
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
          aria-label={playing ? 'Pause' : 'Play'}
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
