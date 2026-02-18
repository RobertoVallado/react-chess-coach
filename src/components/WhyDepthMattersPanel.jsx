import '../styles/AnalysisPanel.css'
import '../styles/WhyDepthMattersPanel.css'

export default function WhyDepthMattersPanel() {
  return (
    <div className="why-depth-panel">
      <div className="panel-header">Why Depth Matters</div>
      <div className="analysis-side-content">
        <div className="as-block">
          <p className="as-explain">
            Chess has roughly 35 legal moves per position. Every extra ply (half-move)
            multiplies the search tree by ~35×. Shallow searches miss deep combinations;
            deeper searches find lines that no human could calculate at the board.
            Stockfish uses alpha-beta pruning and NNUE (neural-network) evaluation to
            cut irrelevant branches and reach high depths efficiently.
          </p>
        </div>
      </div>
    </div>
  )
}
