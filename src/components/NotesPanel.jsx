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
      {!done && <span className="narrator-cursor">▋</span>}
    </>
  )
}

export default function NotesPanel({ entries }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [entries])

  return (
    <div className="notes-panel">
      <div className="panel-header">Narrator</div>
      <div className="narrator-content">
        {entries.length === 0 && (
          <span className="narrator-empty">Waiting for moves...</span>
        )}
        {entries.map((text, i) => (
          <div key={i} className="narrator-line">
            <span className="narrator-prompt">&gt;</span>
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
