import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Flame, Home as HomeIcon, Check, X, Trophy } from 'lucide-react'
import QuestionCard from './QuestionCard'
import { isAnswerCorrect } from '../lib/data'
import { popBurst, bigCelebration } from '../lib/confetti'

export default function Practice({ title, questions, streak, allAnswered = false, onAnswer, onExit }) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState([]) // letters chosen this question
  const [revealed, setRevealed] = useState(false)
  const [wasCorrect, setWasCorrect] = useState(false)
  const [xpGain, setXpGain] = useState(0)
  const [done, setDone] = useState(false)
  const [hits, setHits] = useState(0)
  const shownAt = useRef(Date.now()) // when the current question went on screen

  const total = questions.length
  const q = questions[index]
  const correctSet = q?.correctSet?.length ? q.correctSet : [q?.answer]

  // single-select reveals on click; multi-select toggles until "Conferir".
  function onSelect(letter, ev) {
    if (revealed) return
    if (q.multi) {
      setSelected((s) => (s.includes(letter) ? s.filter((l) => l !== letter) : [...s, letter]))
    } else {
      reveal([letter], ev)
    }
  }

  function reveal(sel, ev) {
    const correct = isAnswerCorrect(q, sel)
    setSelected(sel)
    setRevealed(true)
    setWasCorrect(correct)
    // mirrors the award in App.onAnswer so the number shown is the number given
    setXpGain(correct ? 10 + Math.min(streak, 12) * 2 : 0)
    if (correct) {
      setHits((h) => h + 1)
      const pt = ev?.clientX ? { x: ev.clientX, y: ev.clientY } : undefined
      popBurst(pt)
    }
    onAnswer(q, correct, { ms: Date.now() - shownAt.current, mode: 'p' })
  }

  function next() {
    if (index + 1 >= total) {
      setDone(true)
      bigCelebration()
      return
    }
    setIndex((i) => i + 1)
    setSelected([])
    setRevealed(false)
    shownAt.current = Date.now()
  }

  if (done) return <Completion title={title} hits={hits} total={total} onExit={onExit} />

  const pct = ((index + (revealed ? 1 : 0)) / total) * 100
  const canCheck = q.multi && !revealed

  return (
    <div className="mx-auto max-w-3xl px-4 pb-40 pt-5">
      {/* run header: quit, progress, streak — always in the same place */}
      <div className="mb-5 flex items-center gap-3 sm:gap-4">
        <button
          onClick={onExit}
          aria-label="Sair da sessão"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-faint transition-colors hover:bg-sunken hover:text-ink"
        >
          <X size={24} strokeWidth={2.5} />
        </button>

        <div className="h-4 flex-1 overflow-hidden rounded-full bg-line">
          <motion.div
            className="relative h-full rounded-full bg-brand"
            animate={{ width: `${pct}%` }}
            transition={{ type: 'spring', stiffness: 140, damping: 22 }}
          >
            {/* gloss stripe — the bar reads as filled, not just coloured */}
            <span className="absolute inset-x-1.5 top-[3px] h-[3px] rounded-full bg-white/35" />
          </motion.div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 font-display text-lg font-extrabold text-amber">
          <Flame
            key={`${index}-${revealed && wasCorrect}`}
            size={20}
            className={revealed && wasCorrect ? 'animate-flame-pulse' : ''}
            fill="currentColor"
          />
          {streak}
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="truncate font-display text-sm font-extrabold uppercase tracking-wide text-muted">{title}</span>
        {allAnswered && (
          <span className="chip shrink-0 border-mint/30 bg-mint/10 text-mint">
            <Check size={13} strokeWidth={3} /> revisão · {total}
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        <QuestionCard
          key={q.id}
          q={q}
          index={index}
          total={total}
          selected={selected}
          revealed={revealed}
          onSelect={(letter, e) => onSelect(letter, e)}
        />
      </AnimatePresence>

      {/* ---- the slab: verdict and the way forward, pinned to the thumb ---- */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            key="verdict"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 420, damping: 36 }}
            className={`fixed inset-x-0 bottom-0 z-40 border-t-2 ${
              wasCorrect ? 'border-[#16A05A] bg-[#E3F6EC]' : 'border-[#D93843] bg-[#FDEAEB]'
            }`}
          >
            <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4 sm:gap-4 sm:py-5">
              <span
                className={`grid h-11 w-11 shrink-0 animate-pop-in place-items-center rounded-full sm:h-12 sm:w-12 ${
                  wasCorrect ? 'bg-[#16A05A]' : 'bg-[#D93843]'
                }`}
              >
                {wasCorrect ? (
                  <Check size={26} strokeWidth={3.5} className="text-white" />
                ) : (
                  <X size={26} strokeWidth={3.5} className="text-white" />
                )}
              </span>

              <div className="min-w-0 flex-1">
                <div
                  className={`font-display text-lg font-extrabold leading-tight sm:text-2xl ${
                    wasCorrect ? 'text-[#0C6537]' : 'text-[#99202A]'
                  }`}
                >
                  {wasCorrect ? 'Acertou!' : 'Não foi dessa vez'}
                </div>
                <div
                  className={`truncate font-body text-sm font-semibold ${
                    wasCorrect ? 'text-[#177A46]' : 'text-[#B03039]'
                  }`}
                >
                  {wasCorrect ? (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="animate-pop-in font-mono font-extrabold">+{xpGain} XP</span>
                      <span className="text-[#177A46]/70">· sequência {streak + 1}</span>
                    </span>
                  ) : (
                    <>Resposta certa: <span className="font-mono font-extrabold">{correctSet.join(' + ')}</span></>
                  )}
                </div>
              </div>

              <button onClick={next} className={wasCorrect ? 'btn-right shrink-0' : 'btn-wrong shrink-0'}>
                <span className="hidden sm:inline">{index + 1 >= total ? 'Terminar' : 'Continuar'}</span>
                <ArrowRight size={20} strokeWidth={3} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- multi-select: same bottom position, neutral until you commit ---- */}
      <AnimatePresence>
        {canCheck && (
          <motion.div
            key="check"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 420, damping: 36 }}
            className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-line bg-surface"
          >
            <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4 sm:py-5">
              <span className="font-display text-sm font-bold text-muted">
                {selected.length} de {q.correctSet.length} marcadas
              </span>
              <button
                onClick={(e) => reveal(selected, e)}
                disabled={selected.length !== q.correctSet.length}
                className="btn-accent ml-auto shrink-0"
              >
                Conferir <Check size={20} strokeWidth={3} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Completion({ title, hits, total, onExit }) {
  const pct = Math.round((hits / total) * 100)
  const tone = pct >= 70 ? 'text-mint' : pct >= 50 ? 'text-amber' : 'text-coral'
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 pt-14 text-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="glass-strong w-full p-8"
      >
        <span className="mx-auto mb-4 grid h-16 w-16 animate-pop-in place-items-center rounded-2xl bg-amber/15">
          <Trophy className="text-amber" size={34} />
        </span>
        <h2 className="font-display text-3xl font-extrabold text-ink">Série concluída</h2>
        <p className="mt-1 font-body text-muted">{title}</p>
        <div className={`my-6 font-mono text-6xl font-extrabold tracking-tight ${tone}`}>{pct}%</div>
        <p className="font-body text-muted">
          Você acertou <span className="font-extrabold text-ink">{hits}</span> de{' '}
          <span className="font-extrabold text-ink">{total}</span> questões.
        </p>
        <button onClick={onExit} className="btn-accent mx-auto mt-7">
          <HomeIcon size={20} strokeWidth={2.5} /> Voltar ao início
        </button>
      </motion.div>
    </div>
  )
}
