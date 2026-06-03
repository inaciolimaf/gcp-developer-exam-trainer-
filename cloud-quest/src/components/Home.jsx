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
  Brain,
  Trophy,
  GraduationCap,
} from 'lucide-react'
import { correctCount, seenCount, dailyProgress, currentDayStreak, examStats } from '../lib/storage'

const MODES = [
  { key: 'random', title: 'Random Blitz', desc: 'Endless shuffled questions, instant feedback.', icon: Shuffle, glow: 'shadow-glow-cyan', ring: 'text-cyan', from: 'from-cyan/25' },
  { key: 'exam', title: 'Mock Exam', desc: 'Timed simulation. No peeking until you submit.', icon: Timer, glow: 'shadow-glow-coral', ring: 'text-coral', from: 'from-coral/25' },
  { key: 'list', title: 'Question List', desc: 'Walk the full bank in order, start to end.', icon: ListOrdered, glow: 'shadow-glow-violet', ring: 'text-violet', from: 'from-violet/25' },
  { key: 'topic', title: 'By Topic', desc: 'Drill one service: GKE, Pub/Sub, IAM…', icon: Tags, glow: 'shadow-glow-mint', ring: 'text-mint', from: 'from-mint/25' },
  { key: 'domain', title: 'By Exam Domain', desc: 'Focus on one of the four exam sections.', icon: Layers, glow: 'shadow-glow-pink', ring: 'text-pink', from: 'from-pink/25' },
  { key: 'module', title: 'By Course Module', desc: 'Match questions to your course modules.', icon: BookOpen, glow: 'shadow-glow-cyan', ring: 'text-cyan', from: 'from-cyan/25' },
  { key: 'gaps', title: 'Study the Gaps', desc: 'Only topics lightly covered in the course.', icon: AlertTriangle, glow: 'shadow-glow-coral', ring: 'text-amber', from: 'from-amber/25' },
]

export default function Home({ bank, state, onStart, dueCount = 0, total: totalProp, hqOnly = false, onToggleHq }) {
  const total = totalProp ?? bank.indexes.total
  const hqCount = bank.questions.filter((q) => q.highQuality).length
  const fullCount = bank.questions.length
  const seen = seenCount(state)
  const correct = correctCount(state)
  const daily = dailyProgress(state)
  const dayStreak = currentDayStreak(state)
  const exams = examStats(state)

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-8">
      {/* Smart Review nudge — only when something is actually due */}
      {dueCount > 0 && (
        <motion.button
          onClick={() => onStart('review')}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.99 }}
          className="group glass-strong relative mb-6 flex w-full items-center gap-4 overflow-hidden p-4 text-left shadow-glow-soft transition-colors hover:border-white/25"
        >
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-coral/15 via-violet/10 to-transparent" />
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/12 bg-white/[0.06] text-coral">
            <Brain size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-display text-base font-semibold text-white">
              {dueCount} {dueCount === 1 ? 'item' : 'items'} due for review
            </div>
            <div className="font-body text-sm text-white/55">Spaced repetition keeps it from slipping away.</div>
          </div>
          <span className="btn-accent shrink-0 px-4 py-2">
            Review <ArrowRight size={16} />
          </span>
        </motion.button>
      )}
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
          Turn {total} exam questions into a game. Pick how you want to play, then chase the streak.
        </p>

        {/* Quality filter: restrict the whole app to the curated set */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={onToggleHq}
            className={`group inline-flex items-center gap-2.5 rounded-full border px-4 py-2 font-display text-sm font-semibold transition-colors ${
              hqOnly
                ? 'border-mint/50 bg-mint/15 text-mint shadow-glow-mint'
                : 'border-white/12 bg-white/[0.04] text-white/60 hover:border-white/25 hover:text-white'
            }`}
            title={hqOnly ? 'Showing only Alta qualidade questions' : 'Showing all questions'}
          >
            <Award size={16} />
            Alta qualidade
            <span
              className={`grid h-5 items-center rounded-full px-2 font-mono text-[11px] ${
                hqOnly ? 'bg-mint/25 text-mint' : 'bg-white/10 text-white/55'
              }`}
            >
              {hqOnly ? `${hqCount}` : `${hqCount}/${fullCount}`}
            </span>
            <span
              className={`relative ml-0.5 h-4 w-7 rounded-full transition-colors ${
                hqOnly ? 'bg-mint/70' : 'bg-white/15'
              }`}
            >
              <span
                className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${
                  hqOnly ? 'left-3.5' : 'left-0.5'
                }`}
              />
            </span>
          </button>
        </div>
      </motion.div>

      {/* Daily goal + day streak */}
      <motion.button
        onClick={() => onStart('random')}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        whileHover={{ y: -3 }}
        whileTap={{ scale: 0.99 }}
        className="group glass relative mb-4 flex w-full items-center gap-5 overflow-hidden p-5 text-left transition-colors hover:border-white/25"
      >
        <Ring pct={daily.pct} count={daily.count} goal={daily.goal} met={daily.met} />
        <div className="min-w-0 flex-1">
          <div className="font-display text-lg font-semibold text-white">
            {daily.met ? 'Daily goal hit 🎉' : 'Daily goal'}
          </div>
          <div className="mt-0.5 font-body text-sm text-white/55">
            {daily.met
              ? `${daily.count} questions today — keep the streak alive.`
              : `${daily.count} / ${daily.goal} questions today. ${daily.goal - daily.count} to go.`}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span className="chip border-amber/40 text-amber">
            <Flame size={13} /> {dayStreak} day{dayStreak === 1 ? '' : 's'}
          </span>
          <span className="label">best {state.bestDayStreak || 0}</span>
        </div>
      </motion.button>

      {/* Exam history */}
      <motion.button
        onClick={() => onStart('examHistory')}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.04, type: 'spring', stiffness: 220, damping: 22 }}
        whileHover={{ y: -3 }}
        whileTap={{ scale: 0.99 }}
        className="group glass relative mb-10 flex w-full items-center gap-4 overflow-hidden p-4 text-left transition-colors hover:border-white/25"
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-amber/12 to-transparent opacity-70 transition-opacity group-hover:opacity-100" />
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/12 bg-white/[0.06] text-amber">
          <Trophy size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-display text-base font-semibold text-white">Exam History</div>
          <div className="font-body text-sm text-white/55">
            {exams.count
              ? `${exams.count} attempt${exams.count === 1 ? '' : 's'} · best ${exams.best}% · ${exams.passed} passed`
              : 'Track your mock-exam scores over time.'}
          </div>
        </div>
        <ArrowRight size={18} className="shrink-0 text-white/40 transition-transform group-hover:translate-x-1" />
      </motion.button>

      {/* Progress strip — tap any stat to open the full dashboard */}
      <div className="mb-2 flex items-center justify-between">
        <span className="label">Your progress</span>
        <button onClick={() => onStart('stats')} className="label flex items-center gap-1 text-cyan hover:text-white">
          View stats <ArrowRight size={12} />
        </button>
      </div>
      <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Seen" value={`${seen}/${total}`} icon={Eye} tint="text-cyan" onClick={() => onStart('stats')} />
        <Stat label="Correct" value={correct} icon={Target} tint="text-mint" onClick={() => onStart('stats')} />
        <Stat label="Best streak" value={state.bestStreak} icon={Flame} tint="text-amber" onClick={() => onStart('stats')} />
        <Stat label="Badges" value={state.badges.length} icon={Award} tint="text-pink" onClick={() => onStart('stats')} />
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

      {/* Featured: Aulas (lessons) */}
      <motion.button
        onClick={() => onStart('lessons')}
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.025, type: 'spring', stiffness: 220, damping: 22 }}
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.99 }}
        className="group glass relative mb-4 flex w-full items-center gap-4 overflow-hidden p-5 text-left transition-colors hover:border-white/25"
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-violet/15 via-pink/10 to-transparent opacity-70 transition-opacity group-hover:opacity-100" />
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-white/12 bg-white/[0.06] text-violet transition-shadow group-hover:[box-shadow:0_0_26px_-6px_currentColor]">
          <GraduationCap size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-display text-xl font-semibold text-white">Lessons</div>
          <div className="mt-0.5 font-body text-sm text-white/55">
            Exam topics with narrated audio (1×–3×) and a board for each lesson. Toggle PT/EN inside.
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

function Ring({ pct, count, goal, met }) {
  const r = 26
  const c = 2 * Math.PI * r
  const off = c * (1 - Math.min(pct, 100) / 100)
  return (
    <span className="relative grid h-16 w-16 shrink-0 place-items-center">
      <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
        <motion.circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke={met ? '#34d399' : '#22d3ee'}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: off }}
          transition={{ type: 'spring', stiffness: 90, damping: 20 }}
        />
      </svg>
      <span className="absolute font-mono text-sm font-bold text-white">
        {count}<span className="text-white/40">/{goal}</span>
      </span>
    </span>
  )
}

function Stat({ label, value, icon: Icon, tint, onClick }) {
  return (
    <button
      onClick={onClick}
      className="glass flex items-center gap-3 p-3.5 text-left transition-colors hover:border-white/25"
    >
      <span className={`grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/[0.05] ${tint}`}>
        <Icon size={18} />
      </span>
      <div>
        <div className="font-mono text-xl font-bold leading-none text-white">{value}</div>
        <div className="mt-1 label">{label}</div>
      </div>
    </button>
  )
}
