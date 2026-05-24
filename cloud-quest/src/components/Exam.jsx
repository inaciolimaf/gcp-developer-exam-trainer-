import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Clock, Flag, Trophy, BarChart3, Layers } from 'lucide-react'
import { sample, DOMAIN_LABELS } from '../lib/data'
import QuestionCard from './QuestionCard'
import { bigCelebration } from '../lib/confetti'

const PASS_PCT = 70

export default function Exam({ pool, onAnswerBatch, onExit, onHistory }) {
  const [phase, setPhase] = useState('setup') // setup | run | result
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [index, setIndex] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [reviewAll, setReviewAll] = useState(false)
  const timerRef = useRef(null)

  function begin(n) {
    setQuestions(sample(pool, n))
    setAnswers({})
    setIndex(0)
    setSecondsLeft(n * 90) // 90s per question
    setPhase('run')
  }

  useEffect(() => {
    if (phase !== 'run') return
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current)
          finish()
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const score = useMemo(() => {
    if (phase !== 'result') return null
    const correct = questions.filter((q) => answers[q.id] === q.answer).length
    return { correct, total: questions.length, pct: Math.round((correct / questions.length) * 100) }
  }, [phase, questions, answers])

  function finish() {
    clearInterval(timerRef.current)
    const correct = questions.filter((q) => answers[q.id] === q.answer).length
    const pct = Math.round((correct / questions.length) * 100)
    onAnswerBatch(questions, answers, pct >= PASS_PCT, pct === 100)
    if (pct >= PASS_PCT) setTimeout(bigCelebration, 250)
    setPhase('result')
  }

  // ---------- SETUP ----------
  if (phase === 'setup') {
    const opts = [20, 40, 50, Math.min(60, pool.length)].filter((n, i, a) => n <= pool.length && a.indexOf(n) === i)
    return (
      <div className="mx-auto max-w-lg px-4 pt-12 text-center">
        <button onClick={onExit} className="btn mb-6">
          <ArrowLeft size={16} /> Home
        </button>
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-strong p-7 shadow-glow-soft"
        >
          <Clock className="mx-auto mb-3 text-coral" size={44} />
          <h2 className="font-display text-3xl font-bold text-white">Mock Exam</h2>
          <p className="mx-auto mt-2 max-w-sm font-body text-white/55">
            Pick a length. You get <span className="text-white/90">90 seconds</span> per question and no feedback until
            you submit. Pass mark is <span className="text-white/90">{PASS_PCT}%</span>.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {opts.map((n) => (
              <button key={n} onClick={() => begin(n)} className="btn-accent py-4">
                {n} questions
              </button>
            ))}
          </div>
          <p className="mt-4 font-mono text-xs text-white/35">{pool.length} questions available</p>
        </motion.div>
      </div>
    )
  }

  // ---------- RESULT ----------
  if (phase === 'result') {
    const passed = score.pct >= PASS_PCT
    const wrong = questions.filter((q) => answers[q.id] !== q.answer)

    // per-domain breakdown
    const domains = {}
    for (const q of questions) {
      const d = (domains[q.domain] ??= { code: q.domain, name: q.domainName, correct: 0, total: 0 })
      d.total += 1
      if (answers[q.id] === q.answer) d.correct += 1
    }
    const domainRows = Object.values(domains).sort((a, b) => String(a.code).localeCompare(String(b.code)))
    const reviewList = reviewAll ? questions : wrong

    return (
      <div className="mx-auto max-w-3xl px-4 pb-28 pt-8">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 14 }}
          className="glass-strong p-8 text-center shadow-glow-soft"
        >
          <Trophy className={`mx-auto mb-2 ${passed ? 'text-amber' : 'text-white/30'}`} size={52} />
          <h2 className="font-display text-3xl font-bold text-white">
            {passed ? 'You passed!' : 'Not yet — keep going'}
          </h2>
          <div
            className={`my-4 font-mono text-7xl font-bold tracking-tight ${
              passed ? 'text-mint [text-shadow:0_0_36px_rgba(52,211,153,0.45)]' : 'text-coral'
            }`}
          >
            {score.pct}%
          </div>
          <p className="font-body text-white/65">
            {score.correct} / {score.total} correct · pass mark {PASS_PCT}%
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {onHistory && (
              <button onClick={onHistory} className="btn">
                <BarChart3 size={16} /> View history
              </button>
            )}
            <button onClick={onExit} className="btn-accent">
              Back home <ArrowRight size={18} />
            </button>
          </div>
        </motion.div>

        {/* per-domain breakdown */}
        <div className="glass mt-6 p-5">
          <div className="mb-4 flex items-center gap-2 label">
            <Layers size={14} /> By exam domain
          </div>
          <div className="grid gap-3">
            {domainRows.map((d) => {
              const pct = Math.round((d.correct / d.total) * 100)
              return (
                <div key={d.code} className="flex items-center gap-3">
                  <span className="w-8 shrink-0 font-mono text-xs font-bold text-violet">{d.code}</span>
                  <span className="hidden min-w-0 flex-1 truncate font-body text-sm text-white/70 sm:block">
                    {DOMAIN_LABELS[d.code] || d.name}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full border border-white/10 bg-white/[0.04] sm:flex-none sm:w-40">
                    <div
                      className={`h-full rounded-full ${pct < 50 ? 'bg-coral' : pct < 70 ? 'bg-amber' : 'bg-mint'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="shrink-0 font-mono text-xs text-white/60">
                    {d.correct}/{d.total}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* answer review */}
        <div className="mt-9">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-display text-2xl font-bold text-white">
              Review answers {reviewAll ? `(${questions.length})` : `(${wrong.length} missed)`}
            </h3>
            <div className="flex gap-1 rounded-xl border border-white/10 bg-white/[0.04] p-1">
              <button
                onClick={() => setReviewAll(false)}
                className={`rounded-lg px-3 py-1.5 font-display text-sm font-semibold transition-colors ${
                  !reviewAll ? 'bg-white/10 text-coral' : 'text-white/55 hover:text-white'
                }`}
              >
                Missed
              </button>
              <button
                onClick={() => setReviewAll(true)}
                className={`rounded-lg px-3 py-1.5 font-display text-sm font-semibold transition-colors ${
                  reviewAll ? 'bg-white/10 text-cyan' : 'text-white/55 hover:text-white'
                }`}
              >
                All
              </button>
            </div>
          </div>
          {reviewList.length === 0 ? (
            <div className="glass p-6 text-center font-body text-white/60">
              Perfect run — nothing missed. 🎉
            </div>
          ) : (
            <div className="grid gap-5">
              {reviewList.map((q) => (
                <QuestionCard key={q.id} q={q} index={null} total={null} selected={answers[q.id] || null} revealed />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ---------- RUN ----------
  const q = questions[index]
  const answeredCount = Object.keys(answers).length
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const ss = String(secondsLeft % 60).padStart(2, '0')
  const low = secondsLeft <= 60

  return (
    <div className="mx-auto max-w-3xl px-4 pb-28 pt-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <button onClick={onExit} className="btn px-3">
          <ArrowLeft size={16} />
        </button>
        <div className={`chip font-mono ${low ? 'animate-wiggle border-coral/60 text-coral shadow-glow-coral' : ''}`}>
          <Clock size={14} /> {mm}:{ss}
        </div>
        <button onClick={finish} className="btn border-coral/40 text-coral hover:bg-coral/10">
          <Flag size={14} /> Submit
        </button>
      </div>

      {/* navigator */}
      <div className="mb-5 flex flex-wrap gap-1.5">
        {questions.map((qq, i) => {
          const ans = answers[qq.id]
          return (
            <button
              key={qq.id}
              onClick={() => setIndex(i)}
              className={[
                'h-7 w-7 rounded-md border font-mono text-[11px] font-bold transition-all',
                i === index ? 'ring-1 ring-violet ring-offset-1 ring-offset-base' : '',
                ans ? 'border-cyan/40 bg-cyan/15 text-cyan' : 'border-white/10 bg-white/[0.03] text-white/50',
              ].join(' ')}
            >
              {i + 1}
            </button>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        <QuestionCard
          key={q.id}
          q={q}
          index={index}
          total={questions.length}
          selected={answers[q.id] || null}
          revealed={false}
          onSelect={(letter) => setAnswers((a) => ({ ...a, [q.id]: letter }))}
        />
      </AnimatePresence>

      <div className="mt-5 flex items-center justify-between gap-3">
        <button onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0} className="btn">
          <ArrowLeft size={18} /> Prev
        </button>
        <span className="font-mono text-xs text-white/45">
          {answeredCount}/{questions.length} answered
        </span>
        {index + 1 < questions.length ? (
          <button onClick={() => setIndex((i) => i + 1)} className="btn-accent px-5 py-2.5">
            Next <ArrowRight size={18} />
          </button>
        ) : (
          <button onClick={finish} className="btn border-coral/40 text-coral hover:bg-coral/10">
            Submit <Flag size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
