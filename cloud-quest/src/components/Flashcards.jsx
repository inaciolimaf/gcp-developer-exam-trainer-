import { useState, useMemo, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  Shuffle,
  Sparkles,
  RotateCcw,
  Layers,
  Eye,
  Repeat,
  PartyPopper,
  Home as HomeIcon,
  MousePointerClick,
} from 'lucide-react'
import { shuffle } from '../lib/data'
import { flashMasteredCount } from '../lib/storage'
import { popBurst, bigCelebration } from '../lib/confetti'

const ACCENTS = ['text-cyan', 'text-violet', 'text-pink', 'text-mint', 'text-amber', 'text-coral']

export default function Flashcards({ data, progress, onMark, onReset, onExit, initialSession = null }) {
  // null = menu; otherwise { title, cards }. initialSession (e.g. a review
  // queue) jumps straight into study, skipping the deck menu.
  const [session, setSession] = useState(
    initialSession && initialSession.cards?.length ? initialSession : null,
  )
  const [newOnly, setNewOnly] = useState(false)

  const pool = useMemo(
    () => (newOnly ? data.cards.filter((c) => c.isNew) : data.cards),
    [data.cards, newOnly],
  )

  const startAll = () =>
    setSession({ title: newOnly ? 'New cards' : 'All cards', cards: shuffle(pool) })

  const startCategory = (cat) =>
    setSession({
      title: cat,
      cards: shuffle(pool.filter((c) => c.category === cat)),
    })

  if (session) {
    return (
      <Study
        title={session.title}
        cards={session.cards}
        progress={progress}
        onMark={onMark}
        onExit={() => setSession(null)}
        onHome={onExit}
      />
    )
  }

  return (
    <Menu
      data={data}
      pool={pool}
      progress={progress}
      newOnly={newOnly}
      setNewOnly={setNewOnly}
      onStartAll={startAll}
      onStartCategory={startCategory}
      onReset={onReset}
      onExit={onExit}
    />
  )
}

/* ---------------------------------------------------------------- Menu --- */

function Menu({ data, pool, progress, newOnly, setNewOnly, onStartAll, onStartCategory, onReset, onExit }) {
  const mastered = flashMasteredCount(progress)
  const pct = data.total ? Math.round((mastered / data.total) * 100) : 0

  const categories = useMemo(() => {
    const map = new Map()
    for (const c of pool) {
      const cur = map.get(c.category) || { name: c.category, count: 0, mastered: 0 }
      cur.count += 1
      if (progress[c.id]?.known) cur.mastered += 1
      map.set(c.category, cur)
    }
    return [...map.values()].sort((a, b) => b.count - a.count)
  }, [pool, progress])

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-6">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={onExit} className="btn">
          <ArrowLeft size={16} /> Home
        </button>
        <div className="flex items-center gap-2 font-display text-xl font-bold text-white">
          <Layers size={20} className="text-cyan" /> Flashcards
        </div>
        <button onClick={onReset} className="btn ml-auto shrink-0 px-3 text-white/60" title="Reset flashcard progress">
          <RotateCcw size={15} />
        </button>
      </div>

      {/* hero */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        className="mb-7 text-center"
      >
        <span className="label inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
          <Repeat size={12} className="text-mint" />
          {data.total} cards · term → meaning
        </span>
        <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
          <span className="bg-gradient-to-r from-cyan via-violet to-pink bg-clip-text text-transparent">
            Service Flashcards
          </span>
        </h1>
        <p className="mx-auto mt-3 max-w-md font-body text-white/55">
          Flip a card, recall what the service does, then grade yourself. Spaced-style recall for every GCP product
          and concept.
        </p>
      </motion.div>

      {/* mastery bar */}
      <div className="glass mb-6 flex items-center gap-4 p-4">
        <Sparkles size={20} className="shrink-0 text-mint" />
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <span className="label">Mastered</span>
            <span className="font-mono text-sm font-bold text-white">
              {mastered}/{data.total} <span className="text-white/40">· {pct}%</span>
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full border border-white/10 bg-white/[0.05]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-cyan to-mint"
              animate={{ width: `${pct}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            />
          </div>
        </div>
      </div>

      {/* controls */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button onClick={onStartAll} className="btn-accent flex-1 justify-center">
          <Shuffle size={18} /> Study {newOnly ? `${pool.length} new cards` : `all ${pool.length} cards`}
        </button>
        <button
          onClick={() => setNewOnly((v) => !v)}
          className={`btn justify-center ${newOnly ? 'border-pink/50 bg-pink/10 text-pink' : ''}`}
        >
          <Sparkles size={16} /> New cards only · {data.newCount}
        </button>
      </div>

      {/* category grid */}
      <div className="mb-3 label">Or drill one category</div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c, i) => {
          const accent = ACCENTS[i % ACCENTS.length]
          const cpct = c.count ? Math.round((c.mastered / c.count) * 100) : 0
          return (
            <motion.button
              key={c.name}
              onClick={() => onStartCategory(c.name)}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.min(i * 0.02, 0.4) }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              className="group glass flex flex-col gap-3 p-4 text-left transition-colors hover:border-white/25"
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`font-display text-[15px] font-semibold text-white/90 ${accent}`}>{c.name}</span>
                <span className="chip shrink-0 font-mono">{c.count}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full border border-white/10 bg-white/[0.04]">
                <div className="h-full rounded-full bg-gradient-to-r from-cyan to-mint" style={{ width: `${cpct}%` }} />
              </div>
              <span className="label">{c.mastered}/{c.count} mastered</span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

/* --------------------------------------------------------------- Study --- */

function Study({ title, cards, progress, onMark, onExit, onHome }) {
  const [index, setIndex] = useState(0)
  const [showBack, setShowBack] = useState(false)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [hits, setHits] = useState(0)
  const controls = useAnimationControls()

  const total = cards.length
  const card = cards[index]

  // half-flip: spin to the edge (invisible), swap the face, spin back — so
  // only one side is ever on screen (no see-through, no overlap).
  const flip = useCallback(async () => {
    if (busy) return
    setBusy(true)
    await controls.start({ rotateY: -90, transition: { duration: 0.13, ease: 'easeIn' } })
    setShowBack((s) => !s)
    await controls.start({ rotateY: 0, transition: { duration: 0.13, ease: 'easeOut' } })
    setBusy(false)
  }, [busy, controls])

  const grade = useCallback(
    (known, ev) => {
      onMark(card.id, known)
      if (known) {
        setHits((h) => h + 1)
        const pt = ev?.clientX ? { x: ev.clientX, y: ev.clientY } : undefined
        popBurst(pt)
      }
      if (index + 1 >= total) {
        setDone(true)
        bigCelebration()
        return
      }
      setIndex((i) => i + 1)
      setShowBack(false)
      controls.set({ rotateY: 0 })
    },
    [card, index, total, onMark, controls],
  )

  // keyboard: Space/Enter flips; ←/1 = Again, →/2 = Got it (after flip)
  useEffect(() => {
    if (done) return
    function onKey(e) {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault()
        flip()
      } else if (showBack && (e.code === 'ArrowRight' || e.key === '2')) {
        grade(true)
      } else if (showBack && (e.code === 'ArrowLeft' || e.key === '1')) {
        grade(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showBack, done, flip, grade])

  if (done) {
    return (
      <Completion
        title={title}
        hits={hits}
        total={total}
        onAgain={() => { setIndex(0); setShowBack(false); setDone(false); setHits(0); controls.set({ rotateY: 0 }) }}
        onExit={onExit}
        onHome={onHome}
      />
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pb-28 pt-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <button onClick={onExit} className="btn">
          <ArrowLeft size={16} /> Decks
        </button>
        <div className="truncate font-display text-base font-semibold text-white/80">{title}</div>
        <div className="chip font-mono">
          {String(index + 1).padStart(2, '0')} / {total}
        </div>
      </div>

      {/* session progress */}
      <div className="mb-6 h-2 overflow-hidden rounded-full border border-white/10 bg-white/[0.04]">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-cyan to-violet shadow-glow-cyan"
          animate={{ width: `${(index / total) * 100}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
      </div>

      {/* the flip card — a single surface whose content swaps mid-flip */}
      <div style={{ perspective: 1600 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 22, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -22, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 240, damping: 24 }}
          >
            <motion.button
              onClick={flip}
              animate={controls}
              style={{ transformOrigin: 'center', willChange: 'transform' }}
              className="glass-strong flex h-72 w-full flex-col items-center justify-center gap-5 p-6 shadow-glow-soft sm:h-80"
            >
              {showBack ? (
                <>
                  <span className="label inline-flex items-center gap-1.5 text-cyan">
                    <Eye size={13} /> {card.front}
                  </span>
                  <p className="px-3 text-center font-body text-xl leading-relaxed text-white/90 sm:text-2xl">
                    {card.back}
                  </p>
                  <span className="label text-white/40">how well did you recall it?</span>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <span className="chip">{card.category}</span>
                    {card.isNew && (
                      <span className="chip border-pink/45 bg-pink/10 text-pink">
                        <Sparkles size={12} /> new
                      </span>
                    )}
                  </div>
                  <h2 className="px-2 text-center font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
                    {card.front}
                  </h2>
                  <span className="label inline-flex items-center gap-1.5 text-white/40">
                    <MousePointerClick size={13} /> click or press space to flip
                  </span>
                </>
              )}
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* grading */}
      <AnimatePresence>
        {showBack && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 grid grid-cols-2 gap-3"
          >
            <button
              onClick={(e) => grade(false, e)}
              className="btn justify-center border-coral/45 bg-coral/10 py-3 text-coral hover:bg-coral/15"
            >
              <X size={18} /> Again
            </button>
            <button
              onClick={(e) => grade(true, e)}
              className="btn justify-center border-mint/45 bg-mint/10 py-3 text-mint hover:bg-mint/15"
            >
              <Check size={18} /> Got it
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {!showBack && (
        <p className="mt-6 text-center font-body text-sm text-white/40">
          Recall what <span className="text-white/70">{card.front}</span> does, then flip to check.
        </p>
      )}
    </div>
  )
}

function Completion({ title, hits, total, onAgain, onExit, onHome }) {
  const pct = Math.round((hits / total) * 100)
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 pt-16 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 14 }}
        className="glass-strong w-full p-8 shadow-glow-soft"
      >
        <PartyPopper className="mx-auto mb-3 text-cyan" size={52} />
        <h2 className="font-display text-3xl font-bold text-white">Deck complete</h2>
        <p className="mt-1 font-body text-white/55">{title}</p>
        <div className="my-6 font-mono text-6xl font-bold tracking-tight text-mint [text-shadow:0_0_32px_rgba(52,211,153,0.4)]">
          {pct}%
        </div>
        <p className="font-body text-white/70">
          You knew <span className="font-semibold text-white">{hits}</span> of{' '}
          <span className="font-semibold text-white">{total}</span> cards.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button onClick={onAgain} className="btn">
            <Repeat size={16} /> Run again
          </button>
          <button onClick={onExit} className="btn">
            <Layers size={16} /> More decks
          </button>
          <button onClick={onHome} className="btn-accent">
            <HomeIcon size={18} /> Home
          </button>
        </div>
      </motion.div>
    </div>
  )
}
