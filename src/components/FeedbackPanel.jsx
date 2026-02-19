import { useEffect, useRef } from 'react'

function evalLabel(e) {
  if (e === null || e === undefined) return '—'
  if (typeof e === 'object') return `M${Math.abs(e.mate)}`
  return e >= 0 ? `+${e.toFixed(2)}` : `${e.toFixed(2)}`
}

function EntryCard({ entry }) {
  return (
    <div className="flex gap-2 font-courier text-[0.84rem] leading-[1.7] text-green py-[1px]">
      <span className="text-[#2a5a34] shrink-0 select-none">&gt;</span>
      <div className="flex flex-col gap-[2px] font-courier">
        <div className="flex items-center gap-2">
          <span className="text-[0.88rem] font-bold text-[#e8e8e8]">{entry.lastMove}</span>
          <span className="text-[0.72rem] text-txt-secondary tracking-[0.05em]">[{entry.playerColor}]</span>
        </div>
        <div className="flex items-center gap-[6px] text-[0.75rem]">
          <span className="text-[#2e4060]">eval</span>
          <span className="text-blue">{evalLabel(entry.eval)}</span>
          {entry.bestMove && (
            <>
              <span className="text-[#2e4060]">best</span>
              <span className="text-green">{entry.bestMove}</span>
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
    <div className="flex flex-col flex-[2] bg-panel-3 overflow-hidden">
      <div className="panel-header">Feedback</div>
      <div className="flex-1 overflow-y-auto p-[12px_4px_12px_12px] scrollbar-green">
        {entries.length === 0 && (
          <span className="block font-courier text-[0.78rem] text-[#1e3a22] p-[12px_4px]">
            Waiting for moves...
          </span>
        )}
        {entries.map((entry, i) => (
          <EntryCard key={i} entry={entry} />
        ))}
        <div ref={bottomRef} />
      </div>
      {/* Maintenance Block */}
      <section className="flex justify-center my-12">
        <div className="bg-gradient-to-br from-[#f06f52] to-[#f79c6b] text-white px-8 py-4 rounded-xl text-center shadow-[0_8px_20px_rgba(0,0,0,0.15)]">
          <h2 className="text-base font-bold">Under maintenance 🚧</h2>
          <p className="text-sm mt-1">Waiting for OLLAMA Feedback implementation</p>
        </div>
      </section>
    </div>
  )
}
