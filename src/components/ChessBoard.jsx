import { Chessboard } from 'react-chessboard'

export default function ChessBoard({ position, onPieceDrop, boardWidth, customSquareStyles, boardOrientation, arePiecesDraggable, isDraggablePiece, animationDuration }) {
  return (
    <div className="board-wrapper">
      <Chessboard
        position={position}
        onPieceDrop={onPieceDrop}
        boardWidth={boardWidth}
        customSquareStyles={customSquareStyles}
        boardOrientation={boardOrientation ?? 'white'}
        arePiecesDraggable={arePiecesDraggable ?? true}
        isDraggablePiece={isDraggablePiece}
        animationDuration={animationDuration ?? 250}
        customBoardStyle={{
          borderRadius: '4px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.6)',
        }}
        customDarkSquareStyle={{ backgroundColor: '#4a6741' }}
        customLightSquareStyle={{ backgroundColor: '#f0d9b5' }}
      />
    </div>
  )
}
