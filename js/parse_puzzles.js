/**
 * parse_puzzles.js — Chess Saga "Great Book of Tactics"
 *
 * Extracts 100,000 high-quality puzzles from lichess_db_puzzle.csv
 * with a balanced distribution across rating tiers AND all Lichess themes.
 *
 * OUTPUT: js/puzzles.json  (~18–20 MB, flat JSON array, compact)
 *
 * RUN:  node scripts/parse_puzzles.js
 */

const fs      = require('fs');
const readline = require('readline');
const path    = require('path');

// ── Paths ─────────────────────────────────────────────────────────────────────
const CSV_FILE = path.join(__dirname, '..', 'lichess_db_puzzle.csv');
const OUT_FILE = path.join(__dirname, '..', 'js', 'puzzles.json');

// ── Targets (total = 100 000) ─────────────────────────────────────────────────
// Distribution: 20% easy  /  55% medium  /  25% hard
const TARGET = {
    easy:   20000,   // rating  500–1000
    medium: 55000,   // rating 1001–2000
    hard:   25000,   // rating 2001–3500+
};

// ── Priority themes — ensure every key theme is well represented ──────────────
// Each theme gets a mini-cap so we don't end up with 60k "middlegame" only.
// After caps are blown, remaining slots fill freely.
const THEME_MINI_CAPS = {
    mateIn1: 3000, mateIn2: 4000, mateIn3: 3000, mateIn4: 2000,
    smotheredMate: 600, anastasiasMate: 600, arabianMate: 600,
    epauletteMate: 600, hookMate: 600, backRankMate: 1500,
    bodensMate: 300, doubleBishopMate: 300,
    fork: 4000, pin: 4000, skewer: 2000, sacrifice: 4000,
    deflection: 3000, discoveredAttack: 2000, doubleCheck: 1000,
    interference: 1000, xRayAttack: 1500, zugzwang: 1000,
    quietMove: 2000, intermezzo: 1000, trappedPiece: 1000,
    castling: 400, enPassant: 400, underPromotion: 400, promotion: 1000,
    equality: 2000, advantage: 3000, crush: 3000,
    opening: 3000, middlegame: 10000, endgame: 8000,
    rookEndgame: 3000, pawnEndgame: 3000, knightEndgame: 1500,
    bishopEndgame: 1500, queenEndgame: 1500, queenRookEndgame: 500,
    oneMove: 3000, long: 2000, short: 3000,
};

// ── State ─────────────────────────────────────────────────────────────────────
const buckets = { easy: [], medium: [], hard: [] };
const themeCounts = {};    // tracks how many per theme we've collected
let totalCollected = 0;
const TOTAL_TARGET   = TARGET.easy + TARGET.medium + TARGET.hard;

// ── Helpers ───────────────────────────────────────────────────────────────────
function tierOf(rating) {
    if (rating >= 500 && rating <= 1000) return 'easy';
    if (rating > 1000 && rating <= 2000) return 'medium';
    if (rating > 2000) return 'hard';
    return null;
}

function isTierFull(tier) {
    return buckets[tier].length >= TARGET[tier];
}

/**
 * Returns true if at least one theme in this puzzle still needs more entries
 * (mini-cap not yet reached). Puzzles that fill a needed theme slot are
 * always accepted (space permitting). Puzzles with all themes satisfied are
 * accepted as free-fill.
 */
function isThemeWanted(themes) {
    if (!themes) return true; // no theme data → accept freely
    const arr = themes.split(' ');
    for (const t of arr) {
        const cap = THEME_MINI_CAPS[t];
        if (cap === undefined) continue;   // not a tracked theme
        const have = themeCounts[t] || 0;
        if (have < cap) return true;        // still needed
    }
    return false; // all tracked themes for this puzzle are already saturated
}

function recordThemes(themes) {
    if (!themes) return;
    for (const t of themes.split(' ')) {
        themeCounts[t] = (themeCounts[t] || 0) + 1;
    }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function parsePuzzles() {
    if (!fs.existsSync(CSV_FILE)) {
        console.error(`\n❌  File not found: ${CSV_FILE}`);
        console.error('Please extract lichess_db_puzzle.csv.zst into the project root first.\n');
        process.exit(1);
    }

    console.log('📖  Reading Lichess puzzle database...');
    console.log(`🎯  Target: ${TOTAL_TARGET.toLocaleString()} puzzles (Easy ${TARGET.easy.toLocaleString()} / Medium ${TARGET.medium.toLocaleString()} / Hard ${TARGET.hard.toLocaleString()})\n`);

    const fileStream = fs.createReadStream(CSV_FILE, { encoding: 'utf8' });
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    let isHeader = true;
    let rowsRead = 0;

    for await (const line of rl) {
        if (isHeader) { isHeader = false; continue; }
        rowsRead++;

        // CSV: PuzzleId,FEN,Moves,Rating,RatingDeviation,Popularity,NbPlays,Themes,GameUrl,OpeningTags
        const parts = line.split(',');
        if (parts.length < 8) continue;

        const rating     = parseInt(parts[3], 10);
        const popularity = parseInt(parts[5], 10);
        const themes     = parts[7] || '';

        if (isNaN(rating)) continue;

        // Quality gate: skip very low-popularity puzzles (noisy/wrong)
        // Looser than before (60 instead of 80) so we can fill 100k
        if (popularity < 60) continue;

        const tier = tierOf(rating);
        if (!tier || isTierFull(tier)) continue;

        // Accept if: theme still needed  OR  random free-fill (1-in-3 chance to avoid all-same-theme bias)
        const wantedTheme = isThemeWanted(themes);
        if (!wantedTheme && Math.random() > 0.33) continue;

        const puzzle = {
            id:     parts[0],
            fen:    parts[1],
            moves:  parts[2],
            rating: rating,
            themes: themes,
        };

        buckets[tier].push(puzzle);
        recordThemes(themes);
        totalCollected++;

        if (rowsRead % 500000 === 0) {
            console.log(`  … ${(rowsRead/1e6).toFixed(1)}M rows scanned | collected ${totalCollected.toLocaleString()} / ${TOTAL_TARGET.toLocaleString()}`);
            console.log(`    Easy ${buckets.easy.length} / ${TARGET.easy}   Medium ${buckets.medium.length} / ${TARGET.medium}   Hard ${buckets.hard.length} / ${TARGET.hard}`);
        }

        if (totalCollected >= TOTAL_TARGET) {
            console.log('\n✅  All targets reached. Stopping.\n');
            rl.close();
            break;
        }
    }

    // ── Summary ──────────────────────────────────────────────────────────────
    const output = [...buckets.easy, ...buckets.medium, ...buckets.hard];

    console.log('─'.repeat(50));
    console.log(`Total collected : ${output.length.toLocaleString()} puzzles`);
    console.log(`  Easy          : ${buckets.easy.length.toLocaleString()}`);
    console.log(`  Medium        : ${buckets.medium.length.toLocaleString()}`);
    console.log(`  Hard          : ${buckets.hard.length.toLocaleString()}`);

    // Top 15 theme counts
    const topThemes = Object.entries(themeCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15);
    console.log('\n📊  Top themes collected:');
    topThemes.forEach(([t, n]) => console.log(`    ${t.padEnd(22)} ${n.toLocaleString()}`));
    console.log('─'.repeat(50));

    // Write compact JSON (no indentation → smaller file)
    fs.writeFileSync(OUT_FILE, JSON.stringify(output), 'utf8');

    const sizeMB = (fs.statSync(OUT_FILE).size / 1048576).toFixed(1);
    console.log(`\n💾  Saved → ${OUT_FILE}`);
    console.log(`    Size: ${sizeMB} MB\n`);
}

parsePuzzles().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
