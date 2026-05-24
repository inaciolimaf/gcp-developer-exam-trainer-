import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Brain,
  CalendarClock,
  Layers,
  AlertTriangle,
  Target,
  CheckCircle2,
  TrendingDown,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { srsStats, isDue } from '../lib/srs'
import { shuffle } from '../lib/data'

export default function Review({ bank, flash, game, srs, onStartQuestions, onStartCards, onBack }) {
  const answered = game.answered || {}

  // due questions / cards from the SRS schedule
  const dueQuestions = useMemo(
    () => bank.questions.filter((q) => isDue(srs, q.id)),
    [bank.questions, srs],
  )
  const dueCards = useMemo(
    () => (flash ? flash.cards.filter((c) => isDue(srs, c.id)) : []),
    [flash, srs],
  )

  // questions never gotten right yet
  const mistakes = useMemo(
    () => bank.questions.filter((q) => answered[q.id] && !answered[q.id].correct),
    [bank.questions, answered],
  )

  // weakest topics: among questions you've seen, where the most are still unsolved
  const weakTopics = useMemo(() => {
    const map = new Map()
    for (const q of bank.questions) {
      const a = answered[q.id]
      if (!a) continue
      const t = map.get(q.topicCode) || { code: q.topicCode, name: q.topicName, seen: 0, solved: 0 }
      t.seen += 1
      if (a.correct) t.solved += 1
      map.set(q.topicCode, t)
    }
    return [...map.values()]
      .filter((t) => t.seen >= 2 && t.solved < t.seen)
      .map((t) => ({ ...t, ratio: t.solved / t.seen, gap: t.seen - t.solved }))
      .sort((a, b) => a.ratio - b.ratio || b.gap - a.gap)
      .slice(0, 8)
  }, [bank.questions, answered])

  const stats = srsStats(srs)
  const nothing = !dueQuestions.length && !dueCards.length && !mistakes.length && !weakTopics.length

  const drillTopic = (code) => {
    const qs = bank.questions.filter((q) => q.topicCode === code)
    onStartQuestions(`Topic · ${qs[0]?.topicName || code}`, shuffle(qs))
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-6">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={onBack} className="btn">
          <ArrowLeft size={16} /> Home
        </button>
        <div className="flex items-center gap-2 font-display text-xl font-bold text-white">
          <Brain size={20} className="text-cyan" /> Smart Review
        </div>
      </div>

      {/* summary */}
      <div className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Due now" value={stats.due} icon={CalendarClock} tint="text-cyan" />
        <Stat label="Mistakes" value={mistakes.length} icon={AlertTriangle} tint="text-coral" />
        <Stat label="Scheduled" value={stats.scheduled} icon={Target} tint="text-violet" />
        <Stat label="Mastered" value={stats.mastered} icon={CheckCircle2} tint="text-mint" />
      </div>

      {nothing ? (
        <div className="glass-strong flex flex-col items-center gap-3 p-10 text-center shadow-glow-soft">
          <Sparkles size={40} className="text-mint" />
          <h2 className="font-display text-2xl font-bold text-white">All caught up</h2>
          <p className="max-w-sm font-body text-white/55">
            Nothing due for review yet. Answer questions or grade flashcards and they'll show up here on a
            spaced schedule — sooner if you miss them, later as you nail them.
          </p>
        </div>
      ) : (
        <>
          {/* primary actions */}
          <div className="mb-3 label">Review now</div>
          <div className="grid gap-4 sm:grid-cols-3">
            <ActionTile
              title="Questions due"
              count={dueQuestions.length}
              desc="Resurfaced on your spaced schedule."
              icon={CalendarClock}
              accent="cyan"
              onClick={() => onStartQuestions('Review · due questions', shuffle(dueQuestions))}
            />
            <ActionTile
              title="Cards due"
              count={dueCards.length}
              desc="Flashcards it's time to see again."
              icon={Layers}
              accent="mint"
              onClick={() => onStartCards('Review · due cards', shuffle(dueCards))}
            />
            <ActionTile
              title="My mistakes"
              count={mistakes.length}
              desc="Questions you haven't cracked yet."
              icon={AlertTriangle}
              accent="coral"
              onClick={() => onStartQuestions('Review · my mistakes', shuffle(mistakes))}
            />
          </div>

          {/* weak topics */}
          {weakTopics.length > 0 && (
            <>
              <div className="mb-3 mt-9 flex items-center gap-2 label">
                <TrendingDown size={14} /> Weakest topics
              </div>
              <div className="glass divide-y divide-white/[0.06] overflow-hidden">
                {weakTopics.map((t, i) => {
                  const pct = Math.round(t.ratio * 100)
                  return (
                    <motion.button
                      key={t.code}
                      onClick={() => drillTopic(t.code)}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(i * 0.03, 0.3) }}
                      className="group flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-white/[0.05]"
                    >
                      <span className="min-w-0 flex-1 truncate font-display text-sm font-semibold text-white/90">
                        {t.name}
                      </span>
                      <div className="hidden h-1.5 w-28 overflow-hidden rounded-full border border-white/10 bg-white/[0.04] sm:block">
                        <div
                          className={`h-full rounded-full ${pct < 40 ? 'bg-coral' : pct < 70 ? 'bg-amber' : 'bg-mint'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="chip shrink-0 font-mono">
                        {t.solved}/{t.seen}
                      </span>
                      <ArrowRight
                        size={16}
                        className="shrink-0 text-white/30 transition-transform group-hover:translate-x-1 group-hover:text-white/60"
                      />
                    </motion.button>
                  )
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

function ActionTile({ title, count, desc, icon: Icon, accent, onClick }) {
  const disabled = count === 0
  const tint = { cyan: 'text-cyan', mint: 'text-mint', coral: 'text-coral' }[accent]
  const wash = { cyan: 'from-cyan/20', mint: 'from-mint/20', coral: 'from-coral/20' }[accent]
  return (
    <motion.button
      onClick={disabled ? undefined : onClick}
      whileHover={disabled ? {} : { y: -4 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      className={`group glass relative flex flex-col items-start gap-3 overflow-hidden p-5 text-left transition-colors ${
        disabled ? 'cursor-not-allowed opacity-45' : 'hover:border-white/25'
      }`}
    >
      <div
        className={`absolute inset-0 -z-10 bg-gradient-to-br ${wash} to-transparent opacity-0 transition-opacity group-hover:opacity-100`}
      />
      <div className="flex w-full items-center justify-between">
        <span className={`grid h-11 w-11 place-items-center rounded-xl border border-white/12 bg-white/[0.06] ${tint}`}>
          <Icon size={20} />
        </span>
        <span className={`font-mono text-3xl font-bold ${count ? tint : 'text-white/40'}`}>{count}</span>
      </div>
      <div>
        <div className="font-display text-lg font-semibold text-white">{title}</div>
        <div className="mt-0.5 font-body text-sm text-white/50">{disabled ? 'Nothing here right now.' : desc}</div>
      </div>
    </motion.button>
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
