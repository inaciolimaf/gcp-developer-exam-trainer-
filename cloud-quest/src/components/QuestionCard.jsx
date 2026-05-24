import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Lightbulb, BookOpen, Layers } from 'lucide-react'

export default function QuestionCard({ q, index, total, selected, revealed, onSelect }) {
  const sel = Array.isArray(selected) ? selected : selected ? [selected] : []
  const correct = q.correctSet && q.correctSet.length ? q.correctSet : [q.answer]
  return (
    <motion.div
      key={q.id}
      initial={{ opacity: 0, y: 24, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -24, scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      className="glass-strong p-5 shadow-glow-soft sm:p-7"
    >
      {/* meta row */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="chip bg-white/10 font-mono">
          {typeof index === 'number' ? `${String(index + 1).padStart(2, '0')} / ${total}` : `#${q.number}`}
        </span>
        <span className="chip border-cyan/30 text-cyan">
          <Layers size={13} /> {q.domain}
        </span>
        <span className="chip">{q.topicName}</span>
        {q.multi && (
          <span className="chip border-violet/40 text-violet">choose {correct.length}</span>
        )}
        {q.coverage === 'pouco ensinado (gap)' && (
          <span className="chip border-coral/40 text-coral">low coverage</span>
        )}
      </div>

      <h2 className="font-body text-lg leading-relaxed text-white/95 sm:text-xl">{q.question}</h2>

      <div className="mt-5 grid gap-2.5">
        {q.options.map((opt, i) => {
          const isSelected = sel.includes(opt.letter)
          const isCorrect = correct.includes(opt.letter)
          const state = !revealed
            ? isSelected
              ? 'selected'
              : 'idle'
            : isCorrect
              ? 'correct'
              : isSelected
                ? 'wrong'
                : 'dim'

          const styles = {
            idle: 'border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.07]',
            selected: 'border-cyan/60 bg-cyan/10 shadow-glow-cyan',
            correct: 'border-mint/70 bg-mint/12 shadow-glow-mint',
            wrong: 'border-coral/70 bg-coral/12 shadow-glow-coral',
            dim: 'border-white/8 bg-white/[0.02] opacity-45',
          }[state]

          const badge = {
            idle: 'border-white/15 bg-white/5 text-white/70',
            selected: 'border-cyan/50 bg-cyan/20 text-cyan',
            correct: 'border-mint/50 bg-mint/20 text-mint',
            wrong: 'border-coral/50 bg-coral/20 text-coral',
            dim: 'border-white/10 bg-white/5 text-white/40',
          }[state]

          return (
            <motion.button
              key={opt.letter}
              disabled={revealed}
              onClick={(e) => onSelect(opt.letter, e)}
              whileHover={!revealed ? { x: 3 } : {}}
              whileTap={!revealed ? { scale: 0.995 } : {}}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.04 * i }}
              className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all duration-150 ${styles}`}
            >
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border font-mono text-sm font-bold ${badge}`}
              >
                {state === 'correct' ? <Check size={16} /> : state === 'wrong' ? <X size={16} /> : opt.letter}
              </span>
              <span className="pt-0.5 font-body text-[15px] leading-snug text-white/85">{opt.text}</span>
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 26 }}
            className="overflow-hidden"
          >
            <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-2 flex items-center gap-2 font-display text-sm font-semibold text-white/90">
                <Lightbulb size={16} className="text-amber" /> Why{' '}
                <span className="rounded-md border border-mint/40 bg-mint/15 px-1.5 py-0.5 font-mono text-mint">
                  {correct.join(' + ')}
                </span>
                {correct.length > 1 ? 'are correct' : 'is correct'}
              </div>
              <p className="whitespace-pre-line font-body text-[15px] leading-relaxed text-white/70">
                {q.explanation}
              </p>

              {q.modules.length > 0 && (
                <div className="mt-4 border-t border-dashed border-white/10 pt-3">
                  <div className="mb-2 flex items-center gap-2 label text-white/50">
                    <BookOpen size={14} /> Study in the course
                  </div>
                  <ul className="flex flex-wrap gap-2">
                    {q.modules.map((m) => (
                      <li key={m.id} className="chip border-violet/25 text-violet/90">
                        M{m.id} · {m.title}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
