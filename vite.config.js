import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, existsSync } from 'fs'
import { resolve, join } from 'path'

function stockfishPlugin() {
  return {
    name: 'stockfish-copy',
    configResolved() {
      const bin = resolve('node_modules/stockfish/bin')
      const pub = resolve('public')

      // Prefer full single-thread WASM, fall back to lite, then asm.js
      const candidates = [
        ['stockfish-18-lite-single.js', 'stockfish-18-lite-single.wasm']
      ]

      for (const [jsFile, wasmFile] of candidates) {
        const jsSrc = join(bin, jsFile)
        if (!existsSync(jsSrc)) continue

        copyFileSync(jsSrc, join(pub, 'stockfish.js'))
        console.log(`[stockfish] ✓ Copied ${jsFile} → public/stockfish.js`)

        if (wasmFile) {
          const wasmSrc = join(bin, wasmFile)
          if (existsSync(wasmSrc)) {
            copyFileSync(wasmSrc, join(pub, 'stockfish.wasm'))
            console.log(`[stockfish] ✓ Copied ${wasmFile} → public/stockfish.wasm`)
          }
        }
        break
      }
    },
  }
}

export default defineConfig({
  base: '/react-chess-coach/',
  plugins: [react(), stockfishPlugin()],
})
