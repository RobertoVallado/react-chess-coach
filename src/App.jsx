import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { Chess } from 'chess.js'
import ChessBoard from './components/ChessBoard'
import MoveHistory from './components/MoveHistory'
import FeedbackPanel from './components/FeedbackPanel'
import StockfishPanel, { LEVELS } from './components/StockfishPanel'
import EvalBar from './components/EvalBar'
import AnalysisPanel from './components/AnalysisPanel'
import WhyDepthMattersPanel from './components/WhyDepthMattersPanel'
import ColorPickerModal from './components/ColorPickerModal'
import NarratorPanel from './components/NarratorPanel'
import Header from './components/Header'
import Footer from './components/Footer'
import { useStockfish } from './hooks/useStockfish'

function useBoardSize() {
  const [size, setSize] = useState(() => {
    const isMobile = window.innerWidth < 768
    return isMobile
      ? Math.min(window.innerWidth - 24, Math.floor(window.innerHeight * 0.55))
      : Math.min(720, window.innerHeight - 210)
  })
  useEffect(() => {
    function update() {
      const isMobile = window.innerWidth < 768
      setSize(isMobile
        ? Math.min(window.innerWidth - 24, Math.floor(window.innerHeight * 0.55))
        : Math.min(720, window.innerHeight - 210)
      )
    }
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return size
}

const PIECE_NAMES = {
  p: 'Pawn', n: 'Knight', b: 'Bishop', r: 'Rook', q: 'Queen', k: 'King',
}

function uciToSan(fen, uci) {
  if (!uci || uci === '(none)') return null
  try {
    const g = new Chess(fen)
    const m = g.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] ?? 'q' })
    return m?.san ?? uci
  } catch { return uci }
}

export default function App() {
  const BOARD_SIZE = useBoardSize()
  const [game, setGame]               = useState(new Chess())
  const [moves, setMoves]             = useState([])
  const [feedback, setFeedback]       = useState([])
  const [isLoggedIn, setIsLoggedIn]   = useState(false)
  const [playerColor, setPlayerColor] = useState('white')
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [activeTab, setActiveTab]     = useState('history')

  // Rival (vs Stockfish) state
  const [rivalLevel, setRivalLevel]       = useState(LEVELS[0])
  const [rivalThinking, setRivalThinking] = useState(false)
  const [rivalLastMove, setRivalLastMove] = useState(null)
  const [rivalAnimating, setRivalAnimating] = useState(false)

  const rivalTriggerRef = useRef(false)

  const { analysis, ready, analyze, playRivalMove } = useStockfish()

  const RIVAL_ANIM_MS = 600

  // ── Apply rival move ────────────────────────────────────────
  const handleRivalMove = useCallback((uciMove, fromFen) => {
    if (!uciMove || uciMove === '(none)') { setRivalThinking(false); return }
    const g = new Chess(fromFen)
    let move
    try {
      move = g.move({ from: uciMove.slice(0, 2), to: uciMove.slice(2, 4), promotion: uciMove[4] ?? 'q' })
    } catch { setRivalThinking(false); return }
    if (!move) { setRivalThinking(false); return }

    setRivalAnimating(true)
    setGame(g)
    setMoves(prev => [...prev, { san: move.san, fen: g.fen() }])
    setRivalLastMove({ san: move.san, from: move.from, to: move.to, piece: move.piece, color: move.color })
    setRivalThinking(false)
    rivalTriggerRef.current = false

    setTimeout(() => setRivalAnimating(false), RIVAL_ANIM_MS + 50)
  }, [])

  // ── Trigger rival move when it's Stockfish's turn ───────────
  useEffect(() => {
    if (!rivalLevel || !ready || game.isGameOver()) return
    const sfColor = playerColor === 'white' ? 'b' : 'w'
    if (game.turn() !== sfColor) return
    if (rivalTriggerRef.current) return

    rivalTriggerRef.current = true
    setRivalThinking(true)
    const fen = game.fen()
    playRivalMove(fen, (uciMove) => handleRivalMove(uciMove, fen), rivalLevel.skill)
  }, [game, rivalLevel, playerColor, ready, playRivalMove, handleRivalMove])

  // ── Analysis — only when it's the player's turn (or no rival) ──
  useEffect(() => {
    if (game.isGameOver()) return
    if (rivalLevel) {
      const sfColor = playerColor === 'white' ? 'b' : 'w'
      if (game.turn() === sfColor) return
    }
    analyze(game.fen())
  }, [game, analyze, rivalLevel, playerColor])

  // ── Player piece drop ────────────────────────────────────────
  const onPieceDrop = useCallback((sourceSquare, targetSquare, piece) => {
    if (rivalThinking) return false

    const droppedColor = piece?.[0] === 'w' ? 'white' : 'black'
    if (droppedColor !== playerColor) return false

    const gameCopy = new Chess(game.fen())
    let move = null
    try {
      move = gameCopy.move({ from: sourceSquare, to: targetSquare, promotion: 'q' })
    } catch { return false }
    if (!move) return false

    setGame(gameCopy)
    setMoves(prev => [...prev, { san: move.san, fen: gameCopy.fen() }])

    const evalScore = analysis.score === null || analysis.score === undefined
      ? null
      : typeof analysis.score === 'object'
        ? analysis.score
        : analysis.score / 100

    const movePayload = {
      fen:         gameCopy.fen(),
      lastMove:    move.san,
      eval:        evalScore,
      bestMove:    uciToSan(game.fen(), analysis.bestMove),
      playerColor,
      isRival:     false,
    }

    // TODO: replace with real API call
    console.log('[analyze-api] payload:', movePayload)

    setFeedback(prev => [...prev, movePayload])
    setRivalLastMove(null)
    return true
  }, [game, rivalThinking, playerColor, analysis])

  // ── Add rival moves to the narrator/feedback feed ────────────
  useEffect(() => {
    if (!rivalLastMove) return
    // eslint-disable-next-line no-unused-vars
    const rivalColor = playerColor === 'white' ? 'black' : 'white'
    // setFeedback(prev => [...prev, { ... }])
  }, [rivalLastMove]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Prevent picking up rival pieces ──────────────────────────
  const isDraggablePiece = useCallback(({ piece }) => {
    const pieceColor = piece[0] === 'w' ? 'white' : 'black'
    return pieceColor === playerColor
  }, [playerColor])

  // ── New game ─────────────────────────────────────────────────
  const handleNewGame = (color) => {
    rivalTriggerRef.current = false
    setPlayerColor(color)
    setRivalLevel(null)
    setGame(new Chess())
    setMoves([])
    setFeedback([])
    setRivalLastMove(null)
    setRivalThinking(false)
    setShowColorPicker(false)
  }

  // ── Level change resets game ────────────────────────────────
  const handleLevelChange = (level) => {
    rivalTriggerRef.current = false
    setRivalLevel(level)
    setRivalLastMove(null)
    setRivalThinking(false)
    setGame(new Chess())
    setMoves([])
    setFeedback([])
  }

  const status = (() => {
    if (game.isCheckmate()) return `Checkmate — ${game.turn() === 'w' ? 'Black' : 'White'} wins`
    if (game.isDraw())      return 'Draw'
    if (rivalThinking)      return 'Stockfish is thinking…'
    if (game.isCheck())     return `${game.turn() === 'w' ? 'White' : 'Black'} is in check`
    return `${game.turn() === 'w' ? 'White' : 'Black'} to move`
  })()

  // ── Board highlights ─────────────────────────────────────────
  const bestMoveSan = uciToSan(game.fen(), analysis.bestMove)
  const customSquareStyles = useMemo(() => {
    if (rivalLevel && rivalLastMove) {
      return {
        [rivalLastMove.from]: { backgroundColor: 'rgba(255, 165, 60, 0.4)' },
        [rivalLastMove.to]:   { backgroundColor: 'rgba(255, 165, 60, 0.65)' },
      }
    }
    if (!analysis.bestMove || analysis.bestMove === '(none)') return {}
    const from = analysis.bestMove.slice(0, 2)
    const to   = analysis.bestMove.slice(2, 4)
    return {
      [from]: { backgroundColor: 'rgba(100, 220, 100, 0.45)' },
      [to]:   { backgroundColor: 'rgba(100, 220, 100, 0.65)' },
    }
  }, [analysis.bestMove, rivalLevel, rivalLastMove])

  const scoreDisplay = (() => {
    const { score, depth, thinking } = analysis
    if (!ready)                  return 'Engine loading…'
    if (thinking && depth === 0) return 'Analysing…'
    if (score === null)          return '—'
    if (typeof score === 'object') return `Mate in ${Math.abs(score.mate)}`
    const pawns = (score / 100).toFixed(2)
    return score > 0 ? `+${pawns}` : `${pawns}`
  })()

  return (
    <div className="flex flex-col min-h-screen md:h-screen bg-app-bg text-txt-primary overflow-y-auto md:overflow-hidden">
      <Header
        isLoggedIn={isLoggedIn}
        onToggleLogin={() => setIsLoggedIn(v => !v)}
        onSettings={() => alert('Settings coming soon')}
      />

      {showColorPicker && (
        <ColorPickerModal
          onSelect={handleNewGame}
          onCancel={() => setShowColorPicker(false)}
        />
      )}

      <div className="flex flex-1 flex-col md:flex-row overflow-visible md:overflow-hidden">
        {/* Board panel */}
        <div className="flex flex-col items-center md:items-start p-3 md:p-[14px_16px] gap-2 shrink-0">
          {/* Status + New Game */}
          <div className="flex items-center justify-between w-full">
            <span className={`font-lato text-[0.85rem] tracking-[0.05em] ${rivalThinking ? 'text-orange animate-blink' : 'text-blue'}`}>
              {status}
            </span>
            <button
              className="bg-btn-bg text-blue border border-border-light rounded px-3 py-1 font-lato text-[0.8rem] cursor-pointer hover:bg-btn-hover transition-colors"
              onClick={() => setShowColorPicker(true)}
            >
              New Game
            </button>
          </div>

          {/* Board + eval bar */}
          <div className="flex items-stretch gap-2">
            <EvalBar score={analysis.score} height={BOARD_SIZE} />
            <ChessBoard
              position={game.fen()}
              onPieceDrop={onPieceDrop}
              boardWidth={BOARD_SIZE}
              customSquareStyles={customSquareStyles}
              boardOrientation={playerColor}
              arePiecesDraggable={!rivalThinking && !rivalAnimating && !game.isGameOver()}
              isDraggablePiece={isDraggablePiece}
              animationDuration={rivalAnimating ? RIVAL_ANIM_MS : 150}
            />
          </div>

          {/* Analysis chips */}
          <div className="flex items-center gap-2 w-full flex-wrap">
            <span className="font-lato text-[0.75rem] px-[10px] py-[3px] rounded-[3px] bg-chip-bg border border-border-mid text-txt-secondary whitespace-nowrap">
              {analysis.thinking ? '⚡' : '✓'} Depth&nbsp;<strong>{analysis.depth}</strong>
            </span>
            <span className="font-lato text-[0.75rem] px-[10px] py-[3px] rounded-[3px] bg-chip-bg border border-blue-dim text-blue whitespace-nowrap">
              {scoreDisplay}
            </span>
            {!rivalLevel && bestMoveSan && (
              <span className="font-lato text-[0.75rem] px-[10px] py-[3px] rounded-[3px] bg-chip-bg border border-green-dim text-green whitespace-nowrap">
                Best&nbsp;<strong>{bestMoveSan}</strong>
              </span>
            )}
            {rivalLevel && (
              <span className="font-lato text-[0.75rem] px-[10px] py-[3px] rounded-[3px] bg-chip-bg border border-orange-dim text-orange whitespace-nowrap">
                vs&nbsp;<strong>{rivalLevel.label}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Mobile tab bar */}
        <div className="flex md:hidden bg-panel-7 border-y border-border-dim shrink-0">
          <button
            className={`flex-1 py-[11px] bg-transparent border-none border-b-2 font-lato text-[0.75rem] tracking-[0.12em] uppercase cursor-pointer transition-colors ${
              activeTab === 'history'
                ? 'text-blue border-blue'
                : 'text-txt-secondary border-transparent'
            }`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
          <button
            className={`flex-1 py-[11px] bg-transparent border-none border-b-2 font-lato text-[0.75rem] tracking-[0.12em] uppercase cursor-pointer transition-colors ${
              activeTab === 'analysis'
                ? 'text-blue border-blue'
                : 'text-txt-secondary border-transparent'
            }`}
            onClick={() => setActiveTab('analysis')}
          >
            Analysis
          </button>
        </div>

        {/* History column */}
        <div className={`flex-col md:w-[307px] w-full shrink-0 border-border-dim md:border-x border-t md:border-t-0 overflow-hidden ${activeTab !== 'history' ? 'hidden md:flex' : 'flex'}`}>
          <MoveHistory moves={moves} />
          <AnalysisPanel analysis={analysis} fen={game.fen()} />
          <WhyDepthMattersPanel />
        </div>

        {/* Feedback column */}
        <div className={`flex-col flex-1 border-border-dim md:border-l border-t md:border-t-0 overflow-hidden ${activeTab !== 'analysis' ? 'hidden md:flex' : 'flex'}`}>
          <StockfishPanel
            analysis={analysis}
            fen={game.fen()}
            rivalLevel={rivalLevel}
            onLevelChange={handleLevelChange}
            rivalThinking={rivalThinking}
            rivalLastMove={rivalLastMove}
          />
          <NarratorPanel entries={feedback} />
          <FeedbackPanel entries={feedback} />
        </div>
      </div>

      <Footer />
    </div>
  )
}
