import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { marked } from 'marked'
import { ArrowLeft, BookOpenText, List, RotateCcw, CheckCheck } from 'lucide-react'
import { loadGuideDone, saveGuideDone } from '../lib/storage'

marked.setOptions({ gfm: true, breaks: false })

export default function Guide({ onExit }) {
  const [html, setHtml] = useState('')
  const [toc, setToc] = useState([])
  const [active, setActive] = useState(null)
  const [tocOpen, setTocOpen] = useState(false)
  const [progress, setProgress] = useState({ done: 0, total: 0 })

  const ref = useRef(null)
  const doneRef = useRef(loadGuideDone())
  const statsRef = useRef({ total: 0, modules: [] })

  // load + parse markdown
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}study_guide.md`)
      .then((r) => r.text())
      .then((md) => setHtml(marked.parse(md.replace(/^#\s.*\n/, ''))))
      .catch(() => setHtml('<p>Could not load the study guide.</p>'))
  }, [])

  // recompute progress bar + per-module badges from the done set
  function refreshUI() {
    const { modules } = statsRef.current
    let done = 0
    let total = 0
    for (const m of modules) {
      const d = m.ids.filter((id) => doneRef.current.has(id)).length
      m.badge.textContent = ` ${d}/${m.ids.length} `
      m.badge.classList.toggle('complete', d === m.ids.length && m.ids.length > 0)
      done += d
      total += m.ids.length
    }
    setProgress({ done, total })
  }

  function toggle(id, tr, btn) {
    const s = doneRef.current
    s.has(id) ? s.delete(id) : s.add(id)
    saveGuideDone(s)
    const on = s.has(id)
    tr.classList.toggle('gd-done', on)
    btn.classList.toggle('on', on)
    refreshUI()
  }

  function resetAll() {
    if (!confirm('Reset all study-guide progress?')) return
    doneRef.current = new Set()
    saveGuideDone(doneRef.current)
    ref.current?.querySelectorAll('.gd-check.on').forEach((b) => b.classList.remove('on'))
    ref.current?.querySelectorAll('tr.gd-done').forEach((r) => r.classList.remove('gd-done'))
    refreshUI()
  }

  // after render: tag headings (TOC + scroll-spy) and inject checkboxes
  useEffect(() => {
    if (!html || !ref.current) return
    const root = ref.current

    // --- TOC from H2 ---
    const heads = root.querySelectorAll('h2')
    const entries = []
    heads.forEach((h, i) => {
      const id = `sec-${i}`
      h.id = id
      h.style.scrollMarginTop = '88px'
      entries.push({ id, text: h.textContent })
    })
    setToc(entries)

    const obs = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-30% 0px -65% 0px' },
    )
    heads.forEach((h) => obs.observe(h))

    // --- checkboxes on the "Lecture" (§5) and "Module" (§3) tables ---
    const modules = []
    root.querySelectorAll('table').forEach((table) => {
      const ths = [...table.querySelectorAll('thead th')].map((t) => t.textContent.trim().toLowerCase())
      if (!ths.includes('lecture') && !ths.includes('module')) return

      // group label = clean text of the heading just above (stored once)
      let group = table.dataset.gdGroup
      let heading = null
      let el = table.previousElementSibling
      while (el && el.tagName !== 'H3' && el.tagName !== 'H2') el = el.previousElementSibling
      heading = el
      if (!group) {
        group = heading ? heading.textContent.trim() : 'guide'
        table.dataset.gdGroup = group
      }

      // header corner cell
      if (!table.querySelector('.gd-check-col')) {
        const headRow = table.querySelector('thead tr')
        if (headRow) {
          const th = document.createElement('th')
          th.className = 'gd-check-col'
          headRow.insertBefore(th, headRow.firstChild)
        }
      }

      const ids = []
      table.querySelectorAll('tbody tr').forEach((tr) => {
        const firstTd = tr.querySelector('td')
        const label = firstTd ? firstTd.textContent.trim() : ''
        const id = `${group}|${label}`.toLowerCase()
        ids.push(id)

        let btn = tr.querySelector('.gd-check')
        if (!btn) {
          const td = document.createElement('td')
          td.className = 'gd-check-col'
          btn = document.createElement('button')
          btn.type = 'button'
          btn.className = 'gd-check'
          btn.setAttribute('aria-label', 'Mark as done')
          td.appendChild(btn)
          tr.insertBefore(td, tr.firstChild)
          btn.addEventListener('click', () => toggle(id, tr, btn))
        }
        btn.dataset.id = id
        const on = doneRef.current.has(id)
        tr.classList.toggle('gd-done', on)
        btn.classList.toggle('on', on)
      })

      // per-module badge
      if (heading) {
        let badge = heading.querySelector('.gd-modbadge')
        if (!badge) {
          badge = document.createElement('span')
          badge.className = 'gd-modbadge'
          heading.appendChild(badge)
        }
        modules.push({ badge, ids })
      }
    })

    statsRef.current = { modules }
    refreshUI()

    return () => obs.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [html])

  function go(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setTocOpen(false)
  }

  const pct = progress.total ? Math.round((progress.done / progress.total) * 100) : 0

  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-6">
      <div className="mb-5 flex items-center gap-3">
        <button onClick={onExit} className="btn">
          <ArrowLeft size={16} /> Home
        </button>
        <div className="flex items-center gap-2 font-display text-xl font-bold text-white">
          <BookOpenText size={20} className="text-cyan" /> Study Guide
        </div>
        <button onClick={() => setTocOpen((v) => !v)} className="btn ml-auto lg:hidden">
          <List size={16} /> Sections
        </button>
      </div>

      {/* overall progress */}
      <div className="glass mb-6 flex items-center gap-4 p-4">
        <CheckCheck size={20} className="shrink-0 text-mint" />
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <span className="label">Completion</span>
            <span className="font-mono text-sm font-bold text-white">
              {progress.done}/{progress.total} <span className="text-white/40">· {pct}%</span>
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full border border-white/10 bg-white/[0.05]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-cyan to-mint"
              animate={{ width: `${pct}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            />
          </div>
        </div>
        <button onClick={resetAll} className="btn shrink-0 px-3 text-white/60" title="Reset progress">
          <RotateCcw size={15} />
        </button>
      </div>

      <div className="lg:grid lg:grid-cols-[230px_1fr] lg:gap-8">
        {/* TOC */}
        <aside className={`${tocOpen ? 'block' : 'hidden'} mb-6 lg:mb-0 lg:block`}>
          <nav className="glass sticky top-20 max-h-[calc(100vh-7rem)] overflow-auto p-3">
            <div className="label mb-2 px-2">Contents</div>
            <ul className="space-y-0.5">
              {toc.map((t) => (
                <li key={t.id}>
                  <button
                    onClick={() => go(t.id)}
                    className={`block w-full truncate rounded-lg px-2 py-1.5 text-left font-display text-[13px] transition-colors ${
                      active === t.id
                        ? 'bg-white/[0.08] text-cyan'
                        : 'text-white/55 hover:bg-white/[0.05] hover:text-white/90'
                    }`}
                  >
                    {t.text}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* content */}
        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          ref={ref}
          className="md-content glass-strong min-w-0 p-5 shadow-glow-soft sm:p-8"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  )
}
