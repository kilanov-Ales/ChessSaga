/* ================================================================
   GREAT BOOK OF TACTICS — puzzles.js (full rewrite)
   ================================================================ */

// figuresPath is set by game.js which loads first; safe fallback if not yet loaded
if (typeof window.figuresPath === 'undefined') {
    window.figuresPath = 'Visualization/figures/';
}

// ═══════════════════════════════════════════════════════════════════
// Oracle of the Abyss — Cloudflare Worker URL
// PASTE YOUR DEPLOYED WORKER URL BELOW (endpoint: /oracle)
// ═══════════════════════════════════════════════════════════════════
window.ORACLE_WORKER_URL = 'https://chess-api.kilanov.workers.dev/oracle';

// ── State ─────────────────────────────────────────────────────────
let currentPuzzleData   = null;
let currentPuzzleTier   = 'all';   // 'easy' | 'medium' | 'hard' | 'all'
let currentThemeFilter  = null;    // Lichess theme string or null
let currentCategoryLabel= null;    // Human-readable label for breadcrumb
let allPuzzles          = [];      // Full archive from puzzles.json
let puzzleBuffer        = [];      // Buffer of 25 ready-to-load puzzles

window.puzzleMoves     = [];
window.puzzleMoveIndex = 0;
window.solvedPuzzlesTotal = 0;

// ── Stockfish ──────────────────────────────────────────────────────
let stockfishWorker = null;
let stockfishReady  = false;
let evaluationCallback = null;

function initStockfish() {
    if (stockfishWorker) return;

    try {
        const w = new Worker('js/worker.js');
        stockfishWorker = w;
        attachStockfishHandlers();
        stockfishWorker.postMessage('uci');
    } catch (e) {
        console.error('[Stockfish] Initialization failed.', e);
        const ph = document.getElementById('oracle-placeholder');
        if (ph) ph.textContent = 'Оракул спит вечным сном (движок недоступен).';
    }
}

function attachStockfishHandlers() {
    stockfishWorker.onerror = (e) => console.error('[Stockfish worker error]', e);
    stockfishWorker.onmessage = (e) => {
        const msg = e.data;
        if (msg === 'uciok') {
            stockfishReady = true;
            stockfishWorker.postMessage('isready');
        }
        if (msg.startsWith('bestmove') || (msg.startsWith('info depth') && (msg.includes(' cp ') || msg.includes(' mate ')))) {
            if (evaluationCallback) evaluationCallback(msg);
        }
    };
}

// ── Entry Point ────────────────────────────────────────────────────
window.startPuzzles = function() {
    if (typeof window.isMainMenu !== 'undefined') window.isMainMenu = false;
    // BUGFIX: cancel any active speech from the main game before switching to puzzles
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (typeof window.isSpeaking !== 'undefined') window.isSpeaking = false;
    if (typeof resumeAudio === 'function') resumeAudio();
    if (typeof applyMenuVolumeLogic === 'function') applyMenuVolumeLogic();

    const menu = document.getElementById('main-menu');
    menu.style.opacity = '0';
    setTimeout(() => {
        menu.style.display = 'none';
        document.getElementById('puzzle-app').classList.add('app-visible');

        // Show mobile bottom nav on small screens
        const mobileNav = document.getElementById('puzzle-mobile-nav');
        if (mobileNav && window.innerWidth < 768) mobileNav.style.display = 'flex';

        showCategoryGrid();     // Start on the grid, not the board
        initStockfish();
        initPuzzles();
        fetchCloudProgress();
        attachOracleSwipe();    // Mobile swipe to collapse oracle
    }, 800);
};

// BUGFIX: Explicit exit function to clean up Stockfish when leaving puzzle mode
window.exitPuzzles = function() {
    if (stockfishWorker) stockfishWorker.postMessage('stop');
    evaluationCallback = null;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
};

// ── Category Grid ──────────────────────────────────────────────────
window.showCategoryGrid = function() {
    const grid = document.getElementById('puzzle-category-grid');
    const play = document.getElementById('puzzle-play-view');
    if (!grid || !play) return;
    grid.classList.remove('hidden');
    grid.style.opacity = '0';
    play.classList.add('hidden');
    requestAnimationFrame(() => {
        grid.style.transition = 'opacity 0.5s ease';
        grid.style.opacity = '1';
    });

    // Hide left panel on mobile while in grid (it's part of the grid already)
    const leftPanel = document.getElementById('puzzle-left-panel');
    if (leftPanel) leftPanel.classList.add('lg:hidden');
};

window.hideCategoryGrid = function() {
    const grid = document.getElementById('puzzle-category-grid');
    const play = document.getElementById('puzzle-play-view');
    if (!grid || !play) return;
    grid.style.opacity = '0';
    setTimeout(() => {
        grid.classList.add('hidden');
        play.classList.remove('hidden');
        play.style.opacity = '0';
        requestAnimationFrame(() => {
            play.style.transition = 'opacity 0.5s ease';
            play.style.opacity = '1';
        });
        const leftPanel = document.getElementById('puzzle-left-panel');
        if (leftPanel) leftPanel.classList.remove('lg:hidden');
    }, 300);
};

// ── Picking a Category ─────────────────────────────────────────────
window.pickCategory = function(theme, label) {
    currentThemeFilter   = theme;
    currentCategoryLabel = label;
    currentPuzzleTier    = 'all';

    // Update breadcrumb
    const bc = document.getElementById('puzzle-breadcrumb');
    if (bc) bc.textContent = label;
    const clearBtn = document.getElementById('clear-theme-btn');
    if (clearBtn) clearBtn.classList.remove('hidden');

    // Update active theme buttons in left panel accordion
    document.querySelectorAll('.theme-btn').forEach(b => {
        b.classList.toggle('active-theme', b.dataset.theme === theme);
    });
    document.querySelectorAll('.puzzle-tier-btn').forEach(b => b.classList.remove('active-tier'));

    hideCategoryGrid();
    puzzleBuffer = []; // Clear buffer on theme change
    if (allPuzzles.length > 0) {
        getNewPuzzle();
    } else {
        // Data might still loading; wait
        window._pendingThemeApply = true;
    }
};

// ── Data Loading ────────────────────────────────────────────────────
async function initPuzzles() {
    const loaderEl = document.getElementById('puzzle-loader');
    if (loaderEl) loaderEl.style.display = 'block';

    const emptyMsg = document.getElementById('puzzle-archives-empty');
    let loadingBanner = document.getElementById('puzzle-loading-banner');
    if (!loadingBanner) {
        loadingBanner = document.createElement('div');
        loadingBanner.id = 'puzzle-loading-banner';
        loadingBanner.className = 'mx-auto max-w-lg text-center px-8 py-6 glass-panel rounded-3xl border border-[#c2a3ff]/30 shadow-[0_0_40px_rgba(194,163,255,0.1)] m-4 relative z-10';
        loadingBanner.innerHTML = `
            <div class="text-4xl mb-3 animate-spin inline-block"><span class="icon-placeholder" data-icon="hourglass">⏳</span></div>
            <h2 class="font-cinzel font-bold text-lg text-[#c2a3ff] mb-2 glow-purple">Оракул читает древние свитки...</h2>
            <p class="text-slate-400 font-philosopher text-sm italic">Свитков множество. Лишь миг терпения, Лорд.</p>
        `;
        const gridInner = document.getElementById('cat-grid-inner');
        if (gridInner) gridInner.parentNode.insertBefore(loadingBanner, gridInner);
    }
    loadingBanner.style.display = 'block';

    // Minimal fallback puzzle used when puzzles.json is unavailable (404 or network error)
    const FALLBACK_PUZZLES = [
        {
            puzzleid: 'fallback_01',
            fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
            moves: 'f3g5 d8e7 g5f7',
            rating: 1200,
            themes: 'fork middlegame',
            gameurl: ''
        }
    ];

    try {
        const resp = await fetch('puzzles.json');
        if (!resp.ok) {
            throw new Error('HTTP ' + resp.status);
        }
        allPuzzles = await resp.json();
        console.log('[Puzzles] Loaded', allPuzzles.length, 'puzzles into global archive');
    } catch (e) {
        console.warn('[Puzzles] Could not load puzzles.json:', e, '— using fallback puzzle set.');
        allPuzzles = FALLBACK_PUZZLES;
    }

    loadingBanner.style.display = 'none';
    if (loaderEl) loaderEl.style.display = 'none';

    if (!allPuzzles || allPuzzles.length === 0) {
        showArchivesEmptyMessage();
        return;
    }

    fillPuzzleBuffer();
    updateCategoryCardCounts();

    if (window._pendingThemeApply) {
        window._pendingThemeApply = false;
        getNewPuzzle();
    }
}

function showArchivesEmptyMessage() {
    // Show beautiful in-game style error in the category grid
    const grid = document.getElementById('puzzle-category-grid');
    if (!grid) return;

    // Keep grid visible (don't auto-navigate to board on no data)
    grid.classList.remove('hidden');
    grid.style.opacity = '1';

    const emptyMsg = document.getElementById('puzzle-archives-empty');
    if (emptyMsg) {
        emptyMsg.classList.remove('hidden');
    }
}

function updateCategoryCardCounts() {
    if (!allPuzzles || allPuzzles.length === 0) return;

    // Count by theme
    const counts = {};
    allPuzzles.forEach(p => {
        if (!p.themes) return;
        p.themes.split(' ').forEach(t => {
            counts[t] = (counts[t] || 0) + 1;
        });
    });

    document.querySelectorAll('.cat-card[data-theme]').forEach(card => {
        const theme = card.dataset.theme;
        const count = counts[theme] || 0;
        const countEl = card.querySelector('.cat-count');
        if (countEl && count > 0) {
            countEl.textContent = count.toLocaleString();
        }
    });
}

// ── Tier Selection ─────────────────────────────────────────────────
window.setPuzzleTier = function(tier) {
    currentPuzzleTier = tier;
    puzzleBuffer = []; // Clear buffer to apply modified tier constraints
    document.querySelectorAll('.puzzle-tier-btn').forEach(b => b.classList.remove('active-tier'));
    const btn = document.getElementById('tier-' + tier);
    if (btn) btn.classList.add('active-tier');
    getNewPuzzle();
};

// ── Theme Accordion ────────────────────────────────────────────────
window.toggleAccordion = function(id) {
    const el  = document.getElementById(id);
    const btn = el.previousElementSibling;
    const isHidden = el.classList.contains('hidden');
    el.classList.toggle('hidden', !isHidden);
    el.classList.toggle('flex',  isHidden);
    btn.classList.toggle('open', isHidden);
};

window.filterByTheme = function(theme, label) {
    // When called from left panel (during play), jump straight into puzzle
    currentThemeFilter   = theme;
    currentCategoryLabel = label || theme;
    currentPuzzleTier    = 'all';

    document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active-theme'));
    const clicked = document.querySelector(`.theme-btn[data-theme="${theme}"]`);
    if (clicked) clicked.classList.add('active-theme');
    document.querySelectorAll('.puzzle-tier-btn').forEach(b => b.classList.remove('active-tier'));

    const cb = document.getElementById('clear-theme-btn');
    if (cb) cb.classList.remove('hidden');
    const bc = document.getElementById('puzzle-breadcrumb');
    if (bc) bc.textContent = currentCategoryLabel;

    // Make sure board is visible
    const grid = document.getElementById('puzzle-category-grid');
    const play = document.getElementById('puzzle-play-view');
    if (grid)  grid.classList.add('hidden');
    if (play) { play.classList.remove('hidden'); play.style.opacity = '1'; }
    const leftPanel = document.getElementById('puzzle-left-panel');
    if (leftPanel) leftPanel.classList.remove('lg:hidden');

    puzzleBuffer = []; // Fresh buffer for new theme
    getNewPuzzle();
};

window.clearThemeFilter = function() {
    currentThemeFilter   = null;
    currentCategoryLabel = null;
    currentPuzzleTier    = 'all'; // Default to all / RPG scaling

    document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active-theme'));
    const cb = document.getElementById('clear-theme-btn');
    if (cb) cb.classList.add('hidden');
    const bc = document.getElementById('puzzle-breadcrumb');
    if (bc) bc.textContent = '';

    puzzleBuffer = []; // Clear buffer
    showCategoryGrid();
};

// ── Buffer & Load Puzzle ────────────────────────────────────────────
function fillPuzzleBuffer() {
    if (!allPuzzles || allPuzzles.length === 0) return;
    if (puzzleBuffer.length >= 5) return;

    let pool = allPuzzles;

    // Apply strict filtering first (theme constraints)
    if (currentThemeFilter) {
        pool = pool.filter(p => p.themes && p.themes.includes(currentThemeFilter));
    }
    if (pool.length === 0) pool = allPuzzles;

    // Determine target ratings via Level or defined Tiers
    let minRating = 0, maxRating = 9999;
    if (currentPuzzleTier === 'all') {
        let level = 1;
        if (window.progressionManager && window.progressionManager.level) {
            level = window.progressionManager.level;
        }
        minRating = 500 + (level * 50);
        maxRating = 1000 + (level * 100);
    } else if (currentPuzzleTier === 'easy') {
        minRating = 500; maxRating = 1000;
    } else if (currentPuzzleTier === 'medium') {
        minRating = 1000; maxRating = 2000;
    } else if (currentPuzzleTier === 'hard') {
        minRating = 2000; maxRating = 9999;
    }

    let ratingPool = pool.filter(p => p.rating >= minRating && p.rating <= maxRating);
    let needed = 25 - puzzleBuffer.length;

    for (let i = 0; i < needed; i++) {
        if (ratingPool.length > 0) {
            let idx = Math.floor(Math.random() * ratingPool.length);
            puzzleBuffer.push(ratingPool[idx]);
            ratingPool.splice(idx, 1);
        } else if (pool.length > 0) {
            let idx = Math.floor(Math.random() * pool.length);
            puzzleBuffer.push(pool[idx]);
            pool.splice(idx, 1);
        }
    }
}

function getNewPuzzle() {
    if (!allPuzzles || allPuzzles.length === 0) {
        showArchivesEmptyMessage();
        return;
    }

    if (puzzleBuffer.length === 0) {
        fillPuzzleBuffer();
    }

    if (puzzleBuffer.length === 0) {
        const oracle = document.getElementById('oracle-messages');
        if (oracle) {
            oracle.innerHTML = `
                <div class="mx-auto text-center py-8 px-4">
                    <div class="text-4xl mb-4"><span class="icon-placeholder" data-icon="scroll">📜</span></div>
                    <p class="text-[#c2a3ff] font-cinzel font-bold text-base mb-2">Архивы пусты</p>
                    <p class="text-slate-400 text-sm italic">Свитков с рунами «${currentCategoryLabel || currentThemeFilter || 'этого мира'}» не найдено.</p>
                </div>`;
        }
        return;
    }

    const puzzle = puzzleBuffer.pop();
    fillPuzzleBuffer(); // replenish

    startSpecificPuzzle(puzzle);
}

// ── Render Puzzle ───────────────────────────────────────────────────
function startSpecificPuzzle(puzzle) {
    currentPuzzleData      = puzzle;
    window.puzzleMoves     = puzzle.moves.split(' ');
    window.puzzleMoveIndex = 0;

    const ratingEl = document.getElementById('puzzles-current-rating');
    if (ratingEl) ratingEl.textContent = puzzle.rating;

    // Themes chips
    const themesDiv = document.getElementById('puzzle-themes');
    if (themesDiv) {
        themesDiv.innerHTML = '';
        let hasSacrifice = false;
        if (puzzle.themes) {
            puzzle.themes.split(' ').forEach(t => {
                if (t === 'sacrifice') hasSacrifice = true;
                const chip = THEME_TRANSLATIONS[t] || t;
                themesDiv.innerHTML += `<span class="bg-sky-900/40 text-sky-300 text-[10px] px-2 py-1 rounded-full uppercase tracking-wider">${chip}</span>`;
            });
        }
        window._hasSacrifice = hasSacrifice;
    }

    // Chess engine
    window.puzzleChess = new Chess(puzzle.fen);
    const isPlayerWhite = (window.puzzleChess.turn() === 'b');
    window.puzzlePlayerColor  = isPlayerWhite ? 'w' : 'b';
    window.puzzleBoardFlipped = (window.puzzlePlayerColor === 'b');

    const turnEl = document.getElementById('puzzle-turn');
    if (turnEl) turnEl.textContent = window.puzzlePlayerColor === 'w' ? 'ОЧЕРЕДЬ: БЕЛЫЕ (ВЫ)' : 'ОЧЕРЕДЬ: ЧЁРНЫЕ (ВЫ)';

    // Sacrifice aura on board outer
    const aura = document.getElementById('puzzle-aura');
    if (aura) aura.style.opacity = window._hasSacrifice ? '1' : '0';

    // Reset oracle
    const oracle = document.getElementById('oracle-messages');
    if (oracle) oracle.innerHTML = `<div class="text-center text-slate-500 italic mt-auto mb-auto" id="oracle-placeholder">Оракул дремлет. Ошибись, дабы пробудить его...</div>`;

    // Reset next button
    const nextBtn = document.getElementById('next-puzzle-btn');
    if (nextBtn) { nextBtn.style.opacity = '0.5'; nextBtn.style.pointerEvents = 'none'; }

    renderPuzzleBoard();

    setTimeout(() => playOpponentPuzzleMove(), 600);
}

// ── Board Render ────────────────────────────────────────────────────
function renderPuzzleBoard() {
    const loaderEl = document.getElementById('puzzle-loader');
    if (loaderEl) loaderEl.style.display = 'none';

    const boardEl = document.getElementById('puzzle-board');
    if (!boardEl) return;
    boardEl.innerHTML = '';

    const rawBoard = window.puzzleChess.board();
    const isPlayerTurn = window.puzzleChess.turn() === window.puzzlePlayerColor;

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const r = window.puzzleBoardFlipped ? 7 - row : row;
            const c = window.puzzleBoardFlipped ? 7 - col : col;
            const coord = `${String.fromCharCode(97 + c)}${8 - r}`;

            const sq = document.createElement('div');
            sq.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
            sq.dataset.square = coord;
            if (isPlayerTurn) sq.onclick = () => onSquareClick(coord);

            if (rawBoard[r][c]) {
                const piece = rawBoard[r][c];
                const nameMap = { q:'queen', r:'rook', b:'bishop', n:'knight', k:'king', p:'pawn' };
                const img = document.createElement('img');
                img.src = `${window.figuresPath}${piece.color}_${nameMap[piece.type]}.png`;
                img.className = 'piece-img';
                img.onerror = function() { this.style.display = 'none'; };

                // Sacrifice aura on individual pieces (player's pieces only)
                if (window._hasSacrifice && piece.color === window.puzzlePlayerColor) {
                    img.classList.add('sacrifice-piece-aura');
                }

                sq.appendChild(img);
            }
            boardEl.appendChild(sq);
        }
    }
}

// ── Click to Move ────────────────────────────────────────────────────
let puzzleSelectedSquare = null;

function onSquareClick(coord) {
    if (window.puzzleChess.turn() !== window.puzzlePlayerColor) return;

    if (!puzzleSelectedSquare) {
        const piece = window.puzzleChess.get(coord);
        if (piece && piece.color === window.puzzlePlayerColor) {
            puzzleSelectedSquare = coord;
            highlightSquare(coord, true);
        }
    } else {
        const from = puzzleSelectedSquare;
        const to   = coord;
        puzzleSelectedSquare = null;

        const piece    = window.puzzleChess.get(from);
        // BUGFIX: for underpromotion puzzles, use the promotion piece required by the puzzle
        // not always 'q'. We auto-detect by checking the next expected puzzle move.
        let promo = undefined;
        if (piece && piece.type === 'p' && (to[1] === '1' || to[1] === '8')) {
            const expectedFull = window.puzzleMoves[window.puzzleMoveIndex];
            // If the puzzle's expected move has an explicit promotion piece, use it
            if (expectedFull && expectedFull.length === 5 &&
                expectedFull.substring(0, 2) === from && expectedFull.substring(2, 4) === to) {
                promo = expectedFull[4]; // e.g. 'n' for knight underpromotion
            } else {
                promo = 'q'; // default to queen
            }
        }
        const moveObj  = { from, to, promotion: promo };

        const legal = window.puzzleChess.moves({ verbose: true }).some(m => m.from === from && m.to === to);
        renderPuzzleBoard();

        if (legal) {
            checkPlayerPuzzleMove(from + to + (promo || ''), moveObj);
        } else {
            // Re-select if clicking another own piece
            const np = window.puzzleChess.get(coord);
            if (np && np.color === window.puzzlePlayerColor) {
                puzzleSelectedSquare = coord;
                highlightSquare(coord, true);
            }
        }
    }
}

function highlightSquare(coord, selected) {
    document.querySelectorAll('#puzzle-board .square').forEach(sq => {
        if (sq.dataset.square === coord && selected)
            sq.classList.add('editor-target');
    });
}

// ── Opponent & Player Move Logic ─────────────────────────────────────
function playOpponentPuzzleMove() {
    if (window.puzzleMoveIndex >= window.puzzleMoves.length) { winPuzzle(); return; }

    const mv   = window.puzzleMoves[window.puzzleMoveIndex];
    const from = mv.substring(0, 2);
    const to   = mv.substring(2, 4);
    const prom = mv.length > 4 ? mv[4] : undefined;

    const moveObj = window.puzzleChess.move({ from, to, promotion: prom });
    
    // Trigger capture VFX if the opponent took a piece
    if (moveObj) {
        if (moveObj.captured) {
            if (typeof spawnCaptureVFX === 'function') spawnCaptureVFX(moveObj.to);
            if (window.vfxManager) window.vfxManager.spawnShadowDeath(moveObj.to);
            if (window.audioManager) {
                const piecesCount = (window.puzzleChess.fen().split(' ')[0].match(/[A-Za-z]/g) || []).length;
                if (piecesCount <= 8) window.audioManager.playMusic('Soundtrack/End of soundtrack.mp3');
            }
        }
        
        if (moveObj.piece === 'p' && !moveObj.captured) {
            if (window.vfxManager) window.vfxManager.spawnBloodTrail(moveObj.from, moveObj.to);
        }
    }

    window.puzzleMoveIndex++;
    renderPuzzleBoard();
    
    // Check King Plea
    if (window.vfxManager) {
        if (window.puzzleChess.in_check()) {
            const board = window.puzzleChess.board();
            let kingSq = null;
            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    if (board[r][c] && board[r][c].type === 'k' && board[r][c].color === window.puzzlePlayerColor) {
                        kingSq = String.fromCharCode(97 + c) + (8 - r);
                    }
                }
            }
            if (kingSq) window.vfxManager.startKingPlea(kingSq);
        } else {
            window.vfxManager.stopKingPlea();
        }
    }
}

function checkPlayerPuzzleMove(uciMove, moveObj) {
    // BUGFIX: Tutorial intercept — if tutorial is active and awaiting a move, check it first.
    // Return early whether the move was right or wrong, so the puzzle logic doesn't double-fire.
    if (window.tutorialManager && window.tutorialManager.isActive) {
        if (window.tutorialManager.currentStep && window.tutorialManager.currentStep.action === 'expectedMove') {
            if (uciMove !== window.tutorialManager.currentStep.expectedMove) {
                // Wrong tutorial move — block and show Lilith
                if (window.tutorialManager.portrait) {
                    window.tutorialManager.portrait.src = "Visualization/Lily/lilith_4.png";
                    window.tutorialManager._startTypewriter("Мы же договорились следовать плану.");
                }
                const boardOuter = document.querySelector('.puzzle-board-outer');
                if (boardOuter) {
                    boardOuter.classList.remove('shake-anim');
                    void boardOuter.offsetWidth;
                    boardOuter.classList.add('shake-anim');
                    setTimeout(() => boardOuter.classList.remove('shake-anim'), 400);
                }
                renderPuzzleBoard();
                return; // Block puzzle logic from running
            } else {
                // Correct tutorial move — advance tutorial, then let puzzle logic continue
                window.tutorialManager.checkMove(uciMove);
                // BUGFIX: return here to avoid triggering punishment for a correct tutorial move
                // that might not match the puzzle's expected solution.
                return;
            }
        }
    }

    const correctMove = window.puzzleMoves[window.puzzleMoveIndex];
    const uciShort    = uciMove.substring(0, 4);
    const correctShort= correctMove.substring(0, 4);

    if (uciShort === correctShort) {
        // Auto-apply correct promotion piece if the puzzle specifically required underpromotion
        if (correctMove.length === 5) {
            moveObj.promotion = correctMove[4];
        }

        // Move execution
        const playedMove = window.puzzleChess.move(moveObj);
        
        // Trigger capture VFX if a piece was taken
        if (playedMove) {
            if (playedMove.captured) {
                if (typeof spawnCaptureVFX === 'function') spawnCaptureVFX(playedMove.to);
                if (window.vfxManager) window.vfxManager.spawnShadowDeath(playedMove.to);
                if (window.audioManager) {
                    const piecesCount = (window.puzzleChess.fen().split(' ')[0].match(/[A-Za-z]/g) || []).length;
                    if (piecesCount <= 8) window.audioManager.playMusic('Soundtrack/End of soundtrack.mp3');
                }
            }
            if (playedMove.piece === 'p' && !playedMove.captured) {
                if (window.vfxManager) window.vfxManager.spawnBloodTrail(playedMove.from, playedMove.to);
            }
        }

        window.puzzleMoveIndex++;
        renderPuzzleBoard();
        
        // Check King Plea
        if (window.vfxManager) {
            if (window.puzzleChess.in_check()) {
                const board = window.puzzleChess.board();
                let kingSq = null;
                for (let r = 0; r < 8; r++) {
                    for (let c = 0; c < 8; c++) {
                        const oppColor = window.puzzlePlayerColor === 'w' ? 'b' : 'w';
                        if (board[r][c] && board[r][c].type === 'k' && board[r][c].color === oppColor) {
                            kingSq = String.fromCharCode(97 + c) + (8 - r);
                        }
                    }
                }
                if (kingSq) window.vfxManager.startKingPlea(kingSq);
            } else {
                window.vfxManager.stopKingPlea();
            }
        }

        if (window.puzzleMoveIndex >= window.puzzleMoves.length) {
            winPuzzle();
        } else {
            setTimeout(() => playOpponentPuzzleMove(), 600);
        }
    } else {
        executeIncorrectMovePunishment(uciMove, moveObj);
    }
}

// ── Wrong Move Punishment ────────────────────────────────────────────
function executeIncorrectMovePunishment(uciMove) {
    const boardOuter = document.querySelector('.puzzle-board-outer');
    if (boardOuter) {
        boardOuter.classList.add('shake-anim');
        setTimeout(() => boardOuter.classList.remove('shake-anim'), 400);
    }

    // Trigger Vignette of Doom
    document.body.classList.add('vignette-active');
    setTimeout(() => document.body.classList.remove('vignette-active'), 800);

    const tempChess = new Chess(window.puzzleChess.fen());
    const from = uciMove.substring(0,2), to = uciMove.substring(2,4);
    const prom = uciMove.length > 4 ? uciMove[4] : undefined;
    tempChess.move({ from, to, promotion: prom });
    const badFen = tempChess.fen();

    const oracle = document.getElementById('oracle-messages');
    const placeholder = document.getElementById('oracle-placeholder');
    if (placeholder) placeholder.style.display = 'none';
    if (oracle) {
        oracle.innerHTML += `
            <div class="text-sm border-l-4 border-red-500 pl-4 py-3 bg-red-900/10 text-red-400 mb-2 rounded-r-lg">
                <span class="icon-placeholder" data-icon="icon-unknown">⚠</span>️ Ход <code class="font-mono text-red-300">${uciMove}</code> неверен. Оракул ищет опровержение...
            </div>`;
        oracle.scrollTop = oracle.scrollHeight;
    }

    if (stockfishReady && stockfishWorker) {
        stockfishWorker.postMessage('setoption name MultiPV value 3');
        stockfishWorker.postMessage('position fen ' + badFen);
        stockfishWorker.postMessage('go depth 15');

        let pvLines = {};

        const fallbackTimer = setTimeout(() => {
            if (evaluationCallback) {
                stockfishWorker.postMessage('stop');
            }
        }, 8000);

        evaluationCallback = (msg) => {
            if (msg.startsWith('info depth')) {
                const depthMatch = msg.match(/depth\s+(\d+)/);
                const multipvMatch = msg.match(/multipv\s+(\d+)/);
                const pvMatch = msg.match(/pv\s+([a-h][1-8][a-h][1-8][qrbn]?)/);
                
                const depth = depthMatch ? parseInt(depthMatch[1]) : 0;
                const pv = multipvMatch ? parseInt(multipvMatch[1]) : 1;
                const move = pvMatch ? pvMatch[1] : '?';
                
                let scoreText = '?';
                let scoreVal = null;
                
                if (msg.includes(' mate ')) {
                    const mateIdx = msg.indexOf(' mate ');
                    const m = parseInt(msg.substring(mateIdx + 6));
                    scoreText = m > 0 ? `#${m}` : `#${m}`;
                    scoreVal = m > 0 ? 1000 - m : -1000 - m; 
                } else if (msg.includes(' cp ')) {
                    const parts = msg.split(' ');
                    const cpIdx = parts.indexOf('cp');
                    const cp = parseInt(parts[cpIdx + 1]);
                    scoreText = (cp / 100).toFixed(2);
                    scoreVal = cp / 100;
                }

                if (scoreVal !== null && depth > 0) {
                    if (!pvLines[pv] || depth >= pvLines[pv].depth) {
                        pvLines[pv] = { depth, scoreText, scoreVal, move };
                    }
                }
            } 
            
            if (msg.startsWith('bestmove')) {
                clearTimeout(fallbackTimer);
                evaluationCallback = null;
                
                let topLines = [];
                if (pvLines[1]) topLines.push(pvLines[1]);
                if (pvLines[2]) topLines.push(pvLines[2]);
                if (pvLines[3]) topLines.push(pvLines[3]);
                
                let isOnlyMove = false;
                let isCrushingAdvantage = false;

                if (topLines.length >= 2) {
                    const diff = topLines[0].scoreVal - topLines[1].scoreVal;
                    const l1Mate = topLines[0].scoreText.includes('#') && !topLines[0].scoreText.includes('#-');
                    const l2Mate = topLines[1].scoreText.includes('#') && !topLines[1].scoreText.includes('#-');

                    if ((l1Mate && !l2Mate) || diff > 1.7) {
                        isOnlyMove = true;
                    }
                }

                if (topLines.length === 3) {
                    const allWinning = topLines.every(l => (!l.scoreText.includes('#-') && l.scoreVal > 3.0));
                    if (allWinning) {
                        isCrushingAdvantage = true;
                    }
                }

                let aiContext = `Текущая позиция: ${badFen}. Оценка: ${topLines[0] ? topLines[0].scoreText : '?'}.\n` +
                                `Глаза Бездны (Stockfish) видят пути:\n` +
                                topLines.map((l, i) => `${i+1}. ${l.move} (Оценка: ${l.scoreText})`).join('\n') + `\n\n` +
                                `Контекст для тебя:\n` +
                                (isOnlyMove ? `Это критический момент! Есть только один спасительный/победный путь. Если игрок ошибется, он потеряет всё. Намекни на эту хрупкость.\n` : ``) +
                                (isCrushingAdvantage ? `Игрок доминирует, есть много путей к победе. Посоветуй играть надежно и безжалостно.\n` : ``) +
                                `Задача: Дай игроку совет на 1-2 предложения (без прямых ходов, только концепция или угроза). Используй мрачный, мистический тон.`;

                let verdict = '<span class="icon-placeholder" data-icon="crystal-ball">🔮</span> Оракул вглядывается в вероятности...';
                
                if (topLines[0]) {
                    if (window.audioManager && topLines[0].scoreVal > 2.0 && !topLines[0].scoreText.includes('#-')) {
                        window.audioManager.playAmbient('Ambient/Frightening environment.mp3');
                    }
                }

                if (oracle) {
                    oracle.innerHTML += `
                        <div class="text-sm border-l-4 border-amber-500 pl-4 py-3 bg-amber-500/10 text-amber-300 font-bold glow-gold my-2 rounded-r-lg italic">
                            ${verdict}
                        </div>`;
                    oracle.scrollTop = oracle.scrollHeight;
                }

                const scoreForOracle = topLines[0] ? topLines[0].scoreText : '?';
                fetchOracleComment(badFen, scoreForOracle, uciMove, oracle, aiContext);
            }
        };
    } else {
        // Stockfish not ready — still try Oracle
        fetchOracleComment(badFen, '?', uciMove, oracle);
    }
}

// ── Win ──────────────────────────────────────────────────────────────
function winPuzzle() {
    if (window.puzzleChess && window.puzzleChess.in_checkmate && window.puzzleChess.in_checkmate()) {
        if (window.audioManager) {
            window.audioManager.stopAll();
            window.audioManager.playSFX('Ambient/Mat.mp3');
        }
    }

    const oracle = document.getElementById('oracle-messages');
    const placeholder = document.getElementById('oracle-placeholder');
    if (placeholder) placeholder.style.display = 'none';

    if (oracle) {
        oracle.innerHTML += `
            <div class="text-sm border-l-4 border-green-500 pl-4 py-3 bg-green-900/15 text-green-400 font-bold mb-2 rounded-r-lg">
                <span class="icon-placeholder" data-icon="sparkles">✨</span> Испытание пройдено! Тьма отступила. Врата открываются.
            </div>`;

        if (currentPuzzleData && currentPuzzleData.rating >= 2500) {
            oracle.innerHTML += `
                <div class="text-sm border-l-4 border-purple-500 pl-4 py-3 bg-purple-900/20 text-purple-300 font-bold glow-azure mb-2 rounded-r-lg">
                    <span class="icon-placeholder" data-icon="trophy">🏆</span> Лорд превзошёл мастеров прошлого! Пророчество исполняется.
                </div>`;
        }
        oracle.scrollTop = oracle.scrollHeight;
    }

    const nextBtn = document.getElementById('next-puzzle-btn');
    if (nextBtn) { nextBtn.style.opacity = '1'; nextBtn.style.pointerEvents = 'auto'; }

    window.solvedPuzzlesTotal++;
    syncSolvedCounters();

    // Reward XP
    if (window.progressionManager) {
        window.progressionManager.addXP(25);
    }

    if (currentPuzzleData) saveProgressToCloudflare(currentPuzzleData.id);
}

/** Keep all solved-count displays in sync */
function syncSolvedCounters() {
    const n = window.solvedPuzzlesTotal;
    ['puzzles-solved-total', 'puzzles-solved-total-grid', 'puzzles-solved-total-m'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = n;
    });
}


window.nextPuzzle = function() {
    const boardOuter = document.querySelector('.puzzle-board-outer');
    if (boardOuter) {
        boardOuter.classList.remove('animate-page-turn');
        void boardOuter.offsetWidth; // trigger reflow
        boardOuter.classList.add('animate-page-turn');
    }
    getNewPuzzle(); 
};

// ── Cloud Save & Fetch ────────────────────────────────────────────────
async function fetchCloudProgress() {
    try {
        if (!window.myAuthorId) return;
        const base = window.API_URL.replace(/\/$/, '');
        const res  = await fetch(`${base}/progress?id=${window.myAuthorId}`);
        if (res.ok) {
            const data = await res.json();
            if (data.count !== undefined) {
                window.solvedPuzzlesTotal = data.count;
                syncSolvedCounters();
            }
        }
    } catch (e) { /* offline ok */ }
}

async function saveProgressToCloudflare(puzzleId) {
    try {
        if (!window.myAuthorId) return;
        const base = window.API_URL.replace(/\/$/, '');
        await fetch(`${base}/save-progress`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                author_id: window.myAuthorId,
                puzzle_id: puzzleId,
                timestamp: Date.now()
            })
        });
    } catch (e) { /* offline ok */ }
}

// ── Mobile Oracle Swipe ───────────────────────────────────────────────
function attachOracleSwipe() {
    const panel = document.getElementById('puzzle-oracle-panel');
    if (!panel) return;

    let startY = 0;
    panel.addEventListener('touchstart', e => { startY = e.touches[0].clientY; }, { passive: true });
    panel.addEventListener('touchmove', e => {
        const dy = e.touches[0].clientY - startY;
        if (dy > 60) collapseOracle();
        else if (dy < -60) expandOracle();
    }, { passive: true });
}

function collapseOracle() {
    const panel = document.getElementById('puzzle-oracle-panel');
    if (panel) { panel.classList.add('oracle-collapsed'); panel.classList.remove('oracle-expanded'); }
    const toggle = document.getElementById('oracle-toggle-btn');
    if (toggle) toggle.textContent = '▲ Оракул';
}
function expandOracle() {
    const panel = document.getElementById('puzzle-oracle-panel');
    if (panel) { panel.classList.remove('oracle-collapsed'); panel.classList.add('oracle-expanded'); }
    const toggle = document.getElementById('oracle-toggle-btn');
    if (toggle) toggle.textContent = '▼ Оракул';
}
window.toggleOracle = function() {
    const panel = document.getElementById('puzzle-oracle-panel');
    if (!panel) return;
    panel.classList.contains('oracle-collapsed') ? expandOracle() : collapseOracle();
};

// ── Theme Translations (RU labels for chips) ─────────────────────────
const THEME_TRANSLATIONS = {
    opening:'Дебют', middlegame:'Миттельшпиль', endgame:'Эндшпиль',
    rookEndgame:'Ладейный эндшпиль', pawnEndgame:'Пешечный эндшпиль',
    knightEndgame:'Коневой эндшпиль', bishopEndgame:'Слоновый эндшпиль',
    queenEndgame:'Ферзевый эндшпиль', queenRookEndgame:'Ф+Л эндшпиль',
    fork:'Вилка', pin:'Связка', skewer:'Рентген', sacrifice:'Жертва',
    quietMove:'Тихий ход', zugzwang:'Цугцванг', deflection:'Отвлечение',
    interference:'Перекрытие', xRayAttack:'Рентген-атака',
    discoveredAttack:'Вскрытый удар', doubleCheck:'Двойной шах',
    intermezzo:'Промежуточный ход', trappedPiece:'Пойманная фигура',
    mate:'Мат', mateIn1:'Мат в 1', mateIn2:'Мат в 2', mateIn3:'Мат в 3',
    mateIn4:'Мат в 4', mateIn5:'Мат в 5+',
    anastasiasMate:'Мат Анастасии', arabianMate:'Арабский мат',
    smotheredMate:'Спёртый мат', epauletteMate:'Эполетный мат',
    hookMate:'Хук-мат', backRankMate:'Мат на последней',
    bodensMate:'Мат Бодена', doubleBishopMate:'Мат двумя слонами',
    equality:'Уравнение', advantage:'Преимущество', crush:'Разгром',
    castling:'Рокировка', enPassant:'Взятие на проходе',
    underPromotion:'Слабое превращение', promotion:'Превращение',
    short:'Короткая', long:'Длинная', oneMove:'Один ход',
};
window.THEME_TRANSLATIONS = THEME_TRANSLATIONS;

// ── Oracle of the Abyss — Gemini Commentary via Worker ───────────────
async function fetchOracleComment(fen, scoreText, lastMove, oracleEl, aiContext = null) {
    if (!window.ORACLE_WORKER_URL) return;

    // Detect current language
    const lang = (typeof currentLang !== 'undefined') ? currentLang : 'ru';
    const avatar = document.getElementById('oracle-avatar');

    // Show thinking placeholder
    const thinkingId = 'oracle-thinking-' + Date.now();
    if (oracleEl) {
        oracleEl.innerHTML += `
            <div id="${thinkingId}" class="text-sm border-l-4 border-[#c2a3ff]/50 pl-4 py-3 bg-[#c2a3ff]/5 text-[#c2a3ff] italic my-2 rounded-r-lg animate-pulse">
                <span class="text-xs uppercase tracking-widest block mb-1 opacity-70"><span class="icon-placeholder" data-icon="icon-unknown">👁</span>️ Оракул</span>
                ${window.t ? window.t('oracle_thinking') : 'Оракул изрекает...'}
            </div>`;
        oracleEl.scrollTop = oracleEl.scrollHeight;
    }
    
    // Set avatar to thinking
    if (avatar) avatar.className = 'oracle-thinking';

    try {
        const resp = await fetch(window.ORACLE_WORKER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fen, score: scoreText, lastMove, lang, aiContext })
        });

        if (!resp.ok) throw new Error('Worker returned ' + resp.status);
        const data = await resp.json();
        const comment = data.comment || '...Бездна молчит...';

        if (oracleEl) {
            const placeholder = document.getElementById(thinkingId);
            if (placeholder) {
                placeholder.classList.remove('animate-pulse');
                placeholder.innerHTML = `
                    <span class="text-xs uppercase tracking-widest block mb-1 text-[#c2a3ff]/70"><span class="icon-placeholder" data-icon="icon-unknown">👁</span>️ Оракул Бездны</span>
                    <span class="text-[#c2a3ff]">${comment}</span>`;
            }
            oracleEl.scrollTop = oracleEl.scrollHeight;
        }

        // Set avatar to speaking then idle
        if (avatar) {
            avatar.className = 'oracle-speaking';
            setTimeout(() => { if (avatar.className === 'oracle-speaking') avatar.className = 'oracle-idle'; }, 2000);
        }
    } catch (_) {
        // Worker unreachable — remove placeholder silently
        if (oracleEl) {
            const placeholder = document.getElementById(thinkingId);
            if (placeholder) placeholder.remove();
        }
        if (avatar) avatar.className = 'oracle-idle';
    }
}

// ── Cursed Capture VFX Particles ─────────────────────────────────────
function spawnCaptureVFX(squareId) {
    const board = document.getElementById('puzzle-board');
    if (!board) return;
    const sqEl = board.querySelector(`[data-square="${squareId}"]`);
    if (!sqEl) return;

    const rect = sqEl.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const particleCount = 10 + Math.floor(Math.random() * 5); // 10-14 particles

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'vfx-particle';
        
        // Initial pos
        particle.style.left = centerX + 'px';
        particle.style.top = centerY + 'px';
        particle.style.transform = 'translate(-50%, -50%) scale(1)';
        particle.style.opacity = '1';

        document.body.appendChild(particle);

        // Random explode vectors
        const angle = Math.random() * Math.PI * 2;
        const velocity = 30 + Math.random() * 60; // Distance
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity - 20; // Slight upward bias
        const duration = 400 + Math.random() * 200;

        // Force reflow
        void particle.offsetWidth;

        particle.style.transition = `transform ${duration}ms cubic-bezier(0.1, 0.8, 0.3, 1), opacity ${duration}ms ease-out`;
        particle.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0)`;
        particle.style.opacity = '0';

        setTimeout(() => {
            if (particle.parentNode) particle.parentNode.removeChild(particle);
        }, duration);
    }
}

// ── Tactile Haptics for Navigation ───────────────────────────────────
document.addEventListener('pointerdown', (e) => {
    const btn = e.target.closest('.pnav-btn, .glass-button-gold, .glass-button-outline');
    if (btn && navigator.vibrate) {
        navigator.vibrate(15);
    }
});
