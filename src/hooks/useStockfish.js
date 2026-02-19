import { useEffect, useRef, useState, useCallback } from 'react'

/**
 * State machine modes:
 *   'idle'     — engine is not searching
 *   'analysis' — running `go depth 22` for continuous analysis
 *   'rival'    — running `go movetime N` for the bot's move
 *   'stopping' — `stop` was sent; waiting for the bestmove that flushes it
 *
 * Transitions are driven entirely by the `bestmove` line from the engine.
 * We never rely on `readyok` to sequence commands — bestmove is the gate.
 */
export function useStockfish() {
  const workerRef          = useRef(null)
  const modeRef            = useRef('idle')        // current engine mode
  const pendingCmdRef      = useRef(null)          // cmd to launch after stop flushes
  const rivalCallbackRef   = useRef(null)          // callback for rival bestmove

  const [ready, setReady] = useState(false)
  const [analysis, setAnalysis] = useState({
    score:    null,
    bestMove: null,
    depth:    0,
    pv:       [],
    thinking: false,
  })

  useEffect(() => {
    let worker
    try {
      worker = new Worker(`${import.meta.env.BASE_URL}stockfish.js`)
    } catch (err) {
      console.error('[Stockfish] Failed to create worker:', err)
      return
    }
    workerRef.current = worker

    // ── Launch a queued command after a flush ────────────────────
    const launchCmd = (cmd) => {
      if (!cmd) {
        modeRef.current = 'idle'
        return
      }
      pendingCmdRef.current = null

      if (cmd.type === 'rival') {
        modeRef.current            = 'rival'
        rivalCallbackRef.current   = cmd.callback
        worker.postMessage(`setoption name Skill Level value ${cmd.skillLevel}`)
        worker.postMessage(`position fen ${cmd.fen}`)
        worker.postMessage(`go movetime ${cmd.movetime}`)
      } else {
        // analysis
        modeRef.current = 'analysis'
        setAnalysis(prev => ({ ...prev, thinking: true, depth: 0, bestMove: null, pv: [] }))
        worker.postMessage('setoption name Skill Level value 20')
        worker.postMessage(`position fen ${cmd.fen}`)
        worker.postMessage('go depth 22')
      }
    }

    worker.onmessage = (e) => {
      const line = typeof e.data === 'string' ? e.data : String(e.data)

      // ── Engine initialisation ────────────────────────────────
      if (line === 'uciok') {
        worker.postMessage('setoption name MultiPV value 1')
        worker.postMessage('isready')
        return
      }

      if (line === 'readyok') {
        setReady(true)
        return
      }

      // ── Analysis info lines ──────────────────────────────────
      if (line.startsWith('info') && line.includes('score')) {
        if (modeRef.current !== 'analysis') return

        const depthM = line.match(/depth (\d+)/)
        const cpM    = line.match(/score cp (-?\d+)/)
        const mateM  = line.match(/score mate (-?\d+)/)
        const pvM    = line.match(/ pv (.+)$/)
        if (!depthM) return

        setAnalysis(prev => ({
          ...prev,
          thinking: true,
          depth:    parseInt(depthM[1]),
          score:    cpM    ? parseInt(cpM[1])
                  : mateM  ? { mate: parseInt(mateM[1]) }
                  : prev.score,
          pv: pvM ? pvM[1].trim().split(' ') : prev.pv,
        }))
        return
      }

      // ── bestmove — the state-machine transition point ────────
      if (line.startsWith('bestmove')) {
        const m    = line.match(/bestmove (\S+)/)
        const move = m ? m[1] : null
        const mode = modeRef.current

        if (mode === 'stopping') {
          // The `stop` we sent has fully flushed — now launch the pending cmd
          launchCmd(pendingCmdRef.current)

        } else if (mode === 'rival') {
          // This is the genuine bot move
          const cb = rivalCallbackRef.current
          rivalCallbackRef.current = null
          modeRef.current = 'idle'
          // If a new command was already queued (e.g. analysis), launch it
          if (pendingCmdRef.current) {
            launchCmd(pendingCmdRef.current)
          }
          cb?.(move)

        } else if (mode === 'analysis') {
          modeRef.current = 'idle'
          setAnalysis(prev => ({
            ...prev,
            thinking: false,
            bestMove: move ?? prev.bestMove,
          }))
          // If a new analysis or rival cmd arrived while we were finishing
          if (pendingCmdRef.current) {
            launchCmd(pendingCmdRef.current)
          }
        }
      }
    }

    worker.onerror = (err) => console.error('[Stockfish] Worker error:', err)
    worker.postMessage('uci')

    return () => {
      worker.postMessage('quit')
      worker.terminate()
    }
  }, [])

  // ── Continuous analysis at full strength ──────────────────────
  const analyze = useCallback((fen) => {
    const worker = workerRef.current
    if (!worker || !ready) return

    const mode = modeRef.current

    if (mode === 'idle') {
      // Engine is free — start immediately
      modeRef.current = 'analysis'
      setAnalysis(prev => ({ ...prev, thinking: true, depth: 0, bestMove: null, pv: [] }))
      worker.postMessage('setoption name Skill Level value 20')
      worker.postMessage(`position fen ${fen}`)
      worker.postMessage('go depth 22')

    } else if (mode === 'rival') {
      // Don't interrupt a bot search — queue analysis for after bot move
      pendingCmdRef.current = { type: 'analysis', fen }

    } else if (mode === 'stopping' && pendingCmdRef.current?.type === 'rival') {
      // A rival command is queued to run after the current stop flushes — don't overwrite it
      return

    } else {
      // 'analysis' or 'stopping' (with analysis pending) — queue new analysis
      pendingCmdRef.current = { type: 'analysis', fen }
      if (mode === 'analysis') {
        modeRef.current = 'stopping'
        worker.postMessage('stop')
      }
      // If already 'stopping', pending cmd will be picked up when bestmove arrives
    }
  }, [ready])

  // ── One-shot rival move ───────────────────────────────────────
  const playRivalMove = useCallback((fen, callback, skillLevel = 20) => {
    const worker = workerRef.current
    if (!worker || !ready) return

    const movetime =
      skillLevel <= 2  ? 300  :
      skillLevel <= 6  ? 500  :
      skillLevel <= 12 ? 800  :
      skillLevel <= 17 ? 1200 : 1800

    // Discard any stale rival callback — the new one takes priority
    rivalCallbackRef.current = null

    const rivalCmd = { type: 'rival', fen, callback, skillLevel, movetime }
    const mode     = modeRef.current

    if (mode === 'idle') {
      // Engine is free — start immediately
      launchCmdDirect(rivalCmd, worker)

    } else {
      // Queue the rival command and stop whatever is running
      pendingCmdRef.current = rivalCmd
      if (mode !== 'stopping') {
        modeRef.current = 'stopping'
        worker.postMessage('stop')
      }
    }

    function launchCmdDirect(cmd, w) {
      pendingCmdRef.current    = null
      modeRef.current          = 'rival'
      rivalCallbackRef.current = cmd.callback
      w.postMessage(`setoption name Skill Level value ${cmd.skillLevel}`)
      w.postMessage(`position fen ${cmd.fen}`)
      w.postMessage(`go movetime ${cmd.movetime}`)
    }
  }, [ready])

  const stop = useCallback(() => {
    pendingCmdRef.current    = null
    rivalCallbackRef.current = null
    const mode = modeRef.current
    if (mode === 'analysis' || mode === 'rival') {
      modeRef.current = 'stopping'
      workerRef.current?.postMessage('stop')
    }
  }, [])

  return { analysis, ready, analyze, playRivalMove, stop }
}
