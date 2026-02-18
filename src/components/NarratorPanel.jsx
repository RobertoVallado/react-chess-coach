import { useState, useEffect, useRef } from 'react'
import '../styles/FeedbackPanel.css'
import '../styles/NarratorPanel.css'

const SPEED_MS = 30

function toNarrative(entry) {
  const side = entry.playerColor === 'white' ? 'White' : 'Black'
  const evalStr = entry.eval === null || entry.eval === undefined
    ? null
    : typeof entry.eval === 'object'
      ? `Mate in ${Math.abs(entry.eval.mate)}`
      : `${entry.eval >= 0 ? '+' : ''}${entry.eval.toFixed(2)}`
  let text = `${side} played ${entry.lastMove}.`
  if (evalStr) text += ` Eval: ${evalStr}.`
  if (entry.bestMove) text += ` Best was ${entry.bestMove}.`
  return text
}

function TypingText({ text }) {
  const [count, setCount] = useState(0)
  const done = count >= text.length

  useEffect(() => {
    setCount(0)
  }, [text])

  useEffect(() => {
    if (done) return
    const timer = setTimeout(() => setCount(c => c + 1), SPEED_MS)
    return () => clearTimeout(timer)
  }, [count, done])

  return (
    <>
      {text.slice(0, count)}
      {!done && <span className="feedback-cursor">▋</span>}
    </>
  )
}

export default function NarratorPanel({ entries }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [entries])

  return (
    <div className="narrator-panel">
      <div className="panel-header">Narrator</div>
      <div className="feedback-content">
        {entries.length === 0 && (
          <span className="feedback-empty">Waiting for moves...</span>
        )}
        {entries.map((entry, i) => {
          const text = toNarrative(entry)
          return (
            <div key={i} className="feedback-line">
              <span className="feedback-prompt">&gt;</span>
              {i === entries.length - 1
                ? <TypingText text={text} />
                : <span>{text}</span>
              }
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
