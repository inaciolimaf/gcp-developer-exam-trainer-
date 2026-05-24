import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Flame, PartyPopper, Home as HomeIcon } from 'lucide-react'
import QuestionCard from './QuestionCard'
import { popBurst, bigCelebration } from '../lib/confetti'

export default function Practice({ title, questions, streak, onAnswer, onExit }) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [done, setDone] = useState(false)
  const [hits, setHits] = useState(0)

  const total = questions.length
  const q = questions[index]

  function choose(letter, ev) {
    if (revealed) return
    const correct = letter === q.answer
    setSelected(letter)
    setRevealed(true)
    if (correct) {
      setHits((h) => h + 1)
      const pt = ev?.clientX ? { x: ev.clientX, y: ev.clientY } : undefined
      popBurst(pt)
    }
    onAnswer(q, correct)
  }

  function next() {
    if (index + 1 >= total) {
      setDone(true)
      bigCelebration()
      return
    }
    setIndex((i) => i + 1)
    setSelected(null)
    setRevealed(false)
  }

  if (done) return <Completion title={title} hits={hits} total={total} onExit={onExit} />

  return (
    <div className="mx-auto max-w-3xl px-4 pb-28 pt-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <button onClick={onExit} className="btn">
          <ArrowLeft size={16} /> Quit
        </button>
        <div className="truncate font-display text-base font-semibold text-white/80">{title}</div>
        <div className="chip border-amber/40 text-amber">
          <Flame size={14} /> {streak}
        </div>
      </div>

      {/* session progress bar */}
      <div className="mb-5 h-2 overflow-hidden rounded-full border border-white/10 bg-white/[0.04]">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-cyan to-violet shadow-glow-cyan"
          animate={{ width: `${((index + (revealed ? 1 : 0)) / total) * 100}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <QuestionCard
          key={q.id}
          q={q}
          index={index}
          total={total}
          selected={selected}
          revealed={revealed}
          onSelect={(letter, e) => choose(letter, e)}
        />
      </AnimatePresence>

      <AnimatePresence>
        {revealed && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5 flex justify-end">
            <button onClick={next} className="btn-accent">
              {index + 1 >= total ? 'Finish' : 'Next'} <ArrowRight size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Completion({ title, hits, total, onExit }) {
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
        <h2 className="font-display text-3xl font-bold text-white">Set complete</h2>
        <p className="mt-1 font-body text-white/55">{title}</p>
        <div className="my-6 font-mono text-6xl font-bold tracking-tight text-mint [text-shadow:0_0_32px_rgba(52,211,153,0.4)]">
          {pct}%
        </div>
        <p className="font-body text-white/70">
          You nailed <span className="font-semibold text-white">{hits}</span> of{' '}
          <span className="font-semibold text-white">{total}</span> questions.
        </p>
        <button onClick={onExit} className="btn-accent mx-auto mt-7">
          <HomeIcon size={18} /> Back home
        </button>
      </motion.div>
    </div>
  )
}
