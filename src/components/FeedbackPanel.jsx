import { useState, useEffect, useRef } from 'react'

const SPEED_MS = 30 // ms per character

function TypingText({ text }) {
  const [count, setCount] = useState(0)
  const done = count >= text.length

  // Reset whenever a new line is passed in
  useEffect(() => {
    setCount(0)
  }, [text])

  // Advance one character at a time
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

export default function FeedbackPanel({ entries }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [entries])

  return (
    <div className="feedback-panel">
      <div className="panel-header">Feedback</div>
      <div className="feedback-content">
        {entries.length === 0 && (
          <span className="feedback-empty">Waiting for moves...</span>
        )}
        {entries.map((text, i) => (
          <div key={i} className="feedback-line">
            <span className="feedback-prompt">&gt;</span>
            {i === entries.length - 1
              ? <TypingText text={text} />
              : <span>{text}</span>
            }
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
