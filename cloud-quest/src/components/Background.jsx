// Dark aurora backdrop: drifting neon glows over a faint grid. Pure decoration.
const GLOWS = [
  { c: 'rgba(34,211,238,0.55)', s: 520, top: '-12%', left: '-8%', a: 'animate-drift' },
  { c: 'rgba(139,92,246,0.55)', s: 560, top: '30%', left: '70%', a: 'animate-float' },
  { c: 'rgba(244,114,182,0.4)', s: 420, top: '72%', left: '8%', a: 'animate-drift' },
  { c: 'rgba(52,211,153,0.32)', s: 360, top: '58%', left: '55%', a: 'animate-float' },
]

export default function Background() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-base">
      {/* faint grid */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
          backgroundSize: '52px 52px',
          maskImage: 'radial-gradient(ellipse 80% 70% at 50% 40%, #000 40%, transparent 100%)',
        }}
      />
      {/* neon glows */}
      {GLOWS.map((g, i) => (
        <div
          key={i}
          className={`absolute rounded-full blur-[100px] ${g.a}`}
          style={{
            width: g.s,
            height: g.s,
            top: g.top,
            left: g.left,
            background: g.c,
            animationDelay: `${i * 1.3}s`,
          }}
        />
      ))}
      {/* vignette to keep edges deep */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.55))]" />
    </div>
  )
}
