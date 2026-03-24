window.figuresPath = "Visualization/figures/";

window.selectedScenarioKey = 'argus';
window.currentStep = 0;
window.maxReachedStep = 0; 
window.boardState = [];
window.historyStates = []; 
window.gameFlipped = false; // Флаг для игры за черных (переворот доски)

window.finalizeTurnLogic = function() {
    const sc = window.scenarios[window.selectedScenarioKey];
    if (sc && window.currentStep < sc.story.length && sc.story[window.currentStep].turn === 'black' && window.currentStep === window.maxReachedStep) {
        setTimeout(window.processMove, 600); 
    }
}

window.initBoard = function() {
    window.boardState = [
        ['b_rook', 'b_knight', 'b_bishop', 'b_queen', 'b_king', 'b_bishop', 'b_knight', 'b_rook'],
        ['b_pawn', 'b_pawn', 'b_pawn', 'b_pawn', 'b_pawn', 'b_pawn', 'b_pawn', 'b_pawn'],
        ['','','','','','','',''],['','','','','','','',''],['','','','','','','',''],['','','','','','','',''],
        ['w_pawn', 'w_pawn', 'w_pawn', 'w_pawn', 'w_pawn', 'w_pawn', 'w_pawn', 'w_pawn'],
        ['w_rook', 'w_knight', 'w_bishop', 'w_queen', 'w_king', 'w_bishop', 'w_knight', 'w_rook']
    ];
    window.historyStates = [JSON.parse(JSON.stringify(window.boardState))];
}

window.selectScenario = function(key, el) {
    window.selectedScenarioKey = key;
    document.querySelectorAll('.scenario-card').forEach(c => c.classList.remove('active'));
    // BUGFIX: pass element explicitly instead of relying on deprecated global `event`
    if (el) el.classList.add('active');
}

window.startGame = function() {
    if(typeof window.isMainMenu !== 'undefined') window.isMainMenu = false; 
    if(typeof resumeAudio === 'function') resumeAudio();
    if(typeof applyMenuVolumeLogic === 'function') applyMenuVolumeLogic();
    
    if (!window.scenarios[window.selectedScenarioKey]) {
        window.selectedScenarioKey = 'argus';
    }
    
    const sc = window.scenarios[window.selectedScenarioKey];
    
    window.currentStep = 0; window.maxReachedStep = 0; window.gameFlipped = false;
    if(typeof window.isSpeaking !== 'undefined') window.isSpeaking = false;

    const goalsHeader = document.querySelector('.right-panel h3.text-sky-400');
    const egoalsHeader = document.querySelector('.right-panel h3.text-red-500');
    if (goalsHeader) goalsHeader.textContent = window.t('tasks_title');
    if (egoalsHeader) egoalsHeader.textContent = window.t('enemy_title');

    const goalsList = document.getElementById('goals-list');
    if (goalsList) goalsList.innerHTML = (sc.goals || []).map((g, i) => `<li id="g${i}">• ${g}</li>`).join('');
    else console.warn('Goals list not found, skipping');

    const enemyGoals = document.getElementById('enemy-goals');
    if (enemyGoals) enemyGoals.innerHTML = (sc.egoals || []).map((g, i) => `<li id="eg${i}">• ${g}</li>`).join('');
    else console.warn('Enemy goals list not found, skipping');
    
    const chronicleList = document.getElementById('chronicle-list');
    if (chronicleList) chronicleList.innerHTML = '';
    else console.warn('Chronicle list not found, skipping');

    const moveCounter = document.getElementById('move-counter');
    if (moveCounter) moveCounter.textContent = `${window.t('move_counter')}1`;

    const playerTurn = document.getElementById('player-turn');
    if (playerTurn) playerTurn.textContent = window.t('turn_white');

    const visualStage = document.getElementById('visual-stage');
    if (visualStage) visualStage.innerHTML = `<span style="font-size: 4rem;">🏰</span>`;

    const sceneTitle = document.getElementById('scene-title');
    if (sceneTitle) sceneTitle.textContent = sc.title || window.t('calm_title');

    const sceneDesc = document.getElementById('scene-desc');
    if (sceneDesc) sceneDesc.textContent = window.t('calm_desc');

    const mainMenu = document.getElementById('main-menu');
    if (mainMenu) mainMenu.style.opacity = '0';

    setTimeout(() => {
        if (mainMenu) mainMenu.style.display = 'none';
        const mainApp = document.getElementById('main-app');
        if (mainApp) mainApp.classList.add('app-visible');
        window.initBoard(); window.renderBoard();

        // ── MUSIC: switch to battle mode when the game begins ──────────────
        if (window.audioManager) window.audioManager.playStateBattle();
    }, 800);
}

window.toggleGameFlip = function() {
    window.gameFlipped = !window.gameFlipped;
    window.renderBoard();
}

window.playCustomScenario = function(index) {
    window.selectedScenarioKey = 'custom_' + index;
    if(typeof closeCommunityModal === 'function') closeCommunityModal();
    window.startGame();
}

window.downloadFromGallery = function(index) {
    const p = window.scenarios['custom_' + index];
    if(!p) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(p));
    const dl = document.createElement('a');
    dl.setAttribute("href", dataStr);
    dl.setAttribute("download", p.title + ".json");
    document.body.appendChild(dl); dl.click(); dl.remove();
    if(typeof showNotification === 'function') showNotification(window.t('msg_scroll_downloaded'), "success");
}

window.renderBoard = function() {
    const boardEl = document.getElementById('board');
    if (!boardEl) return;
    boardEl.innerHTML = '';
    
    const sc = window.scenarios[window.selectedScenarioKey];
    const next = sc.story[window.currentStep];

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            // Логика переворота доски
            const r = window.gameFlipped ? 7 - row : row;
            const c = window.gameFlipped ? 7 - col : col;
            
            const sq = document.createElement('div');
            sq.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`; // цвет клетки не меняется от переворота массива
            const coord = `${String.fromCharCode(97 + c)}${8 - r}`;
            sq.dataset.coord = coord;
            
            if (!window.isSpeaking && window.currentStep === window.maxReachedStep && next && next.turn === 'white') {
                if (coord === next.move.substring(2, 4)) {
                    sq.classList.add('active-target'); 
                    sq.onclick = window.processMove;
                } else if (window.tutorialManager && window.tutorialManager.isActive) {
                    // Block wrong moves
                    if (window.boardState[r][c] && window.boardState[r][c].startsWith('w_')) {
                        sq.onclick = function() {
                            if (window.tutorialManager.portrait) {
                                window.tutorialManager.portrait.src = "Visualization/Lily/lilith_4.png";
                                window.tutorialManager._startTypewriter("Мы же договорились следовать плану.");
                            }
                            // Flash board to indicate error
                            const gameBoardOuter = document.querySelector('#main-app .chess-board-outer');
                            if (gameBoardOuter) {
                                gameBoardOuter.classList.add('shake-anim');
                                setTimeout(() => gameBoardOuter.classList.remove('shake-anim'), 400);
                            }
                        };
                    }
                }
            }
            
            if (window.boardState[r] && window.boardState[r][c]) {
                const img = document.createElement('img');
                img.src = `${window.figuresPath}${window.boardState[r][c]}.png`;
                img.className = 'piece-img'; 
                img.onerror = function() { this.style.display='none'; };
                sq.appendChild(img);
            }
            boardEl.appendChild(sq);
        }
    }
}

window.processMove = function() {
    if (window.isSpeaking || window.isAnimating) return;
    const sc = window.scenarios[window.selectedScenarioKey];
    if (window.currentStep >= sc.story.length) return;
    
    const data = sc.story[window.currentStep];
    const moveClean = data.move.replace(/[!+#]/g, '');
    let moveString = moveClean.substring(0, 4);

    if (window.tutorialManager && window.tutorialManager.isActive) {
        window.tutorialManager.checkMove(moveString);
    }

    const from = [8 - parseInt(moveClean[1]), moveClean.charCodeAt(0) - 97];
    const to = [8 - parseInt(moveClean[3]), moveClean.charCodeAt(2) - 97];
    
    // Обработка превращения пешки из строки (e7e8q)
    let movingPiece = window.boardState[from[0]][from[1]];
    if (moveClean.length > 4) {
        const promStr = moveClean[4];
        const pColor = data.turn === 'white' ? 'w' : 'b';
        const pieceMapNames = { 'q': 'queen', 'r': 'rook', 'b': 'bishop', 'n': 'knight' };
        movingPiece = `${pColor}_${pieceMapNames[promStr] || 'queen'}`;
    }

    window.boardState[to[0]][to[1]] = movingPiece;
    window.boardState[from[0]][from[1]] = '';
    window.historyStates.push(JSON.parse(JSON.stringify(window.boardState)));

    if (window.vfxManager) {
        if (data.capture) window.vfxManager.spawnShadowDeath(moveClean.substring(2, 4));
        if (movingPiece && movingPiece.includes('pawn') && !data.capture) window.vfxManager.spawnBloodTrail(moveClean.substring(0, 2), moveClean.substring(2, 4));
    }

    window.updateVisuals(data, true);
    
    // Lock inputs for 250ms vfx
    window.isAnimating = true;
    setTimeout(() => { window.isAnimating = false; }, 250);

    // ── ADAPTIVE MUSIC TRIGGERS ───────────────────────────────────────────────
    if (window.audioManager) {
        const totalSteps  = sc.story.length;
        const isLastStep  = (window.currentStep === totalSteps - 1);
        const inLateGame  = window.currentStep >= Math.floor(totalSteps * 0.55);
        const hotCapture  = data.capture && window.currentStep >= Math.floor(totalSteps * 0.3);

        if (isLastStep) {
            // ── CLIMAX: final move of the scenario ───────────────────────────
            window.audioManager.playStateClimax();
            const bd = document.querySelector('.chess-board-outer');
            if (bd) bd.classList.add('victory-flash');
        } else if (inLateGame || hotCapture) {
            // ── TENSION: second half of the story or an important capture ────
            window.audioManager.playStateTension();
        } else if (window.audioManager.currentMusicState === 'tension' || window.audioManager.currentMusicState === 'ambient') {
            // ── BATTLE: early game or after tension resolves (player stepped back) ─
            window.audioManager.playStateBattle();
        }
    }
    // ─────────────────────────────────────────────────────────────────────────

    const stepForAudio = window.currentStep;
    window.currentStep++; window.maxReachedStep = window.currentStep; 
    
    if (data.capture) {
        const bdOuter = document.querySelector('.chess-board-outer');
        if (bdOuter) {
            bdOuter.classList.remove('capture-flash');
            void bdOuter.offsetWidth;
            bdOuter.classList.add('capture-flash');
            setTimeout(() => bdOuter.classList.remove('capture-flash'), 300);
        }
    }
    
    window.renderBoard(); window.updateStats(data);  
    if(typeof speak === 'function') speak(data.text, data.turn, stepForAudio);
}

window.jumpToStep = function(stepIndex) {
    if (window.isSpeaking || window.isAnimating) return;
    const sc = window.scenarios[window.selectedScenarioKey];
    // BUGFIX: guard both maxReachedStep AND array length
    if (stepIndex < 0 || stepIndex > window.maxReachedStep || stepIndex >= sc.story.length) return;

    if (window.speechSynthesis) window.speechSynthesis.cancel();
    
    window.currentStep = stepIndex;
    window.boardState = JSON.parse(JSON.stringify(window.historyStates[window.currentStep]));

    if (window.currentStep > 0) {
        const data = sc.story[window.currentStep - 1];
        window.updateVisuals(data, false);
        let displayMove = Math.floor((window.currentStep - 1) / 2) + 1;
        document.getElementById('move-counter').textContent = `${window.t('move_counter')}${displayMove}`;
        document.getElementById('player-turn').textContent = window.currentStep % 2 === 0 ? window.t('turn_white') : window.t('turn_black');
    } else {
        document.getElementById('visual-stage').innerHTML = `<span style="font-size: 4rem;">🏰</span>`;
        document.getElementById('scene-title').textContent = sc.title || window.t('calm_title');
        document.getElementById('scene-desc').textContent = window.t('calm_desc');
        document.getElementById('move-counter').textContent = `${window.t('move_counter')}1`;
        document.getElementById('player-turn').textContent = window.t('turn_white');
    }
    
    window.renderBoard();
    if (window.currentStep === window.maxReachedStep && sc.story[window.currentStep] && sc.story[window.currentStep].turn === 'black') {
        window.finalizeTurnLogic();
    }
}

window.updateStats = function(data) {
    let displayMove = Math.floor((window.currentStep - 1) / 2) + 1;
    document.getElementById('move-counter').textContent = `${window.t('move_counter')}${displayMove}`;
    document.getElementById('player-turn').textContent = data.turn === 'white' ? window.t('turn_black') : window.t('turn_white');
}

window.updateVisuals = function(data, createLog) {
    if (data.capture) {
        document.getElementById('flash').classList.add('flash-active');
        setTimeout(() => document.getElementById('flash').classList.remove('flash-active'), 400);
        // Scope to #main-app so we never grab the puzzle board (both live in DOM simultaneously)
        const gameBoardOuter = document.querySelector('#main-app .chess-board-outer');
        if (gameBoardOuter) {
            // BUGFIX: force reflow so shake-anim restarts reliably on rapid clicks
            gameBoardOuter.classList.remove('shake-anim');
            void gameBoardOuter.offsetWidth;
            gameBoardOuter.classList.add('shake-anim');
            setTimeout(() => gameBoardOuter.classList.remove('shake-anim'), 400);
        }
    }
    
    const stage = document.getElementById('visual-stage');
    // Global render icon ensures emojis don't end up in img srcs
    stage.innerHTML = window.renderIcon ? window.renderIcon(data.icon, 'w-20 h-20 object-contain text-6xl') : `<span style="font-size: 4rem;">${data.icon || '⚔️'}</span>`;

    document.getElementById('scene-title').textContent = data.title;
    document.getElementById('scene-desc').textContent = data.text;

    if (createLog) {
        const logIndex = window.currentStep;
        const log = document.createElement('div');
        log.className = `log-entry text-sm border-l-4 pl-4 py-3 cursor-pointer transition-colors hover:bg-white/5 ${data.turn === 'black' ? 'border-slate-700 text-slate-400' : 'border-amber-500 text-slate-200 bg-amber-500/5'}`;
        log.onclick = () => window.jumpToStep(logIndex + 1);
        log.innerHTML = `<span class="uppercase font-bold text-xs block mb-1">${data.turn === 'white' ? window.t('player') : window.t('opponent')}</span>${window.escapeHTML ? window.escapeHTML(data.text) : data.text}`;
        document.getElementById('chronicle-list').appendChild(log);
        const box = document.getElementById('narrative-box'); box.scrollTop = box.scrollHeight;
    }

    if (data.goal !== undefined) {
        const g = document.getElementById(`g${data.goal}`);
        if(g) { 
            g.className = "text-green-500 font-bold transition-all"; 
            g.innerHTML = `<span style="margin-right:4px">✔️</span>` + g.innerText.replace('• ', '');
            g.style.textDecoration = "line-through";
        }
    }
    if (data.egoal !== undefined) {
        const eg = document.getElementById(`eg${data.egoal}`);
        if(eg) { 
            eg.className = "text-red-500 font-bold transition-all"; 
            eg.innerHTML = `<span style="margin-right:4px">✔️</span>` + eg.innerText.replace('• ', '');
            eg.style.textDecoration = "line-through";
        }
    }
}

window.exitToMenu = function() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if(typeof window.isMainMenu !== 'undefined') window.isMainMenu = true;
    // ── MUSIC: return to ambient before page reload ───────────────────────────
    if (window.audioManager) window.audioManager.playStateAmbient();
    if(typeof applyMenuVolumeLogic === 'function') applyMenuVolumeLogic();
    
    let flash = document.getElementById('flash');
    if(!flash) {
        flash = document.createElement('div');
        flash.id = 'flash';
        flash.className = 'flash-screen';
        document.body.appendChild(flash);
    }
    flash.style.background = 'black';
    flash.style.transition = 'opacity 0.8s ease';
    flash.style.pointerEvents = 'auto'; // Block clicks
    flash.style.opacity = '0';
    
    // Trigger reflow
    void flash.offsetWidth;
    flash.style.opacity = '1';

    setTimeout(() => { location.reload(); }, 800);
}

window.addEventListener('keydown', (e) => {
    const mainApp = document.getElementById('main-app');
    if (mainApp && mainApp.classList.contains('app-visible')) {
        if (e.key === "ArrowLeft")  window.jumpToStep(window.currentStep - 1);
        if (e.key === "ArrowRight") window.jumpToStep(window.currentStep + 1);
    }
});

// ==========================================
// ORACLE PANEL LOGIC
// ==========================================
window.gameOracleInterval = null;
window.updateGameOracle = function(text) {
    const textContainer = document.getElementById('game-oracle-text');
    if (!textContainer) return;
    
    const avatar = document.getElementById('oracle-avatar');
    if (avatar) {
        avatar.classList.remove('oracle-idle');
        avatar.classList.add('oracle-speaking');
    }

    // Clear any existing typing interval to prevent overlaps
    if (window.gameOracleInterval) {
        clearInterval(window.gameOracleInterval);
        window.gameOracleInterval = null;
    }
    
    textContainer.textContent = '';
    let i = 0;
    
    window.gameOracleInterval = setInterval(() => {
        if (i < text.length) {
            textContainer.textContent += text.charAt(i);
            i++;
            // Auto-scroll to bottom of the Oracle text panel
            textContainer.scrollTop = textContainer.scrollHeight;
        } else {
            clearInterval(window.gameOracleInterval);
            window.gameOracleInterval = null;
            if (avatar) {
                avatar.classList.remove('oracle-speaking');
                avatar.classList.add('oracle-idle');
            }
        }
    }, 35); // 35ms delay for classic typewriter effect
};

