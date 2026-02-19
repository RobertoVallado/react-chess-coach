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
import './App.css'

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

function describeMove(move, isCheck, isCheckmate) {
  const color = move.color === 'w' ? 'White' : 'Black'
  const piece = PIECE_NAMES[move.piece]
  let desc

  if (move.flags.includes('k')) {
    desc = `${color} castles kingside`
  } else if (move.flags.includes('q') && move.piece === 'k') {
    desc = `${color} castles queenside`
  } else if (move.flags.includes('p')) {
    const promoted = PIECE_NAMES[move.promotion]
    desc = move.flags.includes('c')
      ? `${color}'s Pawn captures and promotes to ${promoted} on ${move.to}`
      : `${color}'s Pawn advances to ${move.to} and promotes to ${promoted}`
  } else if (move.flags.includes('e')) {
    desc = `${color}'s Pawn captures en passant on ${move.to}`
  } else if (move.flags.includes('c')) {
    const captured = PIECE_NAMES[move.captured]
    desc = `${color}'s ${piece} captures the ${captured} on ${move.to}`
  } else if (move.flags.includes('b')) {
    desc = `${color}'s Pawn advances two squares to ${move.to}`
  } else {
    desc = `${color}'s ${piece} moves from ${move.from} to ${move.to}`
  }

  if (isCheckmate) desc += ' — Checkmate!'
  else if (isCheck) desc += ' — Check!'
  return desc
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
  const [rivalLevel, setRivalLevel]       = useState(LEVELS[0]) // default Easy
  const [rivalThinking, setRivalThinking] = useState(false)
  const [rivalLastMove, setRivalLastMove] = useState(null)   // last move Stockfish played
  const [rivalAnimating, setRivalAnimating] = useState(false) // true while rival piece animates

  const rivalTriggerRef = useRef(false) // guard against double-firing the rival effect

  const { analysis, ready, analyze, playRivalMove } = useStockfish()

  const RIVAL_ANIM_MS = 600 // duration of the rival piece slide animation

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

    // Clear the animation flag after the slide finishes
    setTimeout(() => setRivalAnimating(false), RIVAL_ANIM_MS + 50)
  }, [])

  // ── Trigger rival move when it's Stockfish's turn ───────────
  useEffect(() => {
    if (!rivalLevel || !ready || game.isGameOver()) return
    const sfColor = playerColor === 'white' ? 'b' : 'w'
    if (game.turn() !== sfColor) return
    if (rivalTriggerRef.current) return  // already triggered

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
      if (game.turn() === sfColor) return // Stockfish will play, skip analysis
    }
    analyze(game.fen())
  }, [game, analyze, rivalLevel, playerColor])

  // ── Player piece drop ────────────────────────────────────────
  const onPieceDrop = useCallback((sourceSquare, targetSquare, piece) => {
    if (rivalThinking) return false // board locked while rival thinks

    // Always restrict to the player's own color
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
    // fetch('/analyze-api', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(movePayload) })
    console.log('[analyze-api] payload:', movePayload)

    setFeedback(prev => [...prev, movePayload])

    setRivalLastMove(null) // clear rival's last shown move on player's turn
    return true
  }, [game, rivalThinking, playerColor, analysis])

  // ── Add rival moves to the narrator/feedback feed ────────────
  useEffect(() => {
    if (!rivalLastMove) return
    const rivalColor = playerColor === 'white' ? 'black' : 'white'
    const sc = analysis.score
    const evalScore = sc === null || sc === undefined ? null
      : typeof sc === 'object' ? sc : sc / 100
    // setFeedback(prev => [...prev, {
    //   fen:         game.fen(),
    //   lastMove:    rivalLastMove.san,
    //   eval:        evalScore,
    //   bestMove:    null,
    //   playerColor: rivalColor,
    //   isRival:     true,
    // }])
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
    setRivalLevel(null)        // unlock level buttons for the new game
    setGame(new Chess())
    setMoves([])
    setFeedback([])
    setRivalLastMove(null)
    setRivalThinking(false)
    setShowColorPicker(false)
  }

  // ── Level change resets game if rival mode is toggled ────────
  const handleLevelChange = (level) => {
    rivalTriggerRef.current = false
    setRivalLevel(level)
    setRivalLastMove(null)
    setRivalThinking(false)
    // Reset to a fresh game whenever mode changes
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
    // In rival mode, highlight Stockfish's last move (orange) instead of best suggestion
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
    if (!ready)              return 'Engine loading…'
    if (thinking && depth === 0) return 'Analysing…'
    if (score === null)      return '—'
    if (typeof score === 'object') return `Mate in ${Math.abs(score.mate)}`
    const pawns = (score / 100).toFixed(2)
    return score > 0 ? `+${pawns}` : `${pawns}`
  })()

  return (
    <div className="app">
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

      <div className="main-content">
        <div className="board-panel">
          <div className="board-status">
            <span className={`status-text ${rivalThinking ? 'status-thinking' : ''}`}>{status}</span>
            <button className="reset-btn" onClick={() => setShowColorPicker(true)}>New Game</button>
          </div>

          <div className="board-with-eval">
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

          <div className="analysis-row">
            <span className="analysis-chip">
              {analysis.thinking ? '⚡' : '✓'} Depth&nbsp;<strong>{analysis.depth}</strong>
            </span>
            <span className="analysis-chip score-chip">{scoreDisplay}</span>
            {!rivalLevel && bestMoveSan && (
              <span className="analysis-chip best-chip">
                Best&nbsp;<strong>{bestMoveSan}</strong>
              </span>
            )}
            {rivalLevel && (
              <span className="analysis-chip rival-chip">
                vs&nbsp;<strong>{rivalLevel.label}</strong>
              </span>
            )}
          </div>
        </div>

        <div className="mobile-tabs">
          <button
            className={`mobile-tab ${activeTab === 'history' ? 'mobile-tab-active' : ''}`}
            onClick={() => setActiveTab('history')}
          >History</button>
          <button
            className={`mobile-tab ${activeTab === 'analysis' ? 'mobile-tab-active' : ''}`}
            onClick={() => setActiveTab('analysis')}
          >Analysis</button>
        </div>

        <div className={`history-column${activeTab !== 'history' ? ' mobile-hidden' : ''}`}>
          <MoveHistory moves={moves} />
          <AnalysisPanel analysis={analysis} fen={game.fen()} />
          <WhyDepthMattersPanel />
        </div>

        <div className={`feedback-column${activeTab !== 'analysis' ? ' mobile-hidden' : ''}`}>
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
