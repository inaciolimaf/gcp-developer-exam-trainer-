// Calm paper backdrop. Deliberately static: the reading surface must not
// move under the text. All the energy in this app lives in the cards.
export default function Background() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-canvas">
      {/* cool wash behind the header so the sticky bar has something to sit on */}
      <div className="absolute inset-x-0 top-0 h-[420px] bg-[linear-gradient(180deg,#E3EDFB_0%,rgba(238,242,248,0)_100%)]" />
      {/* faint dot grid, fading out before it reaches the content column */}
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage: 'radial-gradient(#C6D2E4 1px, transparent 1px)',
          backgroundSize: '26px 26px',
          maskImage: 'radial-gradient(ellipse 90% 60% at 50% 0%, #000 10%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 60% at 50% 0%, #000 10%, transparent 75%)',
        }}
      />
    </div>
  )
}
