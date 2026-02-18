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
    <div className="eval-bar-container" style={{ height }}>
      <div className="eval-bar">
        {/* Black section (top) shrinks as white gains */}
        <div className="eval-black" style={{ height: `${100 - whitePct}%` }} />
        {/* White section (bottom) grows as white gains */}
        <div className="eval-white" style={{ height: `${whitePct}%` }} />
      </div>
      <div className="eval-label">{label}</div>
    </div>
  )
}
