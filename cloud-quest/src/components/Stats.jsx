import { useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Brain,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Eye,
  Flame,
  Gauge as GaugeIcon,
  Info,
  Layers,
  Lightbulb,
  Repeat2,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Target,
  Timer,
  TrendingDown,
  TrendingUp,
  Trophy,
  Upload,
  Zap,
} from 'lucide-react'
import { shuffle } from '../lib/data'
import { exportProgress, importProgress } from '../lib/storage'
import { buildAnalytics } from '../lib/analytics'
import {
  BarChart,
  BarRows,
  Empty,
  Gauge,
  Heatmap,
  Legend,
  LineChart,
  Radar,
  Scatter,
  Sparkline,
  StackedBar,
} from './charts'
import { SERIES, STATUS, accColor, fmtDateBr, fmtDuration, heatColor, WEEKDAYS_PT } from '../lib/viz'

const GAP = 'pouco ensinado (gap)'
const BOX_LABELS = ['nova / errou', '1 dia', '3 dias', '7 dias', '16 dias', '35 dias']

const TABS = [
  { id: 'overview', label: 'Visão geral', icon: GaugeIcon },
  { id: 'domains', label: 'Domínios', icon: Layers },
  { id: 'trends', label: 'Evolução', icon: TrendingUp },
  { id: 'habits', label: 'Hábitos', icon: CalendarDays },
  { id: 'memory', label: 'Memória', icon: Brain },
  { id: 'exams', label: 'Simulados', icon: Trophy },
]

export default function Stats({ bank, state, srs, onStartQuestions, onBack }) {
  const [tab, setTab] = useState('overview')
  const a = useMemo(() => buildAnalytics({ bank, state, srs }), [bank, state, srs])
  const answered = state.answered || {}

  const drill = (title, questions) => questions.length && onStartQuestions(title, shuffle(questions))

  // Turns an insight / button descriptor into an actual practice session.
  function runDrill(d) {
    if (!d) return
    const qs = bank.questions
    switch (d.kind) {
      case 'domain':
        return drill(d.title, qs.filter((q) => q.domain === d.code))
      case 'domain-new':
        return drill(d.title, qs.filter((q) => q.domain === d.code && !answered[q.id]))
      case 'topic':
        return drill(d.title, qs.filter((q) => q.topicCode === d.code))
      case 'unsolved':
        return drill(d.title, qs.filter((q) => answered[q.id] && !answered[q.id].correct))
      case 'unseen':
        return drill(d.title, qs.filter((q) => !answered[q.id]))
      case 'repeated':
        return drill(d.title, qs.filter((q) => (answered[q.id]?.count || 0) >= 2))
      case 'gaps':
        return drill(d.title, qs.filter((q) => q.coverage === GAP))
      case 'leeches':
        return drill(d.title, a.srs.leeches.map((l) => l.q))
      case 'stale':
        return drill(d.title, qs.filter((q) => a.stale.some((t) => t.code === q.topicCode)))
      default:
        return
    }
  }

  const empty = a.core.seen === 0

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-6">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <button onClick={onBack} className="btn">
          <ArrowLeft size={16} /> Home
        </button>
        <div className="flex items-center gap-2 font-display text-xl font-bold text-ink">
          <BarChart3 size={20} className="text-cyan" /> Estatísticas
        </div>
        {!empty && (
          <span className="ml-auto hidden font-mono text-[11px] text-faint sm:block">
            {a.core.attempts} respostas · {a.core.seen}/{a.core.total} questões · desde {fmtDateBr(new Date(`${a.firstDay}T00:00:00`))}
          </span>
        )}
      </div>

      {empty ? (
        <div className="glass-strong flex flex-col items-center gap-3 p-10 text-center shadow-glow-soft">
          <GaugeIcon size={40} className="text-cyan" />
          <h2 className="font-display text-2xl font-bold text-ink">Sem dados ainda</h2>
          <p className="max-w-md font-body text-muted">
            Responda algumas questões e este painel se enche: readiness com decomposição por pilar, acerto por
            domínio e tópico, curvas de evolução, horários em que você rende mais, saúde da memória e histórico de
            simulados.
          </p>
        </div>
      ) : (
        <>
          {/* tab bar */}
          <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-line bg-sunken p-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 font-display text-[13px] font-semibold transition-colors ${
                  tab === t.id ? 'bg-sunken text-cyan' : 'text-muted hover:text-ink'
                }`}
              >
                <t.icon size={15} /> {t.label}
              </button>
            ))}
          </div>

          {tab === 'overview' && <Overview a={a} runDrill={runDrill} />}
          {tab === 'domains' && <Domains a={a} runDrill={runDrill} />}
          {tab === 'trends' && <Trends a={a} />}
          {tab === 'habits' && <Habits a={a} />}
          {tab === 'memory' && <Memory a={a} runDrill={runDrill} />}
          {tab === 'exams' && <Exams a={a} />}
        </>
      )}

      <SyncCard />
    </div>
  )
}

// ---------------------------------------------------------------- overview

function Overview({ a, runDrill }) {
  const { core, readiness, pace, time, streak, srs, exams } = a
  const rollingTail = a.rolling.filter((v) => v != null)

  return (
    <div className="grid gap-5">
      {/* readiness + pillar decomposition */}
      <div className="glass-strong grid gap-6 p-6 shadow-glow-soft sm:grid-cols-[auto_1fr]">
        <div className="flex items-center gap-5">
          <Gauge pct={readiness.score} stroke={readiness.verdict.stroke} label="readiness" />
          <div>
            <div className="label">Prontidão estimada</div>
            <div className={`font-display text-2xl font-bold ${readiness.verdict.tint}`}>{readiness.verdict.label}</div>
            <div className="mt-1 font-body text-xs text-faint">
              {readiness.gap > 0 ? `${readiness.gap} pts até a faixa de 80` : 'acima da faixa de 80'}
            </div>
          </div>
        </div>
        <div>
          <div className="mb-2 label">Como o número é formado</div>
          <div className="grid gap-2">
            {readiness.parts.map((p) => (
              <div key={p.key} className="flex items-center gap-3">
                <span className="w-[86px] shrink-0 font-body text-[13px] text-muted">{p.label}</span>
                <span className="h-2.5 flex-1 overflow-hidden rounded-full border border-line bg-sunken">
                  <span
                    className="block h-full rounded-full"
                    style={{
                      width: `${p.value == null ? 0 : Math.min(100, p.value)}%`,
                      background: p.value == null ? STATUS.idle : accColor(p.value),
                    }}
                  />
                </span>
                <span className="w-12 shrink-0 text-right font-mono text-[11px] text-muted">
                  {p.value == null ? '—' : `${Math.round(p.value)}`}
                </span>
                <span className="hidden w-16 shrink-0 text-right font-mono text-[10px] text-faint sm:block">
                  {p.value == null ? 'sem dados' : `peso ${Math.round(p.effWeight * 100)}%`}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-2 font-body text-[11px] text-faint">
            Pilares sem dado são ignorados e o peso é redistribuído — o score não te pune por algo que você ainda
            não começou.
          </p>
        </div>
      </div>

      {/* headline metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Metric label="Acerto" value={`${Math.round(core.hitRate)}%`} sub={`${core.rightTotal}/${core.attempts} tentativas`} tint="text-mint" />
        <Metric
          label="De primeira"
          value={core.firstTryRate == null ? '—' : `${Math.round(core.firstTryRate)}%`}
          sub={core.firstTryRate == null ? 'sem amostra' : `${core.firstTrySample} questões`}
          tint="text-cyan"
        />
        <Metric label="Cobertura" value={`${Math.round(core.coverage)}%`} sub={`${core.seen}/${core.total} vistas`} tint="text-violet" />
        <Metric label="Simulados" value={exams.count ? `${exams.avg}%` : '—'} sub={`${exams.count} feitos`} tint="text-amber" />
        <Metric label="Tempo total" value={fmtDuration(time.totalMs)} sub={time.medianMs ? `mediana ${Math.round(time.medianMs / 1000)}s/questão` : 'sem cronômetro ainda'} tint="text-pink" />
        <Metric label="Sequência" value={`${streak.current}d`} sub={`recorde ${streak.best}d · ${Math.round(streak.consistency)}% dos dias`} tint="text-coral" />
      </div>

      {/* momentum */}
      <div className="glass grid gap-5 p-5 sm:grid-cols-[1fr_1.2fr]">
        <div>
          <div className="mb-3 flex items-center gap-2 label">
            <Zap size={14} /> Últimos 7 dias vs. 7 anteriores
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Delta label="Respostas" now={pace.last7.n} before={pace.prev7.n} />
            <Delta
              label="Acerto"
              now={pace.last7.acc == null ? null : Math.round(pace.last7.acc)}
              before={pace.prev7.acc == null ? null : Math.round(pace.prev7.acc)}
              suffix="%"
            />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <MiniStat label="Ritmo" value={`${pace.perDay.toFixed(1)}/dia`} sub={`meta ${pace.goal}/dia`} />
            <MiniStat
              label="Faltam"
              value={core.remaining}
              sub={pace.daysToFinish ? `~${pace.daysToFinish} dias no ritmo atual` : 'sem questões novas na semana'}
            />
          </div>
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between label">
            <span>Acerto móvel · janela de 20 respostas</span>
            <span className="font-mono text-faint">
              {rollingTail.length ? `${Math.round(rollingTail[rollingTail.length - 1])}%` : '—'}
            </span>
          </div>
          {rollingTail.length > 3 ? (
            <>
              <Sparkline values={a.rolling} color={SERIES[0]} height={64} band={[0, 100]} />
              <p className="mt-1 font-body text-[11px] text-faint">
                últimas {a.rolling.length} respostas · variação de {Math.round(Math.min(...rollingTail))}% a{' '}
                {Math.round(Math.max(...rollingTail))}%
              </p>
            </>
          ) : (
            <Empty>Responda ~20 questões para a curva móvel aparecer</Empty>
          )}
        </div>
      </div>

      {/* insight engine */}
      <div className="glass p-5">
        <div className="mb-3 flex items-center gap-2 label">
          <Lightbulb size={14} className="text-amber" /> O que o painel está vendo
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {a.insights.map((i, idx) => (
            <InsightCard key={idx} insight={i} onDrill={runDrill} />
          ))}
        </div>
      </div>

      {/* practice volume */}
      <div className="glass p-5">
        <div className="mb-4 flex items-center gap-2 label">
          <Repeat2 size={14} /> Volume de prática
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric label="Respondidas" value={core.seen} sub={`faltam ${core.remaining}`} tint="text-cyan" />
          <Metric label="Respostas dadas" value={core.attempts} sub={`${core.attemptsPerQuestion.toFixed(1)}× por questão`} tint="text-violet" />
          <Metric label="Repetidas 2+×" value={core.twice + core.thrice} sub={`${core.thrice} feitas 3+ vezes`} tint="text-amber" />
          <Metric label="Sem acerto" value={core.notSolved} sub={`${core.solved} já fechadas`} tint="text-coral" />
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between label">
            <span>Quantas vezes você respondeu cada questão</span>
            <span className="font-mono text-faint">{core.seen} questões</span>
          </div>
          <StackedBar
            segments={[
              { label: '1 vez', value: core.once, color: SERIES[0] },
              { label: '2 vezes', value: core.twice, color: SERIES[1] },
              { label: '3+ vezes', value: core.thrice, color: SERIES[3] },
            ]}
            total={core.seen}
          />
          <Legend
            className="mt-2"
            items={[
              { label: '1 vez', color: SERIES[0], value: core.once },
              { label: '2 vezes', color: SERIES[1], value: core.twice },
              { label: '3+ vezes', color: SERIES[3], value: core.thrice },
            ]}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <DrillButton icon={RotateCcw} label={`Revisar não acertadas (${core.notSolved})`} disabled={!core.notSolved} onClick={() => runDrill({ kind: 'unsolved', title: 'Ainda sem acerto' })} />
          <DrillButton icon={Repeat2} label={`Revisar repetidas (${core.twice + core.thrice})`} disabled={!(core.twice + core.thrice)} onClick={() => runDrill({ kind: 'repeated', title: 'Respondidas 2+ vezes' })} />
          <DrillButton icon={Eye} label={`Ver as que faltam (${core.remaining})`} disabled={core.remaining <= 0} onClick={() => runDrill({ kind: 'unseen', title: 'Ainda não respondidas' })} />
          <DrillButton icon={AlertTriangle} label={`Viciadas (${srs.leechCount})`} disabled={!srs.leechCount} onClick={() => runDrill({ kind: 'leeches', title: 'Questões viciadas' })} />
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- domains

function Domains({ a, runDrill }) {
  const [sort, setSort] = useState('acc')
  const withData = a.domains.filter((d) => d.seen > 0)

  const topicPoints = a.topics
    .filter((t) => t.seen >= 2)
    .map((t) => ({
      key: t.code,
      x: t.seen,
      y: t.hitRate,
      r: Math.max(4, Math.min(13, 3 + Math.sqrt(t.attempts) * 1.5)),
      label: t.name,
      sub: `${t.solved}/${t.seen} fechadas · ${t.attempts} tentativas`,
      color: accColor(t.hitRate),
      onClick: () => runDrill({ kind: 'topic', code: t.code, title: `Tópico · ${t.name}` }),
    }))

  const sorted = useMemo(() => {
    const list = a.topics.filter((t) => t.seen >= 2)
    const by = {
      acc: (x, y) => x.hitRate - y.hitRate,
      volume: (x, y) => y.seen - x.seen,
      coverage: (x, y) => x.coverage - y.coverage,
      stale: (x, y) => (y.staleDays ?? -1) - (x.staleDays ?? -1),
    }
    return [...list].sort(by[sort]).slice(0, 14)
  }, [a.topics, sort])

  return (
    <div className="grid gap-5">
      <div className="grid gap-5 lg:grid-cols-[auto_1fr]">
        <div className="glass flex flex-col p-5">
          <div className="mb-2 label">Perfil por domínio</div>
          <div className="flex flex-1 flex-col justify-center">
          <Radar
            axes={withData.map((d) => ({ label: d.code, value: d.hitRate ?? 0, sub: `${d.seen}/${d.bank} vistas` }))}
            refAxes={withData.map((d) => ({ label: d.code, value: d.coverage }))}
            name="acerto"
            refName="cobertura"
            color={SERIES[0]}
            refColor={SERIES[1]}
          />
          <Legend
            className="justify-center"
            items={[
              { label: 'acerto por tentativa', color: SERIES[0] },
              { label: 'cobertura do banco', color: SERIES[1] },
            ]}
          />
          </div>
        </div>

        <div className="glass p-5">
          <div className="mb-4 flex items-center gap-2 label">
            <Layers size={14} /> Acerto por domínio do exame
          </div>
          <BarRows
            rows={a.domains.map((d) => ({
              key: d.code,
              label: `${d.code} · ${d.name}`,
              sub: `${d.seen}/${d.bank} vistas · ${d.attempts} tentativas · ${d.share.toFixed(0)}% do banco`,
              value: d.hitRate ?? 0,
              right: d.seen ? `${Math.round(d.hitRate)}% · ${d.solved}/${d.seen}` : 'sem dados',
              onClick: () => runDrill({ kind: 'domain', code: d.code, title: `Domínio · ${d.code}` }),
            }))}
          />
          <div className="mt-5 mb-3 label">Cobertura por domínio</div>
          <BarRows
            rows={a.domains.map((d) => ({
              key: `c-${d.code}`,
              label: d.code,
              sub: `${d.bank} questões no banco`,
              value: d.coverage,
              color: SERIES[1],
              right: `${Math.round(d.coverage)}%`,
              onClick: () => runDrill({ kind: 'domain-new', code: d.code, title: `${d.code} · não respondidas` }),
            }))}
          />
          <p className="mt-3 font-body text-[11px] text-faint">
            Clique numa barra de acerto para treinar o domínio inteiro, ou numa de cobertura para pegar só o que
            falta.
          </p>
        </div>
      </div>

      {/* topic map */}
      <div className="glass p-5">
        <div className="mb-1 flex flex-wrap items-center gap-2 label">
          <Target size={14} /> Mapa de tópicos · volume × acerto
          <span className="ml-auto font-mono normal-case tracking-normal text-faint">
            eixo y = acerto · bolha = tentativas · clique para treinar
          </span>
        </div>
        {topicPoints.length >= 3 ? (
          <Scatter points={topicPoints} xLabel="questões respondidas →" yLabel="acerto %" height={260} />
        ) : (
          <Empty>Responda questões de pelo menos 3 tópicos</Empty>
        )}
        <Legend
          className="mt-2"
          items={[
            { label: '< 50% acerto', color: STATUS.bad },
            { label: '50–69%', color: STATUS.warn },
            { label: '≥ 70% (linha de corte)', color: STATUS.good },
          ]}
        />
      </div>

      {/* ranked topics */}
      <div className="glass p-5">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <span className="label">Tópicos</span>
          <div className="ml-auto flex gap-1 rounded-lg border border-line bg-sunken p-0.5">
            {[
              { id: 'acc', label: 'Pior acerto' },
              { id: 'volume', label: 'Mais praticados' },
              { id: 'coverage', label: 'Menos cobertos' },
              { id: 'stale', label: 'Mais parados' },
            ].map((o) => (
              <button
                key={o.id}
                onClick={() => setSort(o.id)}
                className={`rounded-md px-2.5 py-1 font-display text-[11px] font-semibold transition-colors ${
                  sort === o.id ? 'bg-sunken text-cyan' : 'text-faint hover:text-ink'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
        <BarRows
          rows={sorted.map((t) => ({
            key: t.code,
            label: t.name,
            sub: `${t.seen}/${t.bank} do banco · ${t.attempts} tentativas${t.staleDays != null ? ` · ${t.staleDays}d parado` : ''}`,
            value: t.hitRate,
            right: `${Math.round(t.hitRate)}% · ${t.solved}/${t.seen}`,
            onClick: () => runDrill({ kind: 'topic', code: t.code, title: `Tópico · ${t.name}` }),
          }))}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <TopicList title="Mais fortes" icon={TrendingUp} tint="text-mint" rows={a.strongest} onPick={runDrill} />
        <TopicList title="Precisam de trabalho" icon={TrendingDown} tint="text-coral" rows={a.weakest} onPick={runDrill} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="glass p-5">
          <div className="mb-3 label">Acerto vs. cobertura do curso</div>
          <BarRows
            rows={a.byCoverage.map((b) => ({
              key: b.key,
              label: b.label,
              sub: `${b.seen}/${b.bank} respondidas`,
              value: b.hitRate ?? 0,
              right: b.seen ? `${Math.round(b.hitRate)}%` : '—',
              onClick: b.key === GAP ? () => runDrill({ kind: 'gaps', title: 'Study the Gaps' }) : undefined,
            }))}
          />
          <p className="mt-3 font-body text-[11px] text-faint">
            Se as "pouco ensinadas" ficam bem abaixo das "ensinadas", o buraco é de conteúdo do curso, não de
            treino.
          </p>
        </div>
        <div className="glass p-5">
          <div className="mb-3 label">Por qualidade da questão</div>
          <BarRows
            rows={a.byQuality.map((b) => ({
              key: b.key,
              label: b.label,
              sub: `${b.seen}/${b.bank} respondidas`,
              value: b.hitRate ?? 0,
              right: b.seen ? `${Math.round(b.hitRate)}%` : '—',
            }))}
          />
          {a.untouched.length > 0 && (
            <>
              <div className="mb-2 mt-5 label">Tópicos ainda intocados</div>
              <div className="flex flex-wrap gap-1.5">
                {a.untouched.map((t) => (
                  <button
                    key={t.code}
                    onClick={() => runDrill({ kind: 'topic', code: t.code, title: `Tópico · ${t.name}` })}
                    className="chip border-line text-muted hover:border-cyan/40 hover:text-cyan"
                  >
                    {t.name} <span className="font-mono text-faint">{t.bank}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- trends

function Trends({ a }) {
  const [range, setRange] = useState(30)
  const daily = range === 30 ? a.daily : a.daily90
  const hasAcc = daily.some((d) => d.acc != null)
  const rollingTail = a.rolling.filter((v) => v != null)

  return (
    <div className="grid gap-5">
      <div className="glass p-5">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-2 label">
            <Activity size={14} /> Questões respondidas por dia
          </span>
          <div className="ml-auto flex gap-1 rounded-lg border border-line bg-sunken p-0.5">
            {[30, 90].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`rounded-md px-2.5 py-1 font-display text-[11px] font-semibold transition-colors ${
                  range === r ? 'bg-sunken text-cyan' : 'text-faint hover:text-ink'
                }`}
              >
                {r} dias
              </button>
            ))}
          </div>
        </div>
        <BarChart
          bars={daily.map((d) => ({
            label: d.label,
            value: d.answers,
            color: d.answers >= a.pace.goal ? SERIES[0] : 'rgba(26,111,224,0.30)',
            tip: (
              <>
                <div className="mb-0.5 font-display text-[11px] font-semibold text-ink">{d.label}</div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted">respostas</span>
                  <span className="font-mono text-ink">{d.answers}</span>
                </div>
                {d.acc != null && (
                  <div className="flex justify-between gap-3">
                    <span className="text-muted">acerto</span>
                    <span className="font-mono" style={{ color: accColor(d.acc) }}>
                      {Math.round(d.acc)}%
                    </span>
                  </div>
                )}
              </>
            ),
          }))}
          height={150}
        />
        <Legend
          className="mt-2"
          items={[
            { label: `dia com meta batida (${a.pace.goal}+)`, color: SERIES[0] },
            { label: 'abaixo da meta', color: 'rgba(26,111,224,0.30)' },
          ]}
        />
      </div>

      <div className="glass p-5">
        <div className="mb-3 flex items-center gap-2 label">
          <Target size={14} /> Acerto por dia
        </div>
        {/* no area fill here: days without study leave holes in the line, and
            isolated filled segments would read as bars next to the chart above */}
        {hasAcc ? (
          <LineChart
            labels={daily.map((d) => d.label)}
            series={[{ name: 'acerto do dia', color: SERIES[0], values: daily.map((d) => d.acc) }]}
            yMax={100}
            yFormat={(v) => `${v}%`}
            refLine={{ value: 70, label: 'corte 70%', color: STATUS.warn }}
            height={180}
            showDots={range === 30}
          />
        ) : (
          <Empty>O acerto por dia começa a ser registrado a partir de agora</Empty>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="glass p-5">
          <div className="mb-3 flex items-center gap-2 label">
            <Sparkles size={14} /> Acerto móvel (janela de 20)
          </div>
          {rollingTail.length > 3 ? (
            <LineChart
              labels={a.rolling.map((_, i) => `#${i + 1}`)}
              series={[{ name: 'acerto móvel', color: SERIES[1], values: a.rolling, area: true }]}
              yMax={100}
              yFormat={(v) => `${v}%`}
              refLine={{ value: 70, label: '70%', color: STATUS.warn }}
              height={180}
            />
          ) : (
            <Empty>Precisa de pelo menos 24 respostas registradas</Empty>
          )}
        </div>

        <div className="glass p-5">
          <div className="mb-3 flex items-center gap-2 label">
            <Layers size={14} /> Cobertura acumulada do banco
          </div>
          <LineChart
            labels={a.cumulative.map((c) => c.label)}
            series={[{ name: 'questões vistas', color: SERIES[2], values: a.cumulative.map((c) => c.value), area: true }]}
            yMax={a.core.total}
            height={180}
          />
          <div className="mt-2 flex items-center justify-between font-body text-[11px] text-faint">
            <span>
              {a.core.seen} de {a.core.total} questões ({Math.round(a.core.coverage)}%)
            </span>
            <span>
              {a.pace.daysToFinish
                ? `fim previsto em ${fmtDateBr(a.pace.finishEta)}`
                : 'ritmo de questões novas parado'}
            </span>
          </div>
        </div>
      </div>

      <div className="glass grid gap-3 p-5 sm:grid-cols-4">
        <MiniStat label="Últimos 7 dias" value={a.pace.volume7} sub="respostas" />
        <MiniStat label="Últimos 30 dias" value={a.pace.volume30} sub="respostas" />
        <MiniStat label="Questões novas/dia" value={a.pace.newPerDay7.toFixed(1)} sub="média da semana" />
        <MiniStat
          label="Previsão de término"
          value={a.pace.daysToFinish ? `${a.pace.daysToFinish}d` : '—'}
          sub={a.pace.finishEta ? fmtDateBr(a.pace.finishEta) : 'sem ritmo para projetar'}
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- habits

function Habits({ a }) {
  const hoursWithData = a.hours.filter((h) => h.n > 0)
  const accHours = a.hours.map((h) => (h.n >= 5 ? h.acc : null))
  const wd = a.weekdays.map((w) => ({ ...w, label: WEEKDAYS_PT[w.d] }))

  return (
    <div className="grid gap-5">
      <div className="glass p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-2 label">
            <CalendarDays size={14} /> Atividade · 26 semanas
          </span>
          <div className="flex flex-wrap gap-2">
            <span className="chip border-amber/40 text-amber">
              <Flame size={13} /> {a.streak.current} dia{a.streak.current === 1 ? '' : 's'}
            </span>
            <span className="chip border-line text-muted">recorde {a.streak.best}d</span>
            <span className="chip border-line text-muted">
              {a.streak.activeDays} dias ativos de {a.streak.spanDays}
            </span>
          </div>
        </div>
        <Heatmap cells={a.heat} weeks={Math.ceil(a.heat.length / 7)} colorFor={(c) => heatColor(c.count, a.heatMax)} />
        <div className="mt-3 flex items-center gap-1.5 label">
          menos
          {[0, 2, 5, 10, a.heatMax].map((n, i) => (
            <span key={i} className="h-3 w-3 rounded-sm" style={{ background: heatColor(n, a.heatMax) }} />
          ))}
          mais
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="glass p-5">
          <div className="mb-3 flex items-center gap-2 label">
            <Clock size={14} /> Quando você estuda
          </div>
          {hoursWithData.length ? (
            <BarChart
              bars={a.hours.map((h) => ({
                label: String(h.h).padStart(2, '0'),
                value: h.n,
                tip: (
                  <>
                    <div className="mb-0.5 font-display text-[11px] font-semibold text-ink">
                      {String(h.h).padStart(2, '0')}h
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-muted">respostas</span>
                      <span className="font-mono text-ink">{h.n}</span>
                    </div>
                    {h.acc != null && (
                      <div className="flex justify-between gap-3">
                        <span className="text-muted">acerto</span>
                        <span className="font-mono" style={{ color: accColor(h.acc) }}>
                          {Math.round(h.acc)}%
                        </span>
                      </div>
                    )}
                  </>
                ),
              }))}
              height={140}
              labelEvery={3}
            />
          ) : (
            <Empty />
          )}
        </div>

        <div className="glass p-5">
          <div className="mb-3 flex items-center gap-2 label">
            <Target size={14} /> Acerto por horário
          </div>
          {accHours.some((v) => v != null) ? (
            <>
              <LineChart
                labels={a.hours.map((h) => String(h.h).padStart(2, '0'))}
                series={[{ name: 'acerto', color: SERIES[3], values: accHours }]}
                yMax={100}
                yFormat={(v) => `${v}%`}
                refLine={{ value: 70, label: '70%', color: STATUS.warn }}
                height={140}
                showDots
              />
              <p className="mt-1 font-body text-[11px] text-faint">
                só horários com 5+ respostas ·{' '}
                {a.bestHour
                  ? `melhor às ${String(a.bestHour.h).padStart(2, '0')}h (${Math.round(a.bestHour.acc)}%)`
                  : 'ainda sem horário destacado'}
              </p>
            </>
          ) : (
            <Empty>Precisa de 5+ respostas num mesmo horário</Empty>
          )}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="glass p-5">
          <div className="mb-3 label">Por dia da semana</div>
          <BarRows
            valueFormat={(v) => `${Math.round(v)}`}
            rows={wd.map((w) => ({
              key: w.label,
              label: w.label,
              sub: w.acc == null ? 'sem dados' : `${Math.round(w.acc)}% de acerto`,
              value: w.n,
              max: Math.max(1, ...wd.map((x) => x.n)),
              color: SERIES[0],
              right: `${w.n}`,
            }))}
          />
        </div>

        <div className="glass p-5">
          <div className="mb-3 flex items-center gap-2 label">
            <Timer size={14} /> Sessões de estudo
          </div>
          <div className="grid grid-cols-2 gap-3">
            <MiniStat label="Sessões" value={a.sessions.count} sub="pausa de 30 min separa uma da outra" />
            <MiniStat label="Média" value={`${a.sessions.avgN.toFixed(0)} q`} sub={fmtDuration(a.sessions.avgMs)} />
            <MiniStat
              label="Maior sessão"
              value={a.sessions.longest ? `${a.sessions.longest.n} q` : '—'}
              sub={a.sessions.longest ? fmtDuration(a.sessions.longest.end - a.sessions.longest.start) : ''}
            />
            <MiniStat
              label="Melhor sessão"
              value={a.sessions.best ? `${Math.round((a.sessions.best.ok / a.sessions.best.n) * 100)}%` : '—'}
              sub={a.sessions.best ? `${a.sessions.best.n} questões` : 'mínimo de 10 questões'}
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <MiniStat label="Mediana por questão" value={a.time.medianMs ? `${Math.round(a.time.medianMs / 1000)}s` : '—'} sub="tempo até responder" />
            <MiniStat
              label="Certas vs. erradas"
              value={a.time.medianOkMs ? `${Math.round(a.time.medianOkMs / 1000)}s / ${Math.round(a.time.medianBadMs / 1000)}s` : '—'}
              sub="mediana acerto / erro"
            />
          </div>
          {a.time.speedAccuracy != null && (
            <p className="mt-3 font-body text-[11px] text-faint">
              Correlação tempo × acerto: <span className="font-mono text-muted">{a.time.speedAccuracy.toFixed(2)}</span>{' '}
              — {a.time.speedAccuracy < -0.1 ? 'demorar mais não está ajudando' : a.time.speedAccuracy > 0.1 ? 'pensar mais tempo está rendendo acertos' : 'tempo e acerto praticamente independentes'}.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- memory

function Memory({ a, runDrill }) {
  const { srs } = a
  const maxBox = Math.max(1, ...srs.boxes.map((b) => b.q + b.c))

  return (
    <div className="grid gap-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Agendados" value={srs.scheduled} sub="questões + flashcards" tint="text-cyan" />
        <Metric label="Maduros" value={srs.matured} sub={`${Math.round(srs.maturity)}% do total`} tint="text-mint" />
        <Metric label="Vencidos" value={srs.due} sub={`${srs.dueQ} questões · ${srs.dueC} cards`} tint="text-coral" />
        <Metric label="Recaídas" value={srs.lapsesTotal} sub={`${srs.leechCount} itens viciados`} tint="text-amber" />
      </div>

      <div className="glass p-5">
        <div className="mb-3 flex items-center gap-2 label">
          <Brain size={14} /> Distribuição pelas caixas de repetição
        </div>
        <div className="grid gap-2">
          {srs.boxes.map((b) => (
            <div key={b.box} className="flex items-center gap-3">
              <span className="w-24 shrink-0">
                <span className="block font-body text-[13px] text-muted">Caixa {b.box}</span>
                <span className="block font-mono text-[10px] text-faint">{BOX_LABELS[b.box]}</span>
              </span>
              <span className="flex-1">
                <StackedBar
                  segments={[
                    { label: 'questões', value: b.q, color: SERIES[0] },
                    { label: 'flashcards', value: b.c, color: SERIES[1] },
                  ]}
                  total={maxBox}
                  height={10}
                />
              </span>
              <span className="w-16 shrink-0 text-right font-mono text-[11px] text-muted">{b.q + b.c}</span>
            </div>
          ))}
        </div>
        <Legend
          className="mt-3"
          items={[
            { label: 'questões', color: SERIES[0] },
            { label: 'flashcards', color: SERIES[1] },
          ]}
        />
        <p className="mt-2 font-body text-[11px] text-faint">
          Cada acerto empurra o item uma caixa adiante (intervalo maior); um erro devolve à caixa 0. Uma barriga na
          caixa 0 significa que você está reaprendendo mais do que consolidando.
        </p>
      </div>

      <div className="glass p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-2 label">
            <CalendarDays size={14} /> Revisões chegando · 14 dias
          </span>
          {srs.due > 0 && (
            <span className="chip border-coral/40 text-coral">
              <AlertTriangle size={13} /> {srs.due} já vencidas
            </span>
          )}
        </div>
        <BarChart bars={srs.forecast.map((f) => ({ label: f.label, value: f.value }))} height={140} labelEvery={2} />
        <p className="mt-2 font-body text-[11px] text-faint">
          Só o que ainda vai vencer — o atrasado está no selo acima, fora da escala para não achatar o gráfico.
          Picos altos avisam que vale antecipar revisões antes que se acumulem.
        </p>
      </div>

      <div className="glass p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-2 label">
            <AlertTriangle size={14} className="text-coral" /> Questões viciadas
          </span>
          <span className="font-body text-[11px] text-faint">erradas 2+ vezes mesmo depois de acertadas</span>
          {srs.leechCount > 0 && (
            <button
              onClick={() => runDrill({ kind: 'leeches', title: 'Questões viciadas' })}
              className="btn ml-auto text-xs"
            >
              Treinar as {Math.min(srs.leechCount, 8)} piores <ArrowRight size={14} />
            </button>
          )}
        </div>
        {srs.leeches.length ? (
          <ul className="grid gap-2">
            {srs.leeches.map((l) => (
              <li key={l.id} className="flex items-start gap-3 rounded-lg border border-line bg-sunken p-3">
                <span className="chip shrink-0 border-coral/40 font-mono text-coral">{l.lapses}× erros</span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 font-body text-[13px] text-ink">{l.q.question}</span>
                  <span className="mt-0.5 block font-mono text-[10px] text-faint">
                    {l.q.domain} · {l.q.topicName} · caixa {l.box} · {l.reps} revisões
                  </span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>Nenhuma questão viciada — o que você acerta está ficando acertado</Empty>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- exams

function Exams({ a }) {
  const { exams } = a
  if (!exams.count) {
    return (
      <div className="glass-strong flex flex-col items-center gap-3 p-10 text-center">
        <Trophy size={36} className="text-amber" />
        <h3 className="font-display text-xl font-bold text-ink">Nenhum simulado ainda</h3>
        <p className="max-w-sm font-body text-muted">
          O simulado é o pilar que mais move o readiness. Faça um de 20 questões para calibrar o painel.
        </p>
      </div>
    )
  }

  const trendTxt =
    exams.slope > 0.8 ? 'em alta' : exams.slope < -0.8 ? 'em queda' : 'estável'
  const trendTint = exams.slope > 0.8 ? 'text-mint' : exams.slope < -0.8 ? 'text-coral' : 'text-muted'

  return (
    <div className="grid gap-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Metric label="Simulados" value={exams.count} sub={`${exams.passed} aprovados`} tint="text-cyan" />
        <Metric label="Média" value={`${exams.avg}%`} sub={`últimos 5: ${Math.round(exams.last5Avg)}%`} tint="text-violet" />
        <Metric label="Melhor" value={`${exams.best}%`} sub={`taxa de aprovação ${exams.passRate}%`} tint="text-mint" />
        <Metric label="Tendência" value={`${exams.slope > 0 ? '+' : ''}${exams.slope.toFixed(1)}`} sub={`pts por prova · ${trendTxt}`} tint={trendTint} />
        <Metric
          label="Ritmo"
          value={exams.avgSecPerQuestion ? `${Math.round(exams.avgSecPerQuestion)}s` : '—'}
          sub="por questão · limite 90s"
          tint="text-amber"
        />
      </div>

      <div className="glass p-5">
        <div className="mb-3 flex items-center gap-2 label">
          <Trophy size={14} /> Histórico de notas
        </div>
        <LineChart
          labels={exams.recent.map((e, i) => `#${exams.history.length - exams.recent.length + i + 1}`)}
          series={[{ name: 'nota', color: SERIES[0], values: exams.recent.map((e) => e.pct), area: true }]}
          yMax={100}
          yFormat={(v) => `${v}%`}
          refLine={{ value: 70, label: 'aprovação 70%', color: STATUS.warn }}
          height={190}
          showDots
        />
      </div>

      {exams.byDomain.length > 0 && (
        <div className="glass p-5">
          <div className="mb-3 flex items-center gap-2 label">
            <Layers size={14} /> Desempenho por domínio · somando todos os simulados
          </div>
          <BarRows
            rows={exams.byDomain.map((d) => ({
              key: d.code,
              label: `${d.code} · ${d.name}`,
              sub: `${d.correct}/${d.total} em prova`,
              value: d.acc,
              right: `${Math.round(d.acc)}%`,
            }))}
          />
        </div>
      )}

      <div className="glass p-5">
        <div className="mb-3 label">Últimas provas</div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse font-body text-sm">
            <thead>
              <tr className="border-b border-line text-left font-display text-[11px] uppercase tracking-wider text-faint">
                <th className="py-2 pr-3 font-semibold">Data</th>
                <th className="py-2 pr-3 font-semibold">Nota</th>
                <th className="py-2 pr-3 font-semibold">Acertos</th>
                <th className="py-2 pr-3 font-semibold">Duração</th>
                <th className="py-2 font-semibold">Modo</th>
              </tr>
            </thead>
            <tbody>
              {[...exams.history]
                .reverse()
                .slice(0, 12)
                .map((e) => (
                  <tr key={e.date} className="border-b border-line last:border-0">
                    <td className="py-2 pr-3 font-mono text-[12px] text-muted">{fmtDateBr(e.ts)}</td>
                    <td className="py-2 pr-3">
                      <span className="inline-flex items-center gap-1.5 font-mono font-bold" style={{ color: accColor(e.pct) }}>
                        {e.passed ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                        {e.pct}%
                      </span>
                    </td>
                    <td className="py-2 pr-3 font-mono text-[12px] text-muted">
                      {e.correct}/{e.total}
                    </td>
                    <td className="py-2 pr-3 font-mono text-[12px] text-muted">
                      {e.ms ? fmtDuration(e.ms) : '—'}
                      {e.pausedMs > 0 && (
                        <span className="ml-1 text-faint">+{fmtDuration(e.pausedMs)} pausa</span>
                      )}
                    </td>
                    <td className="py-2 font-mono text-[12px] text-faint">
                      {e.feedback === 'instant' ? 'imediato' : 'clássico'}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- pieces

function InsightCard({ insight, onDrill }) {
  const tone = {
    good: { icon: CheckCircle2, tint: 'text-mint', border: 'border-mint/25' },
    warn: { icon: AlertTriangle, tint: 'text-amber', border: 'border-amber/25' },
    bad: { icon: AlertTriangle, tint: 'text-coral', border: 'border-coral/25' },
    info: { icon: Info, tint: 'text-cyan', border: 'border-cyan/25' },
  }[insight.tone]
  const Icon = tone.icon
  return (
    <div className={`flex gap-3 rounded-xl border ${tone.border} bg-sunken p-3.5`}>
      <Icon size={16} className={`mt-0.5 shrink-0 ${tone.tint}`} />
      <div className="min-w-0">
        <div className="font-display text-[13px] font-semibold text-ink">{insight.title}</div>
        <p className="mt-0.5 font-body text-[12px] leading-snug text-muted">{insight.text}</p>
        {insight.drill && (
          <button
            onClick={() => onDrill(insight.drill)}
            className={`mt-2 inline-flex items-center gap-1 font-display text-[12px] font-semibold ${tone.tint} hover:underline`}
          >
            Treinar isso <ArrowRight size={13} />
          </button>
        )}
      </div>
    </div>
  )
}

function Delta({ label, now, before, suffix = '' }) {
  const has = now != null && before != null
  const d = has ? now - before : null
  const up = d != null && d > 0
  const flat = d === 0 || d == null
  return (
    <div className="glass flex flex-col justify-center p-3.5">
      <div className="font-mono text-2xl font-bold leading-none text-ink">
        {now == null ? '—' : now}
        {now != null && suffix}
      </div>
      <div className="mt-1.5 label">{label}</div>
      <div
        className={`mt-0.5 flex items-center gap-1 font-mono text-[11px] ${
          flat ? 'text-faint' : up ? 'text-mint' : 'text-coral'
        }`}
      >
        {!flat && (up ? <TrendingUp size={12} /> : <TrendingDown size={12} />)}
        {d == null ? 'sem comparação' : `${up ? '+' : ''}${d}${suffix} vs. semana anterior`}
      </div>
    </div>
  )
}

function Metric({ label, value, sub, tint }) {
  return (
    <div className="glass flex flex-col justify-center p-3.5">
      <div className={`font-mono text-2xl font-bold leading-none ${tint}`}>{value}</div>
      <div className="mt-1.5 label">{label}</div>
      <div className="mt-0.5 font-body text-[11px] leading-tight text-faint">{sub}</div>
    </div>
  )
}

function MiniStat({ label, value, sub }) {
  return (
    <div className="rounded-xl border border-line bg-sunken p-3">
      <div className="font-mono text-lg font-bold leading-none text-ink">{value}</div>
      <div className="mt-1 label">{label}</div>
      {sub && <div className="mt-0.5 font-body text-[11px] leading-tight text-faint">{sub}</div>}
    </div>
  )
}

function DrillButton({ icon: Icon, label, disabled, onClick }) {
  return (
    <button onClick={onClick} disabled={disabled} className="btn text-xs disabled:cursor-not-allowed disabled:opacity-40">
      <Icon size={14} /> {label}
    </button>
  )
}

function TopicList({ title, icon: Icon, tint, rows, onPick }) {
  return (
    <div className="glass p-5">
      <div className={`mb-3 flex items-center gap-2 label ${tint}`}>
        <Icon size={14} /> {title}
      </div>
      {rows.length === 0 ? (
        <p className="font-body text-sm text-faint">Responda mais algumas para ranquear os tópicos.</p>
      ) : (
        <ul className="space-y-1.5">
          {rows.map((t) => (
            <li key={t.code}>
              <button
                onClick={() => onPick({ kind: 'topic', code: t.code, title: `Tópico · ${t.name}` })}
                className="group flex w-full items-center gap-3 rounded-lg px-1 py-1 text-left transition-colors hover:bg-sunken"
              >
                <span className="min-w-0 flex-1 truncate font-body text-sm text-ink">{t.name}</span>
                <span className="shrink-0 font-mono text-xs font-bold" style={{ color: accColor(t.hitRate) }}>
                  {Math.round(t.hitRate)}%
                </span>
                <span className="shrink-0 font-mono text-[11px] text-faint">
                  {t.solved}/{t.seen}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function SyncCard() {
  const [code, setCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [paste, setPaste] = useState('')
  const [msg, setMsg] = useState(null) // { ok: bool, text: string }

  const handleCopy = async () => {
    const c = exportProgress()
    setCode(c)
    setMsg(null)
    try {
      await navigator.clipboard.writeText(c)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard blocked — code is shown in the box to copy by hand */
    }
  }

  const handleRestore = () => {
    try {
      const n = importProgress(paste)
      setMsg({ ok: true, text: `Restaurado ${n} item${n === 1 ? '' : 's'} — recarregando…` })
      setTimeout(() => window.location.reload(), 700)
    } catch {
      setMsg({ ok: false, text: 'Código inválido — copie o texto inteiro e tente de novo.' })
    }
  }

  return (
    <div className="glass mt-6 p-5">
      <div className="mb-1 flex items-center gap-2 label">
        <RefreshCw size={14} className="text-cyan" /> Sincronizar progresso (Linux ⇄ Windows)
      </div>
      <p className="mb-4 font-body text-xs text-faint">
        Seu progresso vive só neste navegador. Para levar para o outro SO: <b>copie</b> o código aqui e{' '}
        <b>cole &amp; restaure</b> lá. Sem conta, sem internet.
      </p>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <button onClick={handleCopy} className="btn w-full justify-center">
            {copied ? <Check size={16} className="text-mint" /> : <Copy size={16} />}
            {copied ? 'Copiado!' : 'Copiar meu progresso'}
          </button>
          {code && (
            <textarea
              readOnly
              value={code}
              onFocus={(e) => e.target.select()}
              className="mt-2 h-20 w-full resize-none rounded-lg border border-line bg-sunken p-2 font-mono text-[10px] leading-tight text-muted"
            />
          )}
        </div>

        <div>
          <textarea
            value={paste}
            onChange={(e) => setPaste(e.target.value)}
            placeholder="Cole aqui o código do outro SO…"
            className="h-20 w-full resize-none rounded-lg border border-line bg-sunken p-2 font-mono text-[10px] leading-tight text-ink placeholder:text-faint"
          />
          <button
            onClick={handleRestore}
            disabled={!paste.trim()}
            className="btn mt-2 w-full justify-center disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Upload size={16} /> Colar &amp; restaurar
          </button>
          {msg && <p className={`mt-2 font-body text-xs ${msg.ok ? 'text-mint' : 'text-coral'}`}>{msg.text}</p>}
        </div>
      </div>
      <p className="mt-3 font-body text-[11px] text-faint">
        Restaurar <b>sobrescreve</b> o progresso desta máquina. A cópia mais nova vence — copie do lado em que você
        estudou por último.
      </p>
    </div>
  )
}
