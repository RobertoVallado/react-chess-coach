# Bob's Chess Coach

An interactive React-based chess coaching application designed to help players improve their game through real-time move analysis, engine evaluation, and narrative feedback (FUTURE IMPLEMENTATION). Powered by the Stockfish chess engine running entirely in the browser via WebAssembly.

## Features

- **Interactive Chess Board**  Drag-and-drop piece movement with board orientation based on your chosen color.
- **Color Picker**  Choose to play as White, Black, or Random at the start of each new game.
- **Evaluation Bar**  Live visual indicator of position advantage, updated after every move (still buggy).
- **Stockfish Analysis**  Real-time best-move suggestions and centipawn score from the Stockfish engine (visuals still buggy).
- **Rival Mode**  Play against Stockfish at four difficulty levels: Easy, Medium, Hard, and Expert.
- **Move History**  Scrollable log of all moves in standard chess notation.
- **Analysis Panel**  Depth meter, score breakdown, depth-quality label, and principal variation line.
- **Why Depth Matters Panel**  Explaining how search depth affects engine reliability.
- **Narrator Panel**  Typed narrative of each move with eval and best-move context.
- **Feedback Panel**  Move-by-move log showing eval scores and best alternatives/feedback (For future implementation using OLLAMA).

## Stack

- **React**  Component-based UI
- **Vite**  Fast dev server and build tool
- **chess.js**  All chess move validation and game logic
- **react-chessboard** chessboard UI component
- **Stockfish 18**  WASM chess engine for analysis and rival play

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/RobertoVallado/react-chess-coach.git
   cd react-chess-coach
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Add the Stockfish WebAssembly binary:

   The `stockfish.wasm` and `stockfish.js` files exceed GitHub's file size limit and are not included in the repository. Download them from the [Stockfish releases](https://github.com/official-stockfish/stockfish) or the `stockfish` npm package and place them in the `public/` directory:

## Usage
<!-- TODO: Implement Docker for transferability and dev env -->
1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:5173`.

3. Click **New Game** to choose your color, then start playing.

## Building for Production 
<!-- TODO: TBD -->
```bash
npm run build
```
<!-- TODO: TBD -->
Output goes to the `dist/` directory.

## License

This project is licensed under the MIT License.
