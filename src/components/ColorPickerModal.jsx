import '../styles/ColorPickerModal.css'

export default function ColorPickerModal({ onSelect, onCancel }) {
  const pick = (color) => {
    if (color === 'random') {
      onSelect(Math.random() < 0.5 ? 'white' : 'black')
    } else {
      onSelect(color)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-title">New Game — Choose your side</div>

        <div className="color-picker-row">
          <button className="color-btn white-btn" onClick={() => pick('white')}>
            <span className="color-piece">♔</span>
            <span className="color-label">White</span>
          </button>

          <button className="color-btn random-btn" onClick={() => pick('random')}>
            <span className="color-piece" style={{ fontSize: '1.4rem' }}>⚄</span>
            <span className="color-label">Random</span>
          </button>

          <button className="color-btn black-btn" onClick={() => pick('black')}>
            <span className="color-piece">♚</span>
            <span className="color-label">Black</span>
          </button>
        </div>

        <button className="modal-cancel" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}
