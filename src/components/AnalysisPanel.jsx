import { useMemo } from 'react'
import { Chess } from 'chess.js'
import '../styles/AnalysisPanel.css'

// Convert an array of UCI moves (from the current FEN) into SAN notation
function pvToSan(fen, uciMoves) {
  const g = new Chess(fen)
  const san = []
  for (const uci of uciMoves) {
    try {
      const m = g.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] ?? 'q' })
      if (!m) break
      san.push(m.san)
    } catch {
      break
    }
  }
  return san
}

function depthQuality(depth) {
  if (depth === 0)  return { label: 'Waiting',   pct: 0,   color: '#2e3a55' }
  if (depth <= 5)   return { label: 'Surface',   pct: 12,  color: '#8a6a2e' }
  if (depth <= 10)  return { label: 'Shallow',   pct: 30,  color: '#8a7a2e' }
  if (depth <= 15)  return { label: 'Standard',  pct: 55,  color: '#4e8a4e' }
  if (depth <= 19)  return { label: 'Deep',      pct: 76,  color: '#2e7a8a' }
  if (depth <= 22)  return { label: 'Very Deep', pct: 90,  color: '#4e6aff' }
  return               { label: 'Extreme',   pct: 100, color: '#a050ff' }
}

function depthExplanation(depth) {
  const halfMoves = depth
  const fullMoves = Math.ceil(depth / 2)

  if (depth === 0) return 'Engine is initialising or waiting for a move.'
  if (depth <= 5)
    return `At depth ${depth} (${fullMoves} full move${fullMoves > 1 ? 's' : ''} ahead) the engine catches only the most obvious immediate tactics. Useful for quick blunder checks.`
  if (depth <= 10)
    return `Depth ${depth} means Stockfish is looking ${halfMoves} half-moves (≈${fullMoves} full moves) ahead. Short tactical combinations — forks, pins, and simple exchanges — are reliably found here.`
  if (depth <= 15)
    return `Depth ${depth} (${halfMoves} half-moves ahead) is where solid tactical analysis begins. Most one-move threats and two-move combinations are clearly visible to the engine.`
  if (depth <= 19)
    return `At depth ${depth} Stockfish searches ${halfMoves} half-moves ahead. It is now evaluating multi-piece combinations, sacrifices, and medium-horizon strategic plans with high confidence.`
  if (depth <= 22)
    return `Depth ${depth} — ${halfMoves} half-moves of full tree search. Analysis at this level uncovers deep combinations that humans rarely see over the board. Evaluations are highly reliable.`
  return `Depth ${depth} is extreme. Stockfish is exploring ${halfMoves} half-moves ahead, far beyond human calculation. At this depth the principal variation reflects near-optimal play for both sides.`
}

function scoreExplanation(score) {
  if (score === null || score === undefined) return null
  if (typeof score === 'object') {
    return score.mate > 0
      ? `White has a forced checkmate in ${Math.abs(score.mate)} move${Math.abs(score.mate) > 1 ? 's' : ''}.`
      : `Black has a forced checkmate in ${Math.abs(score.mate)} move${Math.abs(score.mate) > 1 ? 's' : ''}.`
  }
  const pawns = score / 100
  const abs   = Math.abs(pawns)
  const side  = score > 0 ? 'White' : 'Black'
  if (abs < 0.2) return 'The position is equal — neither side has a meaningful advantage.'
  if (abs < 0.5) return `${side} has a very slight edge (+${abs.toFixed(2)} pawns). Both sides have good practical chances.`
  if (abs < 1.0) return `${side} holds a small advantage (+${abs.toFixed(2)} pawns). Precise play is needed to convert.`
  if (abs < 2.0) return `${side} is clearly better (+${abs.toFixed(2)} pawns). This advantage is equivalent to roughly one minor piece.`
  if (abs < 4.0) return `${side} is winning (+${abs.toFixed(2)} pawns). A decisive material or positional edge exists.`
  return `${side} has a dominant advantage (+${abs.toFixed(2)} pawns). The game is effectively decided with best play.`
}

export default function AnalysisPanel({ analysis, fen }) {
  const { depth, score, pv, thinking } = analysis
  const quality = depthQuality(depth)

  const sanLine = useMemo(() => {
    if (!pv?.length || !fen) return []
    return pvToSan(fen, pv.slice(0, 6))
  }, [pv, fen])

  const scoreText  = scoreExplanation(score)
  const depthText  = depthExplanation(depth)

  const scoreLabel = (() => {
    if (score === null || score === undefined) return '—'
    if (typeof score === 'object') return `M${Math.abs(score.mate)}`
    const p = score / 100
    return p > 0 ? `+${p.toFixed(2)}` : p.toFixed(2)
  })()

  return (
    <div className="analysis-side-panel">
      <div className="panel-header">
        Analysis {thinking && <span className="thinking-dot">●</span>}
      </div>

      <div className="analysis-side-content">
        {/* Depth block */}
        <div className="as-block">
          <div className="as-row">
            <span className="as-label">Depth</span>
            <span className="as-value" style={{ color: quality.color }}>
              {depth > 0 ? depth : '—'}&nbsp;
              <span className="as-tag" style={{ borderColor: quality.color, color: quality.color }}>
                {quality.label}
              </span>
            </span>
          </div>
          <div className="as-progress-track">
            <div
              className="as-progress-fill"
              style={{ width: `${quality.pct}%`, background: quality.color }}
            />
          </div>
          <p className="as-explain">{depthText}</p>
        </div>

        {/* Score block */}
        <div className="as-block">
          <div className="as-row">
            <span className="as-label">Score</span>
            <span className="as-value score-value">{scoreLabel}</span>
          </div>
          {scoreText && <p className="as-explain">{scoreText}</p>}
        </div>

        {/* Best line block */}
        {sanLine.length > 0 && (
          <div className="as-block">
            <div className="as-label" style={{ marginBottom: 4 }}>Best line</div>
            <div className="as-pv">
              {sanLine.map((san, i) => (
                <span key={i} className={i % 2 === 0 ? 'pv-white' : 'pv-black'}>
                  {i % 2 === 0 && <span className="pv-num">{Math.floor(i / 2) + 1}.</span>}
                  {san}{' '}
                </span>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
