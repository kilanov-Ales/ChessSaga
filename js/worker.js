// ═══════════════════════════════════════════════════════════
// Stockfish Web Worker
// stockfish.js (Emscripten build) is self-contained:
//   - It reads UCI commands from self.onmessage (via postMessage)
//   - It posts UCI output lines back via postMessage
// So we just load it and it handles everything internally.
// ═══════════════════════════════════════════════════════════
try {
    importScripts('stockfish.js');
} catch (e) {
    console.error('[worker] Failed to load stockfish.js:', e);
    // Fallback: try CDN version
    try {
        importScripts('https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js');
    } catch (e2) {
        console.error('[worker] CDN fallback also failed:', e2);
    }
}
