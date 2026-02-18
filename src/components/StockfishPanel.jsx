import { useMemo } from 'react'
import { Chess } from 'chess.js'
import '../styles/StockfishPanel.css'

const PIECE_NAMES = {
  p: 'Pawn', n: 'Knight', b: 'Bishop', r: 'Rook', q: 'Queen', k: 'King',
}
const PIECE_SYMBOL = {
  w: { p: '♙', n: '♘', b: '♗', r: '♖', q: '♕', k: '♔' },
  b: { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚' },
}

export const LEVELS = [
  { label: 'Easy',   skill: 5,  color: 'green'  },
  { label: 'Medium', skill: 10, color: 'blue'   },
  { label: 'Hard',   skill: 15, color: 'orange' },
  { label: 'Expert', skill: 20, color: 'red'    },
]

export default function StockfishPanel({
  analysis, fen,
  rivalLevel, onLevelChange,
  rivalThinking, rivalLastMove,
}) {
  const { bestMove, score, depth, thinking } = analysis

  const responseSide = useMemo(() => {
    try { return new Chess(fen).turn() } catch { return 'w' }
  }, [fen])
  const sideLabel = responseSide === 'w' ? 'White' : 'Black'

  // Decode bestMove UCI → display info (analysis mode)
  const bestMoveInfo = useMemo(() => {
    if (rivalLevel !== null) return null          // hide in rival mode
    if (!bestMove || bestMove === '(none)' || !fen) return null
    try {
      const g    = new Chess(fen)
      const from = bestMove.slice(0, 2)
      const to   = bestMove.slice(2, 4)
      const promo = bestMove[4] ?? 'q'
      const piece = g.get(from)
      if (!piece) return null
      const sanMove = g.move({ from, to, promotion: promo })
      return {
        piece:  PIECE_NAMES[piece.type],
        symbol: PIECE_SYMBOL[piece.color][piece.type],
        color:  piece.color,
        from, to,
        san: sanMove?.san ?? bestMove,
      }
    } catch { return null }
  }, [bestMove, fen, rivalLevel])

  const scoreLabel = (() => {
    if (score === null || score === undefined) return null
    if (typeof score === 'object') return `M${Math.abs(score.mate)}`
    const p = score / 100
    return p > 0 ? `+${p.toFixed(2)}` : p.toFixed(2)
  })()

  return (
    <div className="stockfish-panel">
      <div className="panel-header">
        Stockfish
        {(thinking || rivalThinking) && <span className="thinking-dot">●</span>}
      </div>

      {/* ── Level selector ───────────────────────────────── */}
      <div className="sf-level-bar">
        {LEVELS.map(lvl => {
          const isSelected = rivalLevel?.skill === lvl.skill
          const isLocked   = rivalLevel !== null
          return (
            <button
              key={lvl.skill}
              className={[
                'sf-lvl-btn',
                `sf-lvl-${lvl.color}`,
                isSelected ? 'sf-lvl-active' : '',
                isLocked && !isSelected ? 'sf-lvl-locked' : '',
              ].join(' ')}
              onClick={() => !isLocked && onLevelChange(lvl)}
              disabled={isLocked}
              title={isLocked && !isSelected ? 'Start a New Game to change level' : lvl.label}
            >
              {lvl.label}
            </button>
          )
        })}
      </div>

      {/* ── Content area ─────────────────────────────────── */}
      <div className="sf-content">

        {/* RIVAL MODE */}
        {rivalLevel !== null && (
          rivalThinking ? (
            <div className="sf-rival-thinking">
              <span className="sf-rival-spinner">⏳</span>
              <span>Stockfish is thinking…</span>
            </div>
          ) : rivalLastMove ? (
            <div className="sf-card">
              <div className="sf-side-label">
                Rival played ({rivalLevel.label})
              </div>
              <div className="sf-piece-row">
                <span
                  className="sf-symbol"
                  style={{ color: rivalLastMove.color === 'w' ? '#f0d9b5' : '#b0b8c8' }}
                >
                  {PIECE_SYMBOL[rivalLastMove.color][rivalLastMove.piece]}
                </span>
                <div className="sf-details">
                  <span className="sf-piece-name">{PIECE_NAMES[rivalLastMove.piece]}</span>
                  <span className="sf-squares">
                    <span className="sf-sq">{rivalLastMove.from}</span>
                    <span className="sf-arrow">→</span>
                    <span className="sf-sq">{rivalLastMove.to}</span>
                  </span>
                </div>
                <span className="sf-san">{rivalLastMove.san}</span>
              </div>
              {scoreLabel && (
                <div className="sf-score-row">
                  <span className="sf-score-key">Score</span>
                  <span className="sf-score-val">{scoreLabel}</span>
                  <span className="sf-depth-key">Depth</span>
                  <span className="sf-depth-val">{depth}</span>
                </div>
              )}
            </div>
          ) : (
            <span className="sf-empty">Waiting for your move…</span>
          )
        )}

        {/* ANALYSIS MODE */}
        {rivalLevel === null && (
          !bestMoveInfo ? (
            <span className="sf-empty">
              {thinking ? 'Analysing position…' : 'Pick a level above to play vs Stockfish'}
            </span>
          ) : (
            <div className="sf-card">
              <div className="sf-side-label">{sideLabel} best response</div>
              <div className="sf-piece-row">
                <span
                  className="sf-symbol"
                  style={{ color: bestMoveInfo.color === 'w' ? '#f0d9b5' : '#b0b8c8' }}
                >
                  {bestMoveInfo.symbol}
                </span>
                <div className="sf-details">
                  <span className="sf-piece-name">{bestMoveInfo.piece}</span>
                  <span className="sf-squares">
                    <span className="sf-sq">{bestMoveInfo.from}</span>
                    <span className="sf-arrow">→</span>
                    <span className="sf-sq">{bestMoveInfo.to}</span>
                  </span>
                </div>
                <span className="sf-san">{bestMoveInfo.san}</span>
              </div>
              {scoreLabel && (
                <div className="sf-score-row">
                  <span className="sf-score-key">Score</span>
                  <span className="sf-score-val">{scoreLabel}</span>
                  <span className="sf-depth-key">Depth</span>
                  <span className="sf-depth-val">{depth}</span>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  )
}
