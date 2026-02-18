import { useEffect, useRef } from 'react'

export default function MoveHistory({ moves }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [moves])

  // Group flat move list into pairs: [[w1, b1], [w2, b2], ...]
  const pairs = []
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push([moves[i], moves[i + 1] ?? null])
  }

  return (
    <div className="history-panel">
      <div className="panel-header">Move History</div>
      <div className="history-list">
        {pairs.length === 0 && (
          <span className="history-empty">No moves yet</span>
        )}
        {pairs.map(([white, black], idx) => (
          <div key={idx} className="move-row">
            <span className="move-num">{idx + 1}.</span>
            <span className="move-san white-move">{white?.san ?? ''}</span>
            <span className="move-san black-move">{black?.san ?? ''}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
