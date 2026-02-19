import { useState, useEffect, useRef } from 'react'

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
      {!done && <span className="inline-block text-green animate-blink-fast ml-[1px]">▋</span>}
    </>
  )
}

export default function NarratorPanel({ entries }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [entries])

  return (
    <div className="flex flex-col flex-1 bg-panel-4 border-b border-border-dim overflow-hidden">
      <div className="panel-header">Narrator</div>
      <div className="flex-1 overflow-y-auto p-[12px_4px_12px_12px] scrollbar-green">
        {entries.length === 0 && (
          <span className="block font-courier text-[0.78rem] text-[#1e3a22] p-[12px_4px]">
            Waiting for moves...
          </span>
        )}
        {entries.map((entry, i) => {
          const text = toNarrative(entry)
          return (
            <div key={i} className="flex gap-2 font-courier text-[0.84rem] leading-[1.7] text-green py-[1px]">
              <span className="text-[#2a5a34] shrink-0 select-none">&gt;</span>
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
