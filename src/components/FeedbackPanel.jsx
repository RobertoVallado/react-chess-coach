import { useEffect, useRef } from 'react'
import '../styles/FeedbackPanel.css'

function evalLabel(e) {
  if (e === null || e === undefined) return '—'
  if (typeof e === 'object') return `M${Math.abs(e.mate)}`
  return e >= 0 ? `+${e.toFixed(2)}` : `${e.toFixed(2)}`
}

function EntryCard({ entry }) {
  return (
    <div className="feedback-line">
      <span className="feedback-prompt">&gt;</span>
      <div className="fb-card">
        <div className="fb-move-row">
          <span className="fb-move">{entry.lastMove}</span>
          <span className="fb-color">[{entry.playerColor}]</span>
        </div>
        <div className="fb-detail-row">
          <span className="fb-key">eval</span>
          <span className="fb-eval">{evalLabel(entry.eval)}</span>
          {entry.bestMove && (
            <>
              <span className="fb-key">best</span>
              <span className="fb-best">{entry.bestMove}</span>
            </>
          )}
        </div>
      </div>
    </div>
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
        {entries.map((entry, i) => (
          <EntryCard key={i} entry={entry} />
        ))}
        <div ref={bottomRef} />
      </div>
        {/* Maintenance Block */}
        <section className="maintenance-section">
          <div className="maintenance-card">
            <h2>Under maintenance 🚧</h2>
            <p>Waiting for OLLAMA Feedback implementation</p>
          </div>
        </section>
    </div>
  )
}
