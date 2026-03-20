const TUTORIAL_STEPS = [
    {
        id: "tut_menu_start",
        view: "menu",
        selector: "button[onclick='startGame()']",
        action: "click",
        image: "Visualization/Lily/lilith_1.png",
        text: { ru: "Я — Лилит, Хранительница этого места. Нам предстоит долгий путь. Нажми «Начать битву», дабы открыть первую страницу нашего гримуара." }
    },
    {
        id: "tut_game_move1",
        view: "game",
        selector: ".square.active-target",
        action: "expectedMove",
        expectedMove: "e2e4",
        image: "Visualization/Lily/lilith_6.png",
        text: { ru: "Взгляни на доску. Поле брани ждет приказов. Сделай смелый шаг пешкой от короля (e4)." }
    },
    {
        id: "tut_game_move2",
        view: "game",
        selector: ".square.active-target",
        action: "expectedMove",
        expectedMove: "f1c4",
        image: "Visualization/Lily/lilith_6.png",
        text: { ru: "Смотри внимательно на эту диагональ. Выведи слона на c4, нацелившись на слабую пешку f7." }
    },
    {
        id: "tut_game_move3",
        view: "game",
        selector: ".square.active-target",
        action: "expectedMove",
        expectedMove: "d1h5",
        image: "Visualization/Lily/lilith_6.png",
        text: { ru: "Продолжай наступление. Ферзь выходит на h5. Твой противник вот-вот совершит роковую ошибку." }
    },
    {
        id: "tut_game_oracle",
        view: "game",
        selector: "#chronicle-sheet",
        action: "next",
        image: "Visualization/Lily/lilith_3.png",
        text: { ru: "Ха... Глупец делает ход конем (Nf6). Какая самоуверенность. Взгляни на послания — там уже высмеивают его недальновидность." }
    },
    {
        id: "tut_game_mate",
        view: "game",
        selector: ".square.active-target",
        action: "expectedMove",
        expectedMove: "h5f7",
        image: "Visualization/Lily/lilith_3.png",
        text: { ru: "Пора заканчивать это представление. Нанеси смертельный удар на f7. Шах и мат." }
    },
    {
        id: "tut_game_save",
        view: "game",
        selector: "button[onclick='openEditor()']",
        action: "click",
        image: "Visualization/Lily/lilith_2.png",
        text: { ru: "Эта партия достойна изучения. Открой Кузницу, чтобы записать её в анналы истории." }
    },
    {
        id: "tut_forge_intro",
        view: "forge",
        selector: "#editor-step-form",
        action: "next",
        image: "Visualization/Lily/lilith_5.png",
        text: { ru: "В Кузнице ты — Творец. Позволь магии изменить эту историю и приукрасить твой триумф." }
    },
    {
        id: "tut_forge_edit",
        view: "forge",
        selector: "#icon-selector-container",
        action: "click",
        image: "Visualization/Lily/lilith_5.png",
        text: { ru: "Выбери подходящую руну. Сделай свою победу ярче, чтобы другие Лорды затрепетали." }
    },
    {
        id: "tut_forge_publish",
        view: "forge",
        selector: "button[onclick='publishStory()']",
        action: "click",
        image: "Visualization/Lily/lilith_5.png",
        text: { ru: "Отлично. А теперь нажми «Высечь в Свитках», пусть твое творение сохранится для потомков." }
    },
    {
        id: "tut_community_like",
        view: "community",
        selector: ".community-like-btn",
        action: "click",
        image: "Visualization/Lily/lilith_1.png",
        text: { ru: "Зал Свитков. Оцени труд других или поставь отметку своему творению, прояви благосклонность." }
    },
    {
        id: "tut_to_puzzles",
        view: "community",
        selector: ".btn-exit-x",
        action: "click",
        image: "Visualization/Lily/lilith_1.png",
        text: { ru: "Твоя слава увековечена. Закрой окно и перейди в «Испытания Бездны» — пришло время отточить разум." }
    },
    {
        id: "tut_level_up",
        view: "puzzles",
        selector: ".player-profile-container",
        action: "next",
        image: "Visualization/Lily/lilith_2.png",
        text: { ru: "Твой Том Знаний пополняется, уровень повышен! Знания — это сила. Заглядывай сюда, чтобы менять облик." }
    },
    {
        id: "tut_settings_final",
        view: "puzzles",
        selector: "button[onclick='window.settingsManager.openModal()']",
        action: "click",
        image: "Visualization/Lily/lilith_5.png",
        text: { ru: "Шестеренка судьбы. Здесь ты управляешь самой тканью этого мира. На этом мой вводный урок окончен, Лорд." }
    }
];

class TutorialManager {
    constructor() {
        this.steps = TUTORIAL_STEPS;
        this.currentStepIndex = -1;
        this.isActive = false;
        this.overlay = null;
        this.dialog = null;
        this.portrait = null;
        this.textArea = null;
        this.nextBtn = null;

        this.typewriterInterval = null;
        this.typewriterText = "";
        this.typewriterIndex = 0;
        this.isTyping = false;

        this.highlightedElement = null;
        this.clickListener = null;
        this.nextListener = null;

        this._initUI();
    }

    _initUI() {
        // Create Overlay
        this.overlay = document.createElement("div");
        this.overlay.className = "tutorial-overlay";
        document.body.appendChild(this.overlay);

        // Create Dialog Container
        this.dialog = document.createElement("div");
        this.dialog.className = "tutorial-dialog";

        // Portrait
        const portraitCont = document.createElement("div");
        portraitCont.className = "tutorial-portrait-container";
        this.portrait = document.createElement("img");
        this.portrait.className = "tutorial-portrait";
        portraitCont.appendChild(this.portrait);
        this.dialog.appendChild(portraitCont);

        // Content Area
        const contentArea = document.createElement("div");
        contentArea.className = "tutorial-content";

        this.textArea = document.createElement("div");
        this.textArea.className = "tutorial-text";
        contentArea.appendChild(this.textArea);

        this.nextBtn = document.createElement("button");
        this.nextBtn.className = "tutorial-next-btn";
        this.nextBtn.innerHTML = "Далее";
        contentArea.appendChild(this.nextBtn);

        this.dialog.appendChild(contentArea);
        document.body.appendChild(this.dialog);

        // Dialog Click Handler (to skip typewriter or click next)
        this.dialog.addEventListener("click", () => {
            if (this.isTyping) {
                this._skipTypewriter();
            } else if (this.currentStep && this.currentStep.action === "next") {
                this.nextStep();
            }
        });

        this.nextBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (this.currentStep && this.currentStep.action === "next") {
                this.nextStep();
            }
        });
    }

    start() {
        if (this.isActive) return;
        this.isActive = true;
        this.currentStepIndex = 0;
        this.overlay.classList.add("active");
        this.dialog.classList.add("active");

        this._renderStep();
    }

    end() {
        this.isActive = false;
        this.currentStepIndex = -1;
        this.overlay.classList.remove("active");
        this.dialog.classList.remove("active");
        this._clearHighlight();
        this._clearListeners();

        if (this.typewriterInterval) {
            clearInterval(this.typewriterInterval);
        }
    }

    nextStep() {
        if (!this.isActive) return;

        // BUGFIX: clear listeners FIRST (while highlightedElement is still set),
        // THEN clear the highlight reference.
        this._clearListeners();
        this._clearHighlight();

        this.currentStepIndex++;
        if (this.currentStepIndex >= this.steps.length) {
            this.end();
        } else {
            this._renderStep();
        }
    }

    checkMove(move) {
        if (!this.isActive || !this.currentStep) return false;
        // BUGFIX: only intercept moves when the tutorial step is in-game
        if (this.currentStep.view !== 'game') return false;

        if (this.currentStep.action === "expectedMove") {
            if (this.currentStep.expectedMove === move) {
                this.nextStep();
                return true;
            } else {
                // Optionally show a visual indicator of wrong move
                return false;
            }
        }
        return false;
    }

    _renderStep() {
        const step = this.steps[this.currentStepIndex];
        this.currentStep = step;

        // Check if view matches
        // In real integration, you might want to automatically switch views here.
        // e.g. if (step.view === 'menu') showMainMenu();

        // Update Portrait
        if (step.image) {
            this.portrait.src = step.image;
            this.portrait.style.display = 'block';
        } else {
            this.portrait.style.display = 'none';
        }

        // Start Typewriter
        this._startTypewriter(step.text.ru || step.text.en);

        // Apply Highlight
        this._applyHighlight(step.selector);

        // Handle Action
        this.nextBtn.classList.remove("visible");
        if (step.action === "click" && this.highlightedElement) {
            this.clickListener = (e) => {
                this.nextStep();
            };
            this.highlightedElement.addEventListener("click", this.clickListener, { once: true });
        } else if (step.action === "next") {
            // Wait for typewriter to finish to show Next button, handled in _finishTypewriter
        } else if (step.action === "expectedMove") {
            // Waiting for checkMove call
        }
    }

    _applyHighlight(selector) {
        if (!selector) return;

        // Small delay to ensure dynamic elements are in DOM
        setTimeout(() => {
            const el = document.querySelector(selector);
            if (el) {
                this.highlightedElement = el;
                this.highlightedElement.classList.add("tutorial-highlight");
                // Ensure element positions properly if static
                const currentPos = window.getComputedStyle(el).position;
                if (currentPos === "static") {
                    el.style.position = "relative";
                }
            } else {
                console.warn("TutorialManager: Element not found for selector: " + selector);
            }
        }, 100);
    }

    _clearHighlight() {
        if (this.highlightedElement) {
            this.highlightedElement.classList.remove("tutorial-highlight");
            // BUGFIX: remove inline position set during highlight to avoid layout pollution
            this.highlightedElement.style.position = '';
            this.highlightedElement = null;
        }
    }

    _clearListeners() {
        // BUGFIX: use highlightedElement directly (called before _clearHighlight now)
        if (this.highlightedElement && this.clickListener) {
            this.highlightedElement.removeEventListener("click", this.clickListener);
        }
        this.clickListener = null;
    }

    _startTypewriter(text) {
        if (this.typewriterInterval) clearInterval(this.typewriterInterval);

        this.typewriterText = text;
        this.typewriterIndex = 0;
        this.isTyping = true;
        this.textArea.innerHTML = '<span class="tutorial-cursor"></span>';
        if (this.portrait) this.portrait.classList.add('speaking');

        this.typewriterInterval = setInterval(() => {
            if (this.typewriterIndex < this.typewriterText.length) {
                const currentHTML = this.typewriterText.substring(0, this.typewriterIndex + 1);
                this.textArea.innerHTML = currentHTML + '<span class="tutorial-cursor"></span>';
                this.typewriterIndex++;
            } else {
                this._finishTypewriter();
            }
        }, 35); // Text print speed
    }

    _skipTypewriter() {
        if (this.typewriterInterval) clearInterval(this.typewriterInterval);
        this.textArea.innerHTML = this.typewriterText;
        if (this.portrait) this.portrait.classList.remove('speaking');
        this._finishTypewriter();
    }

    _finishTypewriter() {
        this.isTyping = false;
        if (this.portrait) this.portrait.classList.remove('speaking');
        if (this.currentStep && this.currentStep.action === "next") {
            this.nextBtn.classList.add("visible");
        }
    }
}

// Expose globally
window.tutorialManager = new TutorialManager();
