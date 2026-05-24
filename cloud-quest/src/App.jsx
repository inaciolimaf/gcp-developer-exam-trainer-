import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Flame, BookOpenText } from 'lucide-react'
import Background from './components/Background'
import Home from './components/Home'
import Picker from './components/Picker'
import Practice from './components/Practice'
import Exam from './components/Exam'
import Guide from './components/Guide'
import { loadBank, shuffle } from './lib/data'
import {
  loadState,
  saveState,
  recordAnswer,
  refreshBadges,
  levelInfo,
  levelTitle,
} from './lib/storage'

const GAP = 'pouco ensinado (gap)'

export default function App() {
  const [bank, setBank] = useState(null)
  const [error, setError] = useState(null)
  const [game, setGame] = useState(() => loadState())
  const [screen, setScreen] = useState({ name: 'home' })
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    loadBank().then(setBank).catch((e) => setError(e.message))
  }, [])

  useEffect(() => {
    saveState(game)
  }, [game])

  const showBadges = useCallback((badges) => {
    if (!badges.length) return
    setToasts((t) => [...t, ...badges])
    badges.forEach((b, i) =>
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== b.id)), 3200 + i * 300),
    )
  }, [])

  // single-question answer (Practice modes)
  const onAnswer = useCallback(
    (q, isCorrect) => {
      setGame((prev) => {
        const xpGain = 10 + Math.min(prev.streak, 12) * 2
        let next = recordAnswer(prev, q, isCorrect, xpGain)
        const { state, newBadges } = refreshBadges(next)
        if (newBadges.length) showBadges(newBadges)
        return state
      })
    },
    [showBadges],
  )

  // batch answer (Exam submit)
  const onAnswerBatch = useCallback(
    (questions, answers, passed, perfect) => {
      setGame((prev) => {
        let next = { ...prev, examsTaken: prev.examsTaken + 1 }
        for (const q of questions) {
          const correct = answers[q.id] === q.answer
          next = recordAnswer(next, q, correct, correct ? 12 : 0)
        }
        if (passed) next.examsPassed += 1
        if (perfect) next.badges = [...new Set([...next.badges, 'exam-ace'])]
        const { state, newBadges } = refreshBadges(next)
        if (newBadges.length) showBadges(newBadges)
        return state
      })
    },
    [showBadges],
  )

  if (error) return <Centered>⚠️ {error}</Centered>
  if (!bank) return <Centered><span className="animate-pulse">Loading the question bank…</span></Centered>

  const all = bank.questions
  const home = () => setScreen({ name: 'home' })

  function start(mode) {
    switch (mode) {
      case 'random':
        return setScreen({ name: 'practice', title: 'Random Blitz', questions: shuffle(all) })
      case 'list':
        return setScreen({
          name: 'practice',
          title: 'Question List',
          questions: [...all].sort((a, b) => a.number - b.number),
        })
      case 'gaps':
        return setScreen({
          name: 'practice',
          title: 'Study the Gaps',
          questions: shuffle(all.filter((q) => q.coverage === GAP)),
        })
      case 'exam':
        return setScreen({ name: 'exam', pool: all })
      case 'guide':
        return setScreen({ name: 'guide' })
      case 'topic':
        return setScreen({ name: 'pick', kind: 'topic', items: bank.indexes.topics })
      case 'domain':
        return setScreen({ name: 'pick', kind: 'domain', items: bank.indexes.domains })
      case 'module':
        return setScreen({ name: 'pick', kind: 'module', items: bank.indexes.modules })
      default:
        return
    }
  }

  function pick(kind, code) {
    let questions, title
    if (kind === 'topic') {
      questions = all.filter((q) => q.topicCode === code)
      title = `Topic · ${questions[0]?.topicName || code}`
    } else if (kind === 'domain') {
      questions = all.filter((q) => q.domain === code)
      title = `Domain · ${code}`
    } else {
      questions = all.filter((q) => q.modules.some((m) => m.id === code))
      title = `Module M${code}`
    }
    setScreen({ name: 'practice', title, questions: shuffle(questions) })
  }

  const lvl = levelInfo(game.xp)

  return (
    <div className="grain min-h-full">
      <Background />
      <TopBar
        game={game}
        lvl={lvl}
        onHome={home}
        clickable={screen.name !== 'home'}
        onGuide={() => start('guide')}
        guideActive={screen.name === 'guide'}
      />

      <AnimatePresence mode="wait">
        <motion.main
          key={screen.name + (screen.title || screen.kind || '')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {screen.name === 'home' && <Home bank={bank} state={game} onStart={start} />}
          {screen.name === 'pick' && (
            <Picker kind={screen.kind} items={screen.items} onPick={(code) => pick(screen.kind, code)} onBack={home} />
          )}
          {screen.name === 'practice' && (
            <Practice
              title={screen.title}
              questions={screen.questions}
              streak={game.streak}
              onAnswer={onAnswer}
              onExit={home}
            />
          )}
          {screen.name === 'exam' && <Exam pool={screen.pool} onAnswerBatch={onAnswerBatch} onExit={home} />}
          {screen.name === 'guide' && <Guide onExit={home} />}
        </motion.main>
      </AnimatePresence>

      {/* badge toasts */}
      <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map((b) => (
            <motion.div
              key={b.id}
              initial={{ x: 120, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 120, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              className="glass-strong flex items-center gap-3 px-4 py-3 shadow-glow-violet"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl border border-white/12 bg-white/[0.06] text-2xl">
                {b.emoji}
              </span>
              <div>
                <div className="label text-cyan">Badge unlocked</div>
                <div className="font-display text-lg font-bold leading-tight text-white">{b.name}</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

function TopBar({ game, lvl, onHome, clickable, onGuide, guideActive }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-base/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
        <button
          onClick={clickable ? onHome : undefined}
          className={`group flex items-center gap-2.5 ${clickable ? 'cursor-pointer' : 'cursor-default'}`}
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-cyan to-violet shadow-glow-violet">
            <span className="h-3 w-3 rounded-full border-2 border-white/90" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-white">Cloud Quest</span>
        </button>

        <button
          onClick={onGuide}
          className={`ml-1 hidden items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-display text-sm font-semibold transition-colors sm:flex ${
            guideActive ? 'text-cyan' : 'text-white/55 hover:text-white'
          }`}
        >
          <BookOpenText size={16} /> Guide
        </button>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 sm:flex">
            <span className="font-display text-sm font-semibold text-white/80">Lv {lvl.level}</span>
            <span className="font-display text-sm text-white/45">{levelTitle(lvl.level)}</span>
          </div>
          {/* xp bar */}
          <div className="hidden h-2.5 w-28 overflow-hidden rounded-full border border-white/10 bg-white/[0.05] sm:block">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-cyan to-violet"
              animate={{ width: `${lvl.pct}%` }}
            />
          </div>
          <div className="chip border-cyan/30 font-mono text-cyan">
            <Star size={13} /> {game.xp}
          </div>
          <div className="chip border-amber/30 font-mono text-amber">
            <Flame size={13} /> {game.streak}
          </div>
        </div>
      </div>
    </header>
  )
}

function Centered({ children }) {
  return (
    <div className="grid min-h-screen place-items-center font-display text-xl text-white/80">
      <Background />
      {children}
    </div>
  )
}
