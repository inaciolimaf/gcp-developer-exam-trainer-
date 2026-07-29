import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { DOMAIN_LABELS } from '../lib/data'

// Generic category picker used for Topic / Domain / Module modes.
export default function Picker({ kind, items, onPick, onBack }) {
  const titles = {
    topic: 'Pick a topic',
    domain: 'Pick an exam domain',
    module: 'Pick a course module',
  }
  const accents = ['text-cyan', 'text-violet', 'text-pink', 'text-mint', 'text-amber', 'text-coral']

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-8">
      <button onClick={onBack} className="btn mb-6">
        <ArrowLeft size={16} /> Home
      </button>
      <h2 className="mb-7 font-display text-3xl font-bold text-ink">{titles[kind]}</h2>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it, i) => {
          const accent = accents[i % accents.length]
          return (
            <motion.button
              key={it.code}
              onClick={() => onPick(it.code)}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.min(i * 0.02, 0.4) }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              className="group glass flex items-center justify-between gap-3 p-4 text-left transition-colors hover:border-line-strong"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-line bg-sunken font-mono text-xs font-bold ${accent}`}
                >
                  {kind === 'module' ? `M${it.code}` : kind === 'domain' ? it.code : it.code.slice(0, 3)}
                </span>
                <div className="truncate font-display text-sm font-semibold text-ink">
                  {kind === 'domain' ? DOMAIN_LABELS[it.code] || it.name : it.name}
                </div>
              </div>
              <span className="chip shrink-0 font-mono">{it.count}</span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
