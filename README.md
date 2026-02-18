# Bob's Chess Coach

An interactive React-based chess coaching application designed to help players improve their game through real-time move analysis, engine evaluation, and narrative feedback. Powered by the Stockfish chess engine running entirely in the browser via WebAssembly.

## Features

- **Interactive Chess Board** — Drag-and-drop piece movement with board orientation based on your chosen color.
- **Color Picker** — Choose to play as White, Black, or Random at the start of each new game.
- **Evaluation Bar** — Live visual indicator of position advantage, updated after every move.
- **Stockfish Analysis** — Real-time best-move suggestions and centipawn score from the Stockfish engine.
- **Rival Mode** — Play against Stockfish at four difficulty levels: Easy, Medium, Hard, and Expert.
- **Move History** — Scrollable log of all moves in standard algebraic notation.
- **Analysis Panel** — Depth meter, score breakdown, depth-quality label, and principal variation line.
- **Why Depth Matters Panel** — Educational sidebar explaining how search depth affects engine reliability.
- **Narrator Panel** — Typed narrative of each move with eval and best-move context.
- **Feedback Panel** — Move-by-move log showing eval scores and best alternatives.
- **Header** — App branding with login toggle and settings button.
- **Footer** — Links to social profiles and project info.

## Project Structure

```
src/
├── components/         # React components
│   ├── AnalysisPanel.jsx
│   ├── ChessBoard.jsx
│   ├── ColorPickerModal.jsx
│   ├── EvalBar.jsx
│   ├── FeedbackPanel.jsx
│   ├── Footer.jsx
│   ├── Header.jsx
│   ├── MoveHistory.jsx
│   ├── NarratorPanel.jsx
│   ├── NotesPanel.jsx
│   ├── StockfishPanel.jsx
│   └── WhyDepthMattersPanel.jsx
├── styles/             # Per-component CSS files
│   ├── AnalysisPanel.css
│   ├── ColorPickerModal.css
│   ├── EvalBar.css
│   ├── FeedbackPanel.css
│   ├── Footer.css
│   ├── Header.css
│   ├── MoveHistory.css
│   ├── NarratorPanel.css
│   ├── StockfishPanel.css
│   └── WhyDepthMattersPanel.css
├── hooks/
│   └── useStockfish.js
├── App.jsx             # Root layout and game state
├── App.css             # Global layout and shared styles
└── index.css           # CSS reset and base styles
```

## Technologies Used

- **React** — Component-based UI
- **Vite** — Fast dev server and build tool
- **chess.js** — Chess move validation and game logic
- **react-chessboard** — Chessboard UI component
- **Stockfish 18** — WASM chess engine for analysis and rival play

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

   ```
   public/
   ├── stockfish.js
   └── stockfish.wasm
   ```

   Or copy them from the installed npm package:
   ```bash
   cp node_modules/stockfish/src/stockfish.js public/
   cp node_modules/stockfish/src/stockfish.wasm public/
   ```

## Usage

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:5173`.

3. Click **New Game** to choose your color, then start playing.

## Building for Production

```bash
npm run build
```

Output goes to the `dist/` directory.

## License

This project is licensed under the MIT License.
