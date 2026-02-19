// Vertical evaluation bar — white fills from the bottom, black from top.
// score: centipawns (number, white-positive) | { mate: N } | null
export default function EvalBar({ score, height }) {
  let whitePct = 50
  let label = '0.0'

  if (score !== null && score !== undefined) {
    if (typeof score === 'object') {
      whitePct = score.mate > 0 ? 97 : 3
      label = `M${Math.abs(score.mate)}`
    } else {
      const pawns   = score / 100
      const clamped = Math.max(-8, Math.min(8, pawns))
      whitePct = 50 + (clamped / 8) * 47
      label = pawns > 0 ? `+${pawns.toFixed(1)}` : pawns.toFixed(1)
    }
  }

  return (
    <div className="hidden md:flex flex-col items-center gap-1 w-[18px] shrink-0" style={{ height }}>
      <div className="flex-1 w-full rounded-[3px] overflow-hidden flex flex-col border border-border-dim">
        {/* Black section (top) shrinks as white gains */}
        <div className="bg-[#1a1a1a] shrink-0 transition-[height] duration-[600ms]"
             style={{ height: `${100 - whitePct}%` }} />
        {/* White section (bottom) grows as white gains */}
        <div className="bg-[#e8e0d0] flex-1 transition-[height] duration-[600ms]"
             style={{ height: `${whitePct}%` }} />
      </div>
      <div className="font-lato text-[0.6rem] text-blue whitespace-nowrap">{label}</div>
    </div>
  )
}
