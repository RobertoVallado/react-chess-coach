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
    <div className="flex flex-col flex-1 bg-panel-1 border-b border-border-dim overflow-hidden">
      <div className="panel-header">Move History</div>
      <div className="flex-1 overflow-y-auto py-2 scrollbar-chess">
        {pairs.length === 0 && (
          <span className="block text-center text-txt-faint font-lato text-[0.78rem] mt-6">
            No moves yet
          </span>
        )}
        {pairs.map(([white, black], idx) => (
          <div
            key={idx}
            className={`grid grid-cols-[28px_1fr_1fr] px-[10px] py-[3px] font-lato text-[0.82rem] leading-[1.65] ${idx % 2 === 1 ? 'bg-[#111425]' : ''}`}
          >
            <span className="text-txt-secondary select-none">{idx + 1}.</span>
            <span className="text-[#e8e8e8]">{white?.san ?? ''}</span>
            <span className="text-[#a0b0c8]">{black?.san ?? ''}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
