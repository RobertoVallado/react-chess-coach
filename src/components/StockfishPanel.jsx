import { useMemo } from 'react'
import { Chess } from 'chess.js'

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

// Per-level Tailwind classes (base, hover, active)
const LEVEL_CLASSES = {
  green: {
    base:   'text-sf-green border-sf-green-border',
    hover:  'hover:text-sf-green-hover hover:border-[#2a7a3a] hover:bg-[#0d1e12]',
    active: 'text-sf-green-hover border-sf-green-active bg-[#0d2018]',
  },
  blue: {
    base:   'text-sf-blue border-sf-blue-border',
    hover:  'hover:text-[#5a9aff] hover:border-[#2a5aaa] hover:bg-[#0d1220]',
    active: 'text-[#7ab4ff] border-[#3a6acc] bg-[#0d1828]',
  },
  orange: {
    base:   'text-sf-orange border-sf-orange-border',
    hover:  'hover:text-orange hover:border-[#9a5a18] hover:bg-[#1a1008]',
    active: 'text-orange border-[#cc6a18] bg-[#201408]',
  },
  red: {
    base:   'text-sf-red border-sf-red-border',
    hover:  'hover:text-red-acc hover:border-[#9a2020] hover:bg-[#1a0808]',
    active: 'text-[#e05050] border-[#cc2828] bg-[#200808]',
  },
}

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
    if (rivalLevel !== null) return null
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
    <div className="flex flex-col flex-1 bg-panel-2 border-b border-border-dim overflow-hidden">
      <div className="panel-header">
        Stockfish
        {(thinking || rivalThinking) && <span className="thinking-dot">●</span>}
      </div>

      {/* Level selector */}
      <div className="flex gap-1 px-[10px] py-[6px] border-b border-border-dim bg-panel-7 shrink-0">
        {LEVELS.map(lvl => {
          const isSelected = rivalLevel?.skill === lvl.skill
          const isLocked   = rivalLevel !== null
          const lc = LEVEL_CLASSES[lvl.color]
          return (
            <button
              key={lvl.skill}
              className={[
                'flex-1 py-[5px] font-lato text-[0.62rem] tracking-[0.05em] font-bold uppercase',
                'bg-[#0d1018] rounded-[3px] cursor-pointer transition-all whitespace-nowrap border',
                lc.base,
                !isLocked ? lc.hover : '',
                isSelected ? lc.active : '',
                isLocked && !isSelected ? 'opacity-25 cursor-not-allowed' : '',
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

      {/* Content area */}
      <div className="flex-1 flex items-start p-[10px_14px] overflow-hidden">

        {/* RIVAL MODE */}
        {rivalLevel !== null && (
          rivalThinking ? (
            <div className="flex flex-col items-center justify-center gap-2 w-full font-lato text-[0.75rem] text-txt-secondary">
              <span className="text-[1.4rem] animate-spin-slow">⏳</span>
              <span>Stockfish is thinking…</span>
            </div>
          ) : rivalLastMove ? (
            <div className="flex flex-col gap-2 w-full">
              <div className="font-lato text-[0.65rem] tracking-[0.1em] uppercase text-[#3a5070]">
                Rival played ({rivalLevel.label})
              </div>
              <div className="flex items-center gap-[10px]">
                <span className="text-[2rem] leading-none shrink-0"
                      style={{ color: rivalLastMove.color === 'w' ? '#f0d9b5' : '#b0b8c8' }}>
                  {PIECE_SYMBOL[rivalLastMove.color][rivalLastMove.piece]}
                </span>
                <div className="flex flex-col gap-[2px] flex-1">
                  <span className="font-lato text-[0.8rem] text-txt-primary font-bold">
                    {PIECE_NAMES[rivalLastMove.piece]}
                  </span>
                  <span className="flex items-center gap-1 font-lato text-[0.75rem]">
                    <span className="text-blue">{rivalLastMove.from}</span>
                    <span className="text-blue-dim">→</span>
                    <span className="text-blue">{rivalLastMove.to}</span>
                  </span>
                </div>
                <span className="font-lato text-[1.1rem] font-bold text-green shrink-0">
                  {rivalLastMove.san}
                </span>
              </div>
              {scoreLabel && (
                <div className="flex items-center gap-[6px] font-lato text-[0.68rem] mt-[2px]">
                  <span className="text-[#2e4060]">Score</span>
                  <span className="text-blue mr-2">{scoreLabel}</span>
                  <span className="text-[#2e4060]">Depth</span>
                  <span className="text-txt-secondary">{depth}</span>
                </div>
              )}
            </div>
          ) : (
            <span className="font-lato text-[0.72rem] text-txt-faint text-center w-full self-center">
              Waiting for your move…
            </span>
          )
        )}

        {/* ANALYSIS MODE */}
        {rivalLevel === null && (
          !bestMoveInfo ? (
            <span className="font-lato text-[0.72rem] text-txt-faint text-center w-full self-center">
              {thinking ? 'Analysing position…' : 'Pick a level above to play vs Stockfish'}
            </span>
          ) : (
            <div className="flex flex-col gap-2 w-full">
              <div className="font-lato text-[0.65rem] tracking-[0.1em] uppercase text-[#3a5070]">
                {sideLabel} best response
              </div>
              <div className="flex items-center gap-[10px]">
                <span className="text-[2rem] leading-none shrink-0"
                      style={{ color: bestMoveInfo.color === 'w' ? '#f0d9b5' : '#b0b8c8' }}>
                  {bestMoveInfo.symbol}
                </span>
                <div className="flex flex-col gap-[2px] flex-1">
                  <span className="font-lato text-[0.8rem] text-txt-primary font-bold">
                    {bestMoveInfo.piece}
                  </span>
                  <span className="flex items-center gap-1 font-lato text-[0.75rem]">
                    <span className="text-blue">{bestMoveInfo.from}</span>
                    <span className="text-blue-dim">→</span>
                    <span className="text-blue">{bestMoveInfo.to}</span>
                  </span>
                </div>
                <span className="font-lato text-[1.1rem] font-bold text-green shrink-0">
                  {bestMoveInfo.san}
                </span>
              </div>
              {scoreLabel && (
                <div className="flex items-center gap-[6px] font-lato text-[0.68rem] mt-[2px]">
                  <span className="text-[#2e4060]">Score</span>
                  <span className="text-blue mr-2">{scoreLabel}</span>
                  <span className="text-[#2e4060]">Depth</span>
                  <span className="text-txt-secondary">{depth}</span>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  )
}
