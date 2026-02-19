export default function WhyDepthMattersPanel() {
  return (
    <div className="flex flex-col flex-1 bg-panel-5 border-t border-border-dim overflow-hidden">
      <div className="panel-header">Why Depth Matters</div>
      <div className="flex-1 overflow-y-auto p-[10px_12px] flex flex-col gap-[14px] scrollbar-blue">
        <div className="flex flex-col gap-[5px]">
          <p className="font-lato text-[0.68rem] leading-[1.55] text-txt-dim">
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
