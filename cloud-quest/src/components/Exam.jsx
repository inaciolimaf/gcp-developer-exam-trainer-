import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Clock, Flag, Trophy, BarChart3, Layers, Check, Eye, EyeOff, Pause, Play, Coffee, Globe, Sparkles, RotateCcw } from 'lucide-react'
import { sample, shuffle, DOMAIN_LABELS, isAnswerCorrect, hasAnswer } from '../lib/data'
import QuestionCard from './QuestionCard'
import { bigCelebration } from '../lib/confetti'

const PASS_PCT = 70

export default function Exam({ pool, unseen, missed, onAnswerBatch, onExit, onHistory }) {
  const [phase, setPhase] = useState('setup') // setup | run | result
  // 'all' (banco inteiro) | 'new' (só não respondidas) | 'missed' (só as que errei)
  const [source, setSource] = useState('all')
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [index, setIndex] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [paused, setPaused] = useState(false)
  const [pausedMs, setPausedMs] = useState(0) // tempo total parado, para o relatório
  const [reviewAll, setReviewAll] = useState(false)
  const [feedback, setFeedback] = useState('submit') // 'submit' (classic) | 'instant'
  const [revealed, setRevealed] = useState(() => new Set()) // ids locked+shown (instant mode)
  const [autoResumedId, setAutoResumedId] = useState(null) // questão em que você mandou o relógio voltar
  const timerRef = useRef(null)
  // how long each question stayed on screen, so Stats can chart exam pace
  const dwell = useRef({ times: {}, id: null, since: 0 })
  const startedAt = useRef(0)
  const pausedAt = useRef(0) // início da pausa atual
  // O intervalo do cronômetro só é recriado quando `phase`/`frozen` mudam, então
  // a closure dele congela `answers` no momento em que foi montado. Quando o
  // tempo estoura, `finish()` roda de dentro dessa closure — sem este ref ele
  // pontuaria por um retrato velho e perderia as últimas respostas.
  const answersRef = useRef(answers)
  useEffect(() => {
    answersRef.current = answers
  }, [answers])

  const newPool = unseen || []
  // já chega ordenado por urgência (as que você errou por último primeiro)
  const missedPool = missed || []
  const activePool = source === 'new' ? newPool : source === 'missed' ? missedPool : pool

  const curId = questions[index]?.id ?? null
  // Feedback imediato: assim que a resposta aparece, o relógio para sozinho —
  // ler a explicação não é tempo de prova. Você pode mandar voltar a andar sem
  // sair da questão; ao trocar de questão o `curId` muda e o automático volta.
  const explaining = phase === 'run' && feedback === 'instant' && curId !== null && revealed.has(curId)
  const autoPaused = explaining && autoResumedId !== curId
  const frozen = paused || autoPaused

  function begin(n) {
    // Nas "que errei" o pool vem ordenado por urgência, então a prova pega as n
    // mais urgentes (e só depois embaralha) em vez de sortear do monte inteiro.
    setQuestions(source === 'missed' ? shuffle(activePool.slice(0, n)) : sample(activePool, n))
    setAnswers({})
    setRevealed(new Set())
    setAutoResumedId(null)
    setIndex(0)
    setSecondsLeft(n * 90) // 90s per question
    setPaused(false)
    setPausedMs(0)
    dwell.current = { times: {}, id: null, since: 0 }
    pausedAt.current = 0
    startedAt.current = Date.now()
    setPhase('run')
  }

  // Pausar manualmente também esconde a prova, senão a pausa viraria tempo
  // extra de leitura. A contabilidade fica toda no efeito abaixo.
  function togglePause() {
    setPaused((p) => !p)
  }

  // charge the elapsed time to the question we're leaving, then start the clock
  // on the one we're landing on
  function markDwell(nextId) {
    const d = dwell.current
    const now = Date.now()
    if (d.id) d.times[d.id] = (d.times[d.id] || 0) + (now - d.since)
    d.id = nextId
    d.since = now
  }

  // Ponto único de congelamento: qualquer motivo (pausa manual ou explicação
  // aberta) para o cronômetro E a medição por questão, e o tempo parado vira
  // `pausedMs`. Mantido como efeito de propósito — em StrictMode o setup roda
  // duas vezes, mas aqui isso só soma um chunk de ~0ms.
  useEffect(() => {
    if (phase !== 'run' || !frozen) return
    pausedAt.current = Date.now()
    markDwell(null)
    return () => {
      const chunk = pausedAt.current ? Date.now() - pausedAt.current : 0
      pausedAt.current = 0
      if (chunk > 0) setPausedMs((ms) => ms + chunk)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, frozen])

  useEffect(() => {
    if (phase !== 'run' || frozen) return
    markDwell(curId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, curId, frozen])

  useEffect(() => {
    if (phase !== 'run' || frozen) return
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
  }, [phase, frozen])

  // Dá para enviar o simulado pela metade: a nota sai só sobre o que você
  // respondeu, e o que ficou em branco não conta como erro em lugar nenhum.
  const answeredQuestions = useMemo(
    () => questions.filter((q) => hasAnswer(answers[q.id])),
    [questions, answers],
  )

  const score = useMemo(() => {
    if (phase !== 'result') return null
    const done = answeredQuestions.length
    const correct = answeredQuestions.filter((q) => isAnswerCorrect(q, answers[q.id])).length
    return {
      correct,
      total: done,
      skipped: questions.length - done,
      sat: questions.length,
      pct: done ? Math.round((correct / done) * 100) : 0,
    }
  }, [phase, questions, answers, answeredQuestions])

  function finish() {
    clearInterval(timerRef.current)
    markDwell(null)
    // pausas não contam como tempo de prova (nem no total, nem por questão) —
    // vale tanto para a pausa manual quanto para a leitura da explicação
    const breaks = pausedMs + (pausedAt.current ? Date.now() - pausedAt.current : 0)
    pausedAt.current = 0 // já contabilizado aqui; o cleanup do efeito não soma de novo
    setPaused(false)
    // sempre pelo ref: no estouro de tempo `answers` da closure está velho
    const given = answersRef.current
    const done = questions.filter((q) => hasAnswer(given[q.id]))
    const correct = done.filter((q) => isAnswerCorrect(q, given[q.id])).length
    const pct = done.length ? Math.round((correct / done.length) * 100) : 0
    // Zero respondidas não é um simulado: mostra o resultado vazio, mas não
    // grava nada no histórico nem mexe no XP.
    if (done.length) {
      onAnswerBatch(done, given, pct >= PASS_PCT, pct === 100, {
        times: dwell.current.times,
        ms: startedAt.current ? Math.max(0, Date.now() - startedAt.current - breaks) : 0,
        pausedMs: breaks,
        feedback,
        skipped: questions.length - done.length,
      })
      if (pct >= PASS_PCT) setTimeout(bigCelebration, 250)
    }
    setPhase('result')
  }

  // Enviar com questões em branco é permitido, mas nunca por acidente.
  function confirmFinish() {
    const blank = questions.length - answeredQuestions.length
    if (!blank) return finish()
    const msg = answeredQuestions.length
      ? `Faltam ${blank} de ${questions.length} questões em branco.\n\n` +
        `Sua nota vai sair só sobre as ${answeredQuestions.length} que você respondeu — ` +
        `as em branco não contam como erro.\n\nEnviar assim?`
      : `Você ainda não respondeu nenhuma questão.\n\nEnviar assim? Nada será registrado.`
    if (confirm(msg)) finish()
  }

  // ---------- SETUP ----------
  if (phase === 'setup') {
    const size = activePool.length
    const opts = [20, 40, 50, Math.min(60, size)].filter((n, i, a) => n > 0 && n <= size && a.indexOf(n) === i)
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
            Pick a length. You get <span className="text-white/90">90 seconds</span> per question. Pass mark is{' '}
            <span className="text-white/90">{PASS_PCT}%</span>. Dá para <span className="text-white/90">pausar</span>{' '}
            o cronômetro a qualquer momento, e também{' '}
            <span className="text-white/90">enviar pela metade</span> — a nota sai só sobre o que você respondeu.
          </p>

          {/* de onde saem as questões: banco inteiro, só as inéditas ou só as que você errou */}
          <div className="mt-6 text-left">
            <div className="mb-2 label text-center">Questões</div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setSource('all')}
                className={`flex flex-col items-center gap-1 rounded-xl border p-3 transition-colors ${
                  source === 'all'
                    ? 'border-violet/50 bg-violet/10 text-violet shadow-glow-violet'
                    : 'border-white/12 bg-white/[0.04] text-white/55 hover:border-white/25 hover:text-white'
                }`}
              >
                <Globe size={18} />
                <span className="font-display text-[13px] font-semibold leading-tight">Banco inteiro</span>
                <span className="font-mono text-[11px] leading-tight opacity-80">{pool.length} disponíveis</span>
              </button>
              <button
                onClick={() => setSource('new')}
                disabled={newPool.length === 0}
                className={`flex flex-col items-center gap-1 rounded-xl border p-3 transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                  source === 'new'
                    ? 'border-mint/50 bg-mint/10 text-mint shadow-glow-mint'
                    : 'border-white/12 bg-white/[0.04] text-white/55 hover:border-white/25 hover:text-white'
                }`}
              >
                <Sparkles size={18} />
                <span className="font-display text-[13px] font-semibold leading-tight">Só as novas</span>
                <span className="font-mono text-[11px] leading-tight opacity-80">
                  {newPool.length} sem resposta
                </span>
              </button>
              <button
                onClick={() => setSource('missed')}
                disabled={missedPool.length === 0}
                className={`flex flex-col items-center gap-1 rounded-xl border p-3 transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                  source === 'missed'
                    ? 'border-coral/50 bg-coral/10 text-coral shadow-glow-coral'
                    : 'border-white/12 bg-white/[0.04] text-white/55 hover:border-white/25 hover:text-white'
                }`}
              >
                <RotateCcw size={18} />
                <span className="font-display text-[13px] font-semibold leading-tight">Só as que errei</span>
                <span className="font-mono text-[11px] leading-tight opacity-80">
                  {missedPool.length} {missedPool.length === 1 ? 'errada' : 'erradas'}
                </span>
              </button>
            </div>
          </div>

          {/* feedback mode: classic (no peeking) vs instant (reveal as you go) */}
          <div className="mt-5 text-left">
            <div className="mb-2 label text-center">Modo de resposta</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setFeedback('submit')}
                className={`flex flex-col items-center gap-1 rounded-xl border p-3 transition-colors ${
                  feedback === 'submit'
                    ? 'border-coral/50 bg-coral/10 text-coral shadow-glow-coral'
                    : 'border-white/12 bg-white/[0.04] text-white/55 hover:border-white/25 hover:text-white'
                }`}
              >
                <EyeOff size={18} />
                <span className="font-display text-sm font-semibold">Clássico</span>
                <span className="font-body text-[11px] leading-tight opacity-80">Sem resposta até enviar</span>
              </button>
              <button
                onClick={() => setFeedback('instant')}
                className={`flex flex-col items-center gap-1 rounded-xl border p-3 transition-colors ${
                  feedback === 'instant'
                    ? 'border-cyan/50 bg-cyan/10 text-cyan shadow-glow-cyan'
                    : 'border-white/12 bg-white/[0.04] text-white/55 hover:border-white/25 hover:text-white'
                }`}
              >
                <Eye size={18} />
                <span className="font-display text-sm font-semibold">Feedback imediato</span>
                <span className="font-body text-[11px] leading-tight opacity-80">
                  Resposta na hora e o tempo pausa sozinho
                </span>
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            {opts.map((n) => (
              <button key={n} onClick={() => begin(n)} className="btn-accent py-4">
                {n} questions
              </button>
            ))}
          </div>
          {opts.length === 0 && (
            <p className="mt-6 font-body text-sm text-mint">
              {source === 'missed'
                ? 'Você ainda não errou nenhuma questão — nada para refazer aqui. Escolha “Banco inteiro”.'
                : 'Você já respondeu o banco inteiro — não sobrou questão nova. Escolha “Banco inteiro”.'}
            </p>
          )}
          <p className="mt-4 font-mono text-xs text-white/35">
            {size} questions available
            {source === 'new'
              ? ' · só as que você ainda não respondeu'
              : source === 'missed'
                ? ' · só as que você já errou, das piores primeiro'
                : ''}
          </p>
        </motion.div>
      </div>
    )
  }

  // ---------- RESULT ----------
  if (phase === 'result') {
    const passed = score.total > 0 && score.pct >= PASS_PCT
    // "errou" é só o que você respondeu e errou — em branco é em branco
    const wrong = answeredQuestions.filter((q) => !isAnswerCorrect(q, answers[q.id]))
    const blank = questions.filter((q) => !hasAnswer(answers[q.id]))

    // per-domain breakdown, também só sobre o respondido
    const domains = {}
    for (const q of answeredQuestions) {
      const d = (domains[q.domain] ??= { code: q.domain, name: q.domainName, correct: 0, total: 0 })
      d.total += 1
      if (isAnswerCorrect(q, answers[q.id])) d.correct += 1
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
            {score.total === 0 ? 'Nada respondido' : passed ? 'You passed!' : 'Not yet — keep going'}
          </h2>
          <div
            className={`my-4 font-mono text-7xl font-bold tracking-tight ${
              score.total === 0
                ? 'text-white/30'
                : passed
                  ? 'text-mint [text-shadow:0_0_36px_rgba(52,211,153,0.45)]'
                  : 'text-coral'
            }`}
          >
            {score.total === 0 ? '—' : `${score.pct}%`}
          </div>
          {score.total === 0 ? (
            <p className="font-body text-white/65">
              Você enviou sem responder nada, então não há nota — e nada foi gravado no histórico.
            </p>
          ) : (
            <>
              <p className="font-body text-white/65">
                {score.correct} / {score.total} correct · pass mark {PASS_PCT}%
              </p>
              {score.skipped > 0 && (
                <p className="mt-2 font-body text-sm text-amber">
                  Nota calculada só sobre as {score.total} que você respondeu ·{' '}
                  <span className="font-mono">{score.skipped}</span> em branco não contaram
                </p>
              )}
            </>
          )}
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
        <div className={`glass mt-6 p-5 ${domainRows.length ? '' : 'hidden'}`}>
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
              {blank.length > 0 && !reviewAll && (
                <span className="ml-2 font-body text-base font-normal text-amber">
                  + {blank.length} em branco
                </span>
              )}
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
              {score.total === 0
                ? 'Nada para revisar — nenhuma questão foi respondida.'
                : blank.length > 0
                  ? `Você acertou todas as ${score.total} que respondeu. Troque para “All” para ver as ${blank.length} que ficaram em branco.`
                  : 'Perfect run — nothing missed. 🎉'}
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
  const answeredCount = Object.values(answers).filter(hasAnswer).length

  const isRevealed = feedback === 'instant' && revealed.has(q.id)

  function pick(letter) {
    if (isRevealed) return // locked once shown in instant mode
    setAnswers((a) => {
      if (q.multi) {
        const cur = Array.isArray(a[q.id]) ? a[q.id] : []
        return { ...a, [q.id]: cur.includes(letter) ? cur.filter((l) => l !== letter) : [...cur, letter] }
      }
      return { ...a, [q.id]: letter }
    })
    // single-select instant mode reveals the moment you tap an option
    if (feedback === 'instant' && !q.multi) {
      setRevealed((r) => new Set(r).add(q.id))
    }
  }

  // multi-select instant mode: reveal only after the right number is chosen
  const selCount = Array.isArray(answers[q.id]) ? answers[q.id].length : 0
  const canCheckMulti = feedback === 'instant' && q.multi && !isRevealed && selCount === (q.correctSet?.length || 0)
  function checkMulti() {
    setRevealed((r) => new Set(r).add(q.id))
  }
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const ss = String(secondsLeft % 60).padStart(2, '0')
  const low = secondsLeft <= 60

  return (
    <div className="mx-auto max-w-3xl px-4 pb-28 pt-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <button onClick={onExit} className="btn px-3">
          <ArrowLeft size={16} />
        </button>
        <div className="flex items-center gap-2">
          <div
            className={`chip font-mono ${
              frozen
                ? 'border-amber/50 text-amber'
                : low
                  ? 'animate-wiggle border-coral/60 text-coral shadow-glow-coral'
                  : ''
            }`}
          >
            {frozen ? <Pause size={14} /> : <Clock size={14} />} {mm}:{ss}
          </div>
          <button
            onClick={togglePause}
            className={`btn px-3 ${paused ? 'border-amber/50 text-amber hover:bg-amber/10' : ''}`}
            title={paused ? 'Retomar o cronômetro' : 'Pausar o cronômetro'}
          >
            {paused ? <Play size={15} /> : <Pause size={15} />}
            <span className="hidden sm:inline">{paused ? 'Retomar' : 'Pausar'}</span>
          </button>
        </div>
        <button onClick={confirmFinish} className="btn border-coral/40 text-coral hover:bg-coral/10">
          <Flag size={14} /> Submit
        </button>
      </div>

      {/* pausado: a prova sai da tela para a pausa não virar tempo extra de leitura */}
      {paused && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-strong flex flex-col items-center gap-3 p-10 text-center shadow-glow-soft"
        >
          <Coffee size={40} className="text-amber" />
          <h2 className="font-display text-2xl font-bold text-white">Simulado pausado</h2>
          <p className="max-w-sm font-body text-white/55">
            O cronômetro está parado em <span className="font-mono text-white/90">{mm}:{ss}</span> e a prova fica
            escondida enquanto isso. Volte quando quiser — o tempo de pausa não entra no seu ritmo por questão.
          </p>
          <div className="mt-1 flex flex-wrap justify-center gap-2 font-mono text-xs text-white/40">
            <span className="chip border-white/12 text-white/60">
              {answeredCount}/{questions.length} respondidas
            </span>
            <span className="chip border-white/12 text-white/60">questão {index + 1}</span>
            {pausedMs > 0 && (
              <span className="chip border-white/12 text-white/60">
                {Math.round(pausedMs / 60000)} min de pausa até agora
              </span>
            )}
          </div>
          <button onClick={togglePause} className="btn-accent mt-4">
            <Play size={18} /> Retomar simulado
          </button>
        </motion.div>
      )}

      {!paused && (
        <>
      {/* navigator */}
      <div className="mb-5 flex flex-wrap gap-1.5">
        {questions.map((qq, i) => {
          const answered = hasAnswer(answers[qq.id])
          return (
            <button
              key={qq.id}
              onClick={() => setIndex(i)}
              className={[
                'h-7 w-7 rounded-md border font-mono text-[11px] font-bold transition-all',
                i === index ? 'ring-1 ring-violet ring-offset-1 ring-offset-base' : '',
                answered ? 'border-cyan/40 bg-cyan/15 text-cyan' : 'border-white/10 bg-white/[0.03] text-white/50',
              ].join(' ')}
            >
              {i + 1}
            </button>
          )
        })}
      </div>

      {/* respondeu → relógio parado enquanto você lê a explicação */}
      {autoPaused && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-amber/40 bg-amber/[0.10] px-4 py-2.5"
        >
          <Pause size={16} className="shrink-0 text-amber" />
          <p className="flex-1 font-body text-sm text-amber/90">
            Cronômetro pausado em <span className="font-mono text-white/90">{mm}:{ss}</span> — leia a explicação sem
            pressa. Ele volta a correr na próxima questão.
          </p>
          <button
            onClick={() => setAutoResumedId(q.id)}
            className="btn border-amber/40 px-3 py-1.5 text-amber hover:bg-amber/10"
          >
            <Play size={14} /> Retomar agora
          </button>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        <QuestionCard
          key={q.id}
          q={q}
          index={index}
          total={questions.length}
          selected={answers[q.id] || null}
          revealed={isRevealed}
          onSelect={(letter) => pick(letter)}
        />
      </AnimatePresence>

      {/* instant + multi-select: confirm the selection to reveal */}
      {canCheckMulti && (
        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="font-body text-sm text-white/50">
            Marque {q.correctSet.length} · {selCount} escolhidas
          </span>
          <button onClick={checkMulti} className="btn-accent">
            Conferir <Check size={18} />
          </button>
        </div>
      )}

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
          <button onClick={confirmFinish} className="btn border-coral/40 text-coral hover:bg-coral/10">
            Submit <Flag size={16} />
          </button>
        )}
      </div>
        </>
      )}
    </div>
  )
}
