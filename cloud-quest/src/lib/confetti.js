import confetti from 'canvas-confetti'

// Celebration only — these carry no meaning, so they get to be loud. Picked to
// stay legible as they fall across the light paper background.
const CANDY = ['#1A6FE0', '#16A05A', '#F2A20C', '#D6398B', '#8B3FD9', '#E8542F']

// Small celebratory pop, optionally originating from a screen point.
export function popBurst(origin) {
  const o = origin
    ? { x: origin.x / window.innerWidth, y: origin.y / window.innerHeight }
    : { x: 0.5, y: 0.6 }
  confetti({
    particleCount: 70,
    spread: 70,
    startVelocity: 38,
    origin: o,
    colors: CANDY,
    scalar: 0.95,
    ticks: 160,
  })
}

// Big finale for passing an exam or finishing the bank.
export function bigCelebration() {
  const end = Date.now() + 1400
  ;(function frame() {
    confetti({ particleCount: 6, angle: 60, spread: 60, origin: { x: 0 }, colors: CANDY })
    confetti({ particleCount: 6, angle: 120, spread: 60, origin: { x: 1 }, colors: CANDY })
    if (Date.now() < end) requestAnimationFrame(frame)
  })()
  confetti({ particleCount: 160, spread: 110, startVelocity: 45, origin: { y: 0.5 }, colors: CANDY })
}
