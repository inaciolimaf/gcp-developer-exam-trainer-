import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Lightbulb, BookOpen, CheckSquare } from 'lucide-react'
import AudioPlayer from './AudioPlayer'

export default function QuestionCard({ q, index, total, selected, revealed, onSelect }) {
  const sel = Array.isArray(selected) ? selected : selected ? [selected] : []
  const correct = q.correctSet && q.correctSet.length ? q.correctSet : [q.answer]
  const isMulti = !!q.multi
  const needed = correct.length

  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('q_lang') || 'en'
    } catch {
      return 'en'
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem('q_lang', lang)
    } catch {
      /* ignore */
    }
  }, [lang])
  const explText = lang === 'pt' ? q.explanationPt || q.explanation : q.explanation
  const hasAudio = lang === 'pt' ? q.audioPt : q.audioEn
  const audioSrc = `${import.meta.env.BASE_URL}q-audio/${q.audioId}${lang === 'pt' ? '.pt' : ''}.mp3`

  return (
    <motion.div
      key={q.id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
      className="glass-strong p-5 sm:p-7"
    >
      {/* meta: position and domain lead, everything else stays quiet */}
      <div className="mb-4 flex flex-wrap items-center gap-x-2.5 gap-y-2">
        <span className="font-mono text-xs font-extrabold text-faint">
          {typeof index === 'number' ? `${String(index + 1).padStart(2, '0')}/${total}` : `#${q.number}`}
        </span>
        <span className="font-display text-xs font-extrabold uppercase tracking-wide text-brand">{q.domain}</span>
        <span className="text-faint">·</span>
        <span className="font-display text-xs font-bold text-muted">{q.topicName}</span>
        {q.highQuality && <span className="chip border-mint/30 bg-mint/10 text-mint">Alta qualidade</span>}
        {q.coverage === 'pouco ensinado (gap)' && (
          <span className="chip border-amber/30 bg-amber/10 text-amber">pouco coberto</span>
        )}
      </div>

      <h2 className="font-body text-[19px] font-semibold leading-relaxed text-ink sm:text-[22px]">{q.question}</h2>

      {isMulti && (
        <div className="mt-4 flex items-center gap-2.5 rounded-xl border-2 border-amber/30 bg-amber/10 px-3.5 py-2.5">
          <CheckSquare size={18} className="shrink-0 text-amber" />
          <p className="font-display text-sm font-bold text-amber">
            Marque {needed} alternativas
            {!revealed && (
              <span className="ml-1.5 font-mono font-extrabold">
                ({sel.length}/{needed})
              </span>
            )}
          </p>
        </div>
      )}

      <div className="mt-5 grid gap-3">
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

          const box = {
            idle: 'opt-idle',
            selected: 'opt-selected',
            correct: 'opt-correct',
            wrong: 'opt-wrong',
            dim: 'opt-dim',
          }[state]

          const key = {
            idle: 'border-line bg-sunken text-muted',
            selected: 'border-brand-deep bg-brand text-white',
            correct: 'border-[#0C6537] bg-[#16A05A] text-white',
            wrong: 'border-[#99202A] bg-[#D93843] text-white',
            dim: 'border-line bg-sunken text-faint',
          }[state]

          return (
            <motion.button
              key={opt.letter}
              disabled={revealed}
              onClick={(e) => onSelect?.(opt.letter, e)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.03 * i, duration: 0.18 }}
              className={`opt ${box}`}
            >
              <span className={`opt-key ${key}`}>
                {state === 'correct' ? (
                  <Check size={18} strokeWidth={3.5} />
                ) : state === 'wrong' ? (
                  <X size={18} strokeWidth={3.5} />
                ) : (
                  opt.letter
                )}
              </span>
              <span className="font-body text-[15px] font-medium leading-snug text-ink sm:text-base">{opt.text}</span>
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
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="mt-5 rounded-2xl border-2 border-line bg-sunken p-4 sm:p-5">
              <div className="mb-2.5 flex flex-wrap items-center gap-2 font-display text-sm font-extrabold text-ink">
                <Lightbulb size={17} className="text-amber" />
                Por que{' '}
                <span className="rounded-md bg-[#16A05A] px-2 py-0.5 font-mono text-white">{correct.join(' + ')}</span>
                {correct.length > 1 ? 'estão certas' : 'está certa'}
                {(q.explanationPt || q.audioPt) && (
                  <span className="ml-auto">
                    <ExplLangToggle lang={lang} setLang={setLang} />
                  </span>
                )}
              </div>
              {hasAudio && (
                <div className="mb-3">
                  <AudioPlayer key={audioSrc} src={audioSrc} />
                </div>
              )}
              <p className="whitespace-pre-line font-body text-[15px] leading-relaxed text-muted">
                {explText || <span className="italic text-faint">Explicação detalhada em breve.</span>}
              </p>

              {q.modules.length > 0 && (
                <div className="mt-4 border-t-2 border-dashed border-line pt-3">
                  <div className="mb-2 flex items-center gap-2 label">
                    <BookOpen size={14} /> Estude no curso
                  </div>
                  <ul className="flex flex-wrap gap-2">
                    {q.modules.map((m) => (
                      <li key={m.id} className="chip border-brand/25 bg-brand/[0.07] text-brand-deep">
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

function ExplLangToggle({ lang, setLang }) {
  return (
    <span className="flex items-center rounded-lg border-2 border-line bg-surface p-0.5 font-mono text-[10px] font-extrabold">
      {['en', 'pt'].map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          className={`rounded px-2 py-0.5 transition-colors ${
            lang === l ? 'bg-brand text-white' : 'text-faint hover:text-ink'
          }`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </span>
  )
}
