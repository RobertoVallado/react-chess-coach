export default function ColorPickerModal({ onSelect, onCancel }) {
  const pick = (color) => {
    if (color === 'random') {
      onSelect(Math.random() < 0.5 ? 'white' : 'black')
    } else {
      onSelect(color)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/[0.72] flex items-center justify-center z-[100] backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-modal-bg border border-border-light rounded-lg p-7 md:p-8 flex flex-col items-center gap-[22px] shadow-[0_12px_48px_rgba(0,0,0,0.7)] w-[90vw] max-w-xs md:min-w-[320px]"
        onClick={e => e.stopPropagation()}
      >
        <div className="font-lato text-[0.82rem] tracking-[0.12em] uppercase text-txt-secondary">
          New Game — Choose your side
        </div>

        <div className="flex gap-[14px]">
          <button
            className="flex flex-col items-center gap-2 w-20 min-h-[44px] py-4 px-[10px] rounded-md border border-border-light bg-[#131728] cursor-pointer transition-all hover:-translate-y-[2px] hover:border-[#c8c0b0] hover:bg-[#1e2030]"
            onClick={() => pick('white')}
          >
            <span className="text-[2.4rem] leading-none text-[#f0d9b5]">♔</span>
            <span className="font-lato text-[0.72rem] tracking-[0.08em] text-[#6a80a0]">White</span>
          </button>

          <button
            className="flex flex-col items-center gap-2 w-20 min-h-[44px] py-4 px-[10px] rounded-md border border-border-light bg-[#131728] cursor-pointer transition-all hover:-translate-y-[2px] hover:border-blue hover:bg-[#1e2030]"
            onClick={() => pick('random')}
          >
            <span className="text-[1.4rem] leading-none text-blue">⚄</span>
            <span className="font-lato text-[0.72rem] tracking-[0.08em] text-[#6a80a0]">Random</span>
          </button>

          <button
            className="flex flex-col items-center gap-2 w-20 min-h-[44px] py-4 px-[10px] rounded-md border border-border-light bg-[#131728] cursor-pointer transition-all hover:-translate-y-[2px] hover:border-[#6a7a9a] hover:bg-[#1e2030]"
            onClick={() => pick('black')}
          >
            <span className="text-[2.4rem] leading-none text-[#b0b8c8]">♚</span>
            <span className="font-lato text-[0.72rem] tracking-[0.08em] text-[#6a80a0]">Black</span>
          </button>
        </div>

        <button
          className="bg-transparent border-none font-lato text-[0.72rem] text-txt-faint cursor-pointer tracking-[0.06em] px-2 py-1 hover:text-txt-secondary transition-colors"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
