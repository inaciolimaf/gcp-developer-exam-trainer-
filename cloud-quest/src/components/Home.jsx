import { motion } from 'framer-motion'
import {
  Shuffle,
  Timer,
  ListOrdered,
  Tags,
  Layers,
  BookOpen,
  AlertTriangle,
  Eye,
  Target,
  Flame,
  Award,
  ArrowUpRight,
  BookOpenText,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { correctCount, seenCount } from '../lib/storage'

const MODES = [
  { key: 'random', title: 'Random Blitz', desc: 'Endless shuffled questions, instant feedback.', icon: Shuffle, glow: 'shadow-glow-cyan', ring: 'text-cyan', from: 'from-cyan/25' },
  { key: 'exam', title: 'Mock Exam', desc: 'Timed simulation. No peeking until you submit.', icon: Timer, glow: 'shadow-glow-coral', ring: 'text-coral', from: 'from-coral/25' },
  { key: 'list', title: 'Question List', desc: 'Walk the full bank in order, start to end.', icon: ListOrdered, glow: 'shadow-glow-violet', ring: 'text-violet', from: 'from-violet/25' },
  { key: 'topic', title: 'By Topic', desc: 'Drill one service: GKE, Pub/Sub, IAM…', icon: Tags, glow: 'shadow-glow-mint', ring: 'text-mint', from: 'from-mint/25' },
  { key: 'domain', title: 'By Exam Domain', desc: 'Focus on one of the four exam sections.', icon: Layers, glow: 'shadow-glow-pink', ring: 'text-pink', from: 'from-pink/25' },
  { key: 'module', title: 'By Course Module', desc: 'Match questions to your course modules.', icon: BookOpen, glow: 'shadow-glow-cyan', ring: 'text-cyan', from: 'from-cyan/25' },
  { key: 'gaps', title: 'Study the Gaps', desc: 'Only topics lightly covered in the course.', icon: AlertTriangle, glow: 'shadow-glow-coral', ring: 'text-amber', from: 'from-amber/25' },
]

export default function Home({ bank, state, onStart }) {
  const total = bank.indexes.total
  const seen = seenCount(state)
  const correct = correctCount(state)

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        className="mb-10 text-center"
      >
        <span className="label inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-mint animate-pulse-glow" />
          {total} questions · Professional Cloud Developer
        </span>
        <h1 className="mt-5 font-display text-6xl font-extrabold leading-none tracking-tight sm:text-7xl">
          <span className="bg-gradient-to-r from-cyan via-violet to-pink bg-clip-text text-transparent [text-shadow:0_0_40px_rgba(139,92,246,0.35)]">
            Cloud Quest
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-md font-body text-white/55">
          Turn 741 exam questions into a game. Pick how you want to play, then chase the streak.
        </p>
      </motion.div>

      {/* Progress strip */}
      <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Seen" value={`${seen}/${total}`} icon={Eye} tint="text-cyan" />
        <Stat label="Correct" value={correct} icon={Target} tint="text-mint" />
        <Stat label="Best streak" value={state.bestStreak} icon={Flame} tint="text-amber" />
        <Stat label="Badges" value={state.badges.length} icon={Award} tint="text-pink" />
      </div>

      {/* Featured: Study Guide */}
      <motion.button
        onClick={() => onStart('guide')}
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.99 }}
        className="group glass relative mb-4 flex w-full items-center gap-4 overflow-hidden p-5 text-left transition-colors hover:border-white/25"
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-cyan/15 via-violet/10 to-transparent opacity-70 transition-opacity group-hover:opacity-100" />
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-white/12 bg-white/[0.06] text-cyan transition-shadow group-hover:[box-shadow:0_0_26px_-6px_currentColor]">
          <BookOpenText size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-display text-xl font-semibold text-white">Study Guide</div>
          <div className="mt-0.5 font-body text-sm text-white/55">
            What actually gets tested vs. what the course teaches — gaps, module roadmap, lecture-by-lecture.
          </div>
        </div>
        <ArrowRight size={20} className="shrink-0 text-white/40 transition-transform group-hover:translate-x-1" />
      </motion.button>

      {/* Featured: Flashcards */}
      <motion.button
        onClick={() => onStart('flashcards')}
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, type: 'spring', stiffness: 220, damping: 22 }}
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.99 }}
        className="group glass relative mb-4 flex w-full items-center gap-4 overflow-hidden p-5 text-left transition-colors hover:border-white/25"
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-mint/15 via-cyan/10 to-transparent opacity-70 transition-opacity group-hover:opacity-100" />
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-white/12 bg-white/[0.06] text-mint transition-shadow group-hover:[box-shadow:0_0_26px_-6px_currentColor]">
          <Sparkles size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-display text-xl font-semibold text-white">Flashcards</div>
          <div className="mt-0.5 font-body text-sm text-white/55">
            272 service cards — flip, recall, self-grade. Drill any category or just the newest additions.
          </div>
        </div>
        <ArrowRight size={20} className="shrink-0 text-white/40 transition-transform group-hover:translate-x-1" />
      </motion.button>

      {/* Mode grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODES.map((m, i) => (
          <motion.button
            key={m.key}
            onClick={() => onStart(m.key)}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i, type: 'spring', stiffness: 220, damping: 22 }}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
            className="group glass relative flex flex-col items-start gap-4 overflow-hidden p-5 text-left transition-colors hover:border-white/25"
          >
            {/* hover wash */}
            <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${m.from} to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
            <span className={`grid h-12 w-12 place-items-center rounded-xl border border-white/12 bg-white/[0.06] ${m.ring} transition-shadow duration-300 group-hover:[box-shadow:0_0_26px_-6px_currentColor]`}>
              <m.icon size={22} />
            </span>
            <div>
              <div className="flex items-center gap-1 font-display text-xl font-semibold text-white">
                {m.title}
                <ArrowUpRight size={16} className="opacity-0 -translate-x-1 transition-all group-hover:translate-x-0 group-hover:opacity-60" />
              </div>
              <div className="mt-0.5 font-body text-sm text-white/50">{m.desc}</div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
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
