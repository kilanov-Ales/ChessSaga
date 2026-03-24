// ═══════════════════════════════════════════════════════════
// ASSET MANAGER — Lazy loading & Caching system
// ═══════════════════════════════════════════════════════════
window.AssetManager = {
    cache: {},
    async fetchBlob(url) {
        if (this.cache[url]) return this.cache[url];
        try {
            const resp = await fetch(url);
            if (!resp.ok) throw new Error('Network response was not ok');
            const blob = await resp.blob();
            const blobUrl = URL.createObjectURL(blob);
            this.cache[url] = blobUrl;
            return blobUrl;
        } catch (e) {
            console.warn('[AssetManager] Failed to cache asset:', url, e);
            return url; // fallback to original url if cache fails
        }
    },
    loadTrack(key) { return this.fetchBlob(key); },
    loadImage(key) { return this.fetchBlob(key); }
};

// ═══════════════════════════════════════════════════════════
// SECURITY — HTML sanitization helper
// ═══════════════════════════════════════════════════════════
window.escapeHTML = function(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

// ═══════════════════════════════════════════════════════════
// ICON SYSTEM — Centralized emoji → image map
// All custom icons live in Visualization/
// Usage: window.iconSrc('🔥')  → 'Visualization/🔥.png'
//        window.iconImg('🔥', 'w-6 h-6') → full <img> tag with fallback
// ═══════════════════════════════════════════════════════════
window.ICON_MAP = {};

/**
 * Returns the image path for an emoji, or null if not in ICON_MAP.
 * @param {string} emoji
 * @returns {string|null}
 */
window.iconSrc = function (emoji) {
    return window.ICON_MAP[emoji] || null;
};

/**
 * Returns an <img> tag for the emoji with a text fallback.
 * @param {string} emoji  - the emoji character
 * @param {string} cls    - CSS classes for the <img>
 * @param {string} extra  - extra HTML attributes (optional)
 * @returns {string}      - HTML string
 */
window.iconImg = function (emoji, cls = 'w-6 h-6 object-contain', extra = '') {
    const src = window.iconSrc(emoji);
    if (src) {
        return `<img src="${src}" class="${cls}" ${extra} onerror="this.outerHTML='<span class=\\'icon-placeholder\\' data-icon=\\'${emoji}\\'>${emoji}</span>'">`;
    }
    // Simple text fallback for emojis
    return `<span class="icon-placeholder ${cls}" data-icon="${emoji}" ${extra}>${emoji}</span>`;
};

window.API_URL = 'https://chess-api.kilanov.workers.dev/';
window.scenarios = {};
window.userLikes = JSON.parse(localStorage.getItem('chess_saga_likes') || '{}');
window._cachedGalleryParties = [];

const dict = {
    ru: {
        checking_archives: "Проверка архивов...", name_yourself: "Назови себя, Лорд", name_desc: "Имя будет высечено в камне навечно и сохранено в облаке.",
        enter_chronicles: "Войти в летопись", choose_chapter: "Выберите главу истории", argus_title: "Свет Аргуса", argus_desc: "Поучительная история о самопожертвовании.",
        standard_title: "Знамя Света", standard_desc: "Орден Юстициария против Клана Кровавого Тотема.", traxler_title: "Судьба Тракслера", traxler_desc: "Безумный гамбит и падение Белого Солнца.",
        btn_start: "НАЧАТЬ БИТВУ", btn_forge: "КУЗНИЦА", btn_scrolls: "ЗАЛ СВИТКОВ", raven_mail: "Воронья Почта", chat_loading: "Вороны летят с письмами...",
        chat_send: "Отправить", settings_title: "Настройки Королевства", music_vol: "Музыка Битвы", voice_vol: "Голос Летописца", current_lord: "Текущий Лорд:",
        scrolls_title: "Свитки других Лордов", calm_title: "Затишье", calm_desc: "Армии ждут...", tasks_title: "Задачи", enemy_title: "Враг", chronicle_title: "Хроника",
        forge_title: "Кузница Сценариев", make_moves: "Творите историю на поле брани", forge_publish: "Высечь в Свитках", forge_download: "Скачать Архив",
        forge_empty: "Кузница пуста. Скуйте первый ход...", forge_undo: "Предать ход забвению",
        msg_spam: "Вороны устали! Подождите немного.", msg_inq: "Инквизиция скрыла сквернословие!", msg_taken: "Имя уже занято другим Лордом!",
        msg_short: "Имя не достойно Лорда! (Минимум 3 буквы)", msg_welcome: "С возвращением, Лорд ", msg_forge_empty: "Кузница пуста! Скуйте хотя бы один ход!",
        msg_title_empty: "Нареките свою Летопись именем!", msg_scroll_saved: "Летопись навеки запечатлена в Свитках!", msg_scroll_downloaded: "Свиток перенесен в архивы!",
        msg_scroll_burned: "Свиток предан огню и стерт из памяти веков!", read: "Читать", unknown: "Неизвестный", goals: "Цели",
        forge_settings: "Магия Свитка", forge_goals_title: "Судьбоносные Замыслы", lang_select: "Язык Летописи",
        forge_name_ph: "Заголовок Летописи", forge_tags_ph: "Руны Поиска (Теги)", forge_goal_ph: "Ваш Замысел", forge_egoal_ph: "Коварство Врага",
        forge_step_title_ph: "Имя Маневра", forge_step_text_ph: "Слова или деяния героев...", chat_ph: "Ваше послание...",
        search_ph: "Поиск по имени Лорда или названию Свитка...",
        guide_btn_title: "Мудрость Предков", guide_title: "Том Мудрости", guide_intro: "Приветствуем, Лорд! Этот фолиант поможет вам освоить искусство Летописца.",
        guide_forge: "Кузница Сценариев", guide_forge_desc: "Здесь вы создаете свои истории. Задайте имя летописи, теги и цели. Делая ходы на доске, вы создаете шаги. Каждому шагу можно дать имя, описание и выбрать руну.",
        guide_scrolls: "Зал Свитков", guide_scrolls_desc: "Облачная библиотека, где хранятся творения других Лордов. Читайте истории, ставьте лайки или дизлайки, скачивайте их.",
        guide_mail: "Воронья Почта", guide_mail_desc: "Чат правителей. Общайтесь с другими создателями. Сообщения удаляются со временем, а сквернословие строго карается.",
        guide_battle: "Начало Битвы", guide_battle_desc: "Выберите историю в главном меню и нажмите 'Начать битву'.",
        goal_none: "Не выполняет цель", goal_mine: "Выполняет Вашу цель", goal_enemy: "Выполняет Цель Врага", flip_board: "Окинуть взором", choose_promotion: "Кого призвать?",
        move_counter: "ХОД: ", turn_white: "ОЧЕРЕДЬ: БЕЛЫЕ", turn_black: "ОЧЕРЕДЬ: ЧЕРНЫЕ", player: "<span class=\"icon-placeholder\" data-icon=\"icon-unknown\">⚪</span> Игрок", opponent: "<span class=\"icon-placeholder\" data-icon=\"icon-unknown\">⚫</span> Соперник", white_side: "Белые", black_side: "Черные",
            btn_puzzles: "ИСПЫТАНИЯ БЕЗДНЫ",
                eye_of_abyss: "ОКО", eye_of_abyss_full: "Oko Bezdny",
                    pgn_ritual: "Ритуал Импорта", pgn_paste_ph: "Вставьте PGN текст партии...",
                        pgn_load_file: "Загрузить файл .pgn", pgn_load_btn: "<span class=\"icon-placeholder\" data-icon=\"icon-unknown\">⚗</span>️ Начать Ритуал",
                            pgn_error: "Свиток повреждён! Проверьте PGN.", pgn_success: "Ритуал завершён! Партия загружена.",
                                nav_category: "Книга", nav_oracle: "Оракул", nav_forge: "Кузница", nav_menu: "Меню",
                                    oracle_thinking: "Оракул изрекает...",
                                        guide_oracle: "Оракул Бездны",
                                            guide_oracle_desc: "Ошибись в задаче — и Оракул пробудится. Он видит твои прегрешения сквозь позицию и вынесет мрачный приговор.",
                                                guide_eye: "Oko Bezdny",
                                                    guide_eye_desc: "Вертикальный индикатор в Кузнице. Фиолетовый свет — преимущество белых, тьма — владения чёрных. Чем ярче пульсация — тем острее перевес.",
                                                        guide_pgn: "Ритуал Импорта PGN",
                                                            guide_pgn_desc: "В Кузнице нажмите '<span class=\"icon-placeholder\" data-icon=\"icon-unknown\">⚗</span>️ Ритуал'. Вставьте партию в формате PGN или загрузите файл. Oko Bezdny будет обновляться с каждым ходом импортированной партии."
    },
en: {
    checking_archives: "Checking archives...", name_yourself: "Name yourself, Lord", name_desc: "Your name will be carved in stone forever and saved in the cloud. Cannot be changed.",
        enter_chronicles: "Enter Chronicles", choose_chapter: "Choose a chapter", argus_title: "Light of Argus", argus_desc: "A cautionary tale of self-sacrifice.",
            standard_title: "Banner of Light", standard_desc: "Order of Justiciar vs. Blood Totem Clan.", traxler_title: "Traxler's Fate", traxler_desc: "A mad gambit and the fall of the White Sun.",
                btn_start: "START BATTLE", btn_forge: "THE FORGE", btn_scrolls: "HALL OF SCROLLS", raven_mail: "Raven Mail", chat_loading: "Ravens are flying with letters...",
                    chat_send: "Send", settings_title: "Kingdom Settings", music_vol: "Battle Music", voice_vol: "Chronicler's Voice", current_lord: "Current Lord:",
                        scrolls_title: "Scrolls of other Lords", calm_title: "Calm", calm_desc: "Armies are waiting...", tasks_title: "Tasks", enemy_title: "Enemy", chronicle_title: "Chronicle",
                            forge_title: "Scenario Forge", make_moves: "Forge history on the battlefield", forge_publish: "Carve into Scrolls", forge_download: "Download Archive",
                                forge_empty: "The forge is empty. Forge the first move...", forge_undo: "Cast into oblivion",
                                    msg_spam: "Ravens are tired! Wait.", msg_inq: "The Inquisition censored foul words!", msg_taken: "Name is already taken by another Lord!",
                                        msg_short: "Name unworthy of a Lord! (Min 3 letters)", msg_welcome: "Welcome back, Lord ", msg_forge_empty: "Forge is empty! Forge at least one move!",
                                            msg_title_empty: "Name your Chronicle!", msg_scroll_saved: "Your chronicle is forever carved in the Hall of Scrolls!", msg_scroll_downloaded: "Scroll transferred to archives!",
                                                msg_scroll_burned: "Scroll burned and erased from memory!", read: "Read", unknown: "Unknown", goals: "Goals",
                                                    forge_settings: "Scroll Magic", forge_goals_title: "Fateful Designs", lang_select: "Language",
                                                        forge_name_ph: "Scroll Name", forge_tags_ph: "Search Runes (tags)", forge_goal_ph: "Your Design", forge_egoal_ph: "Enemy's Malice",
                                                            forge_step_title_ph: "Maneuver Name", forge_step_text_ph: "Narrative or speeches...", chat_ph: "Your message...",
                                                                search_ph: "Search by Lord's name or Scroll title...",
                                                                    guide_btn_title: "Wisdom of Ancestors", guide_title: "Tome of Wisdom", guide_intro: "Welcome, Lord! This folio will help you master the Chronicler's art.",
                                                                        guide_forge: "Scenario Forge", guide_forge_desc: "Here you forge your stories. Set name, tags, and goals. Making moves creates steps. Give each step a name, desc, and rune.",
                                                                            guide_scrolls: "Hall of Scrolls", guide_scrolls_desc: "A cloud library containing creations of other Lords. Read, like, dislike, and download them.",
                                                                                guide_mail: "Raven Mail", guide_mail_desc: "The rulers' chat. Speak with other creators. Old messages vanish, foul language is punished.",
                                                                                    guide_battle: "Starting a Battle", guide_battle_desc: "Select a story in the main menu and press 'Start Battle'.",
                                                                                        goal_none: "Completes no goal", goal_mine: "Completes Your goal", goal_enemy: "Completes Enemy goal", flip_board: "View through enemy eyes", choose_promotion: "Who to summon?",
                                                                                            move_counter: "MOVE: ", turn_white: "TURN: WHITE", turn_black: "TURN: BLACK", player: "<span class=\"icon-placeholder\" data-icon=\"icon-unknown\">⚪</span> Player", opponent: "<span class=\"icon-placeholder\" data-icon=\"icon-unknown\">⚫</span> Opponent", white_side: "White", black_side: "Black",
                                                                                                btn_puzzles: "TRIALS OF THE ABYSS",
                                                                                                    eye_of_abyss: "EYE", eye_of_abyss_full: "Eye of the Abyss",
                                                                                                        pgn_ritual: "Ritual of Import", pgn_paste_ph: "Paste PGN text here...",
                                                                                                            pgn_load_file: "Load .pgn file", pgn_load_btn: "<span class=\"icon-placeholder\" data-icon=\"icon-unknown\">⚗</span>️ Begin Ritual",
                                                                                                                pgn_error: "The scroll is corrupted! Check your PGN.", pgn_success: "Ritual complete! Game imported.",
                                                                                                                    nav_category: "Book", nav_oracle: "Oracle", nav_forge: "Forge", nav_menu: "Menu",
                                                                                                                        oracle_thinking: "The Oracle speaks...",
                                                                                                                            guide_oracle: "Oracle of the Abyss",
                                                                                                                                guide_oracle_desc: "Make a mistake in a puzzle and the Oracle awakens. It sees your sin through the position and delivers a dark verdict.",
                                                                                                                                    guide_eye: "Eye of the Abyss",
                                                                                                                                        guide_eye_desc: "A vertical gauge in the Forge. Purple glow = white's advantage, darkness = the black's dominion. The brighter the pulse, the sharper the imbalance.",
                                                                                                                                            guide_pgn: "PGN Import Ritual",
                                                                                                                                                guide_pgn_desc: "In the Forge press '<span class=\"icon-placeholder\" data-icon=\"icon-unknown\">⚗</span>️ Ritual'. Paste a PGN or load a file. The Eye of the Abyss updates with every move of the imported game."
},
uk: {
    checking_archives: "Перевірка архівів...", name_yourself: "Назви себе, Лорде", name_desc: "Ім'я буде викарбувано в камені навічно і збережено в хмарі.",
        enter_chronicles: "Увійти в літопис", choose_chapter: "Оберіть главу", argus_title: "Світло Аргуса", argus_desc: "Повчальна історія про самопожертву.",
            standard_title: "Прапор Світла", standard_desc: "Орден Юстиціарія проти Клану Кривавого Тотема.", traxler_title: "Доля Тракслера", traxler_desc: "Божевільний гамбіт і падіння Білого Сонця.",
                btn_start: "ПОЧАТИ БИТВУ", btn_forge: "КУЗНЯ", btn_scrolls: "ЗАЛА СУВОЇВ", raven_mail: "Вороняча Пошта", chat_loading: "Ворони летять із листами...",
                    chat_send: "Відправити", settings_title: "Налаштування Королівства", music_vol: "Музика Битви", voice_vol: "Голос Літописця", current_lord: "Поточний Лорд:",
                        scrolls_title: "Сувої інших Лордів", calm_title: "Затишшя", calm_desc: "Армії чекають...", tasks_title: "Завдання", enemy_title: "Ворог", chronicle_title: "Літопис",
                            forge_title: "Кузня Сценаріїв", make_moves: "Творіть історію на полі битви", forge_publish: "Викарбувати в Сувоях", forge_download: "Завантажити Архів",
                                forge_empty: "Кузня порожня. Викуйте перший хід...", forge_undo: "Віддати хід забуттю",
                                    msg_spam: "Ворони втомилися! Зачекайте.", msg_inq: "Інквізиція приховала лихослів'я!", msg_taken: "Ім'я вже зайняте іншим Лордом!",
                                        msg_short: "Ім'я не гідне Лорда! (Мінімум 3 літери)", msg_welcome: "З поверненням, Лорде ", msg_forge_empty: "Кузня порожня! Викуйте хоча б один хід!",
                                            msg_title_empty: "Назвіть свій Літопис!", msg_scroll_saved: "Літопис навіки збережено в Залі Сувоїв!", msg_scroll_downloaded: "Сувій перенесено до архівів!",
                                                msg_scroll_burned: "Сувій спалено і стерто з пам'яті віків!", read: "Читати", unknown: "Невідомий", goals: "Цілі",
                                                    forge_settings: "Магія Сувою", forge_goals_title: "Доленосні Задуми", lang_select: "Мова Літопису",
                                                        forge_name_ph: "Ім'я Сувою", forge_tags_ph: "Руни пошуку (теги)", forge_goal_ph: "Задум (Ваша Ціль)", forge_egoal_ph: "Підступність (Ціль Ворога)",
                                                            forge_step_title_ph: "Ім'я Маневру (Хід)", forge_step_text_ph: "Оповідь або промови...", chat_ph: "Ваше послання...",
                                                                search_ph: "Пошук за іменем Лорда або назвою Сувою...",
                                                                    guide_btn_title: "Мудрість Предків", guide_title: "Том Мудрості", guide_intro: "Вітаємо, Лорде! Цей фоліант допоможе вам опанувати мистецтво Літописця.",
                                                                        guide_forge: "Кузня Сценаріїв", guide_forge_desc: "Тут ви створюєте свої історії. Задайте ім'я, теги та цілі. Роблячи ходи на дошці, ви створюєте кроки. Кожному кроку можна дати ім'я, опис та вибрати руну.",
                                                                            guide_scrolls: "Зала Сувоїв", guide_scrolls_desc: "Хмарна бібліотека з творіннями інших Лордів. Читайте їхні історії, ставте лайки або дизлайки, завантажуйте.",
                                                                                guide_mail: "Вороняча Пошта", guide_mail_desc: "Чат правителів. Спілкуйтеся з іншими творцями. Лихослів'я суворо карається.",
                                                                                    guide_battle: "Початок Битви", guide_battle_desc: "Виберіть історію в головному меню і натисніть 'Почати битву'.",
                                                                                        goal_none: "Не виконує ціль", goal_mine: "Виконує Вашу ціль", goal_enemy: "Виконує Ціль Ворога", flip_board: "Окинути оком ворога", choose_promotion: "Кого призвати?",
                                                                                            move_counter: "ХІД: ", turn_white: "ЧЕРГА: БІЛІ", turn_black: "ЧЕРГА: ЧОРНІ", player: "<span class=\"icon-placeholder\" data-icon=\"icon-unknown\">⚪</span> Гравець", opponent: "<span class=\"icon-placeholder\" data-icon=\"icon-unknown\">⚫</span> Суперник", white_side: "Білі", black_side: "Чорні",
                                                                                                btn_puzzles: "ВИПРОБУВАННЯ БЕЗОДНІ",
                                                                                                    eye_of_abyss: "ОКО", eye_of_abyss_full: "Oko Bezodni",
                                                                                                        pgn_ritual: "Ритуал Імпорту", pgn_paste_ph: "Вставте текст PGN партії...",
                                                                                                            pgn_load_file: "Завантажити файл .pgn", pgn_load_btn: "<span class=\"icon-placeholder\" data-icon=\"icon-unknown\">⚗</span>️ Почати Ритуал",
                                                                                                                pgn_error: "Сувій пошкоджений! Перевірте PGN.", pgn_success: "Ритуал завершено! Партію завантажено.",
                                                                                                                    nav_category: "Книга", nav_oracle: "Оракул", nav_forge: "Кузня", nav_menu: "Меню",
                                                                                                                        oracle_thinking: "Оракул провіщає...",
                                                                                                                            guide_oracle: "Оракул Безодні",
                                                                                                                                guide_oracle_desc: "Зроби помилку в задачі — і Оракул прокинеться. Він бачить твої прогрішення крізь позицію і виносить похмурий вирок.",
                                                                                                                                    guide_eye: "Oko Bezodni",
                                                                                                                                        guide_eye_desc: "Вертикальний індикатор у Кузні. Фіолетове світло — перевага білих, тьма — чорних. Яскравіша пульсація — гостріша перевага.",
                                                                                                                                            guide_pgn: "Ритуал імпорту PGN",
                                                                                                                                                guide_pgn_desc: "У Кузні натисни '<span class=\"icon-placeholder\" data-icon=\"icon-unknown\">⚗</span>️ Ритуал'. Встав партію у форматі PGN або завантаж файл. Oko Bezodni оновлюватиметься з кожним ходом."
}
};

let currentLang = localStorage.getItem('chess_saga_lang') || 'ru';

window.updateScenariosLanguage = function () {
    if (typeof defaultScenarios !== 'undefined') {
        window.scenarios = JSON.parse(JSON.stringify(defaultScenarios[currentLang] || defaultScenarios['ru']));
    }
    let localParties = JSON.parse(localStorage.getItem('chess_saga_custom') || '[]');
    localParties.forEach((p, i) => window.scenarios['custom_' + i] = p);
}

window.changeLanguage = function (lang) {
    currentLang = lang;
    localStorage.setItem('chess_saga_lang', lang);
    window.applyTranslations();
    window.updateScenariosLanguage();
    if (typeof window.updateGoalDropdown === 'function') window.updateGoalDropdown();
}

window.applyTranslations = function () {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[currentLang] && dict[currentLang][key]) el.innerHTML = dict[currentLang][key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (dict[currentLang] && dict[currentLang][key]) el.placeholder = dict[currentLang][key];
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        if (dict[currentLang] && dict[currentLang][key]) el.title = dict[currentLang][key];
    });
}

window.t = function (key) { return dict[currentLang][key] || key; };

function updateNicknameDisplay() {
    if (window.myNickname) {
        const d = document.getElementById('settings-nickname-display');
        if (d) d.textContent = window.myNickname;
    }
}

window.myAuthorId = localStorage.getItem('chess_saga_author_id');
window.myNickname = localStorage.getItem('chess_saga_nickname');

// Called when user picks a language from the first-run screen
window.selectLanguage = function(lang) {
    localStorage.setItem('chess_saga_lang', lang);
    currentLang = lang;
    window.applyTranslations();
    window.updateScenariosLanguage();

    const modal = document.getElementById('lang-select-modal');
    if (modal) {
        modal.style.transition = 'opacity 0.4s ease';
        modal.style.opacity = '0';
        setTimeout(() => { modal.style.display = 'none'; }, 400);
    }

    // Also sync the lang selector in settings if present
    const sel = document.getElementById('lang-selector');
    if (sel) sel.value = lang;

    // Continue normal boot after language is chosen
    window._continueBootSequence();
};

window._continueBootSequence = function() {
    if (!window.myAuthorId) {
        window.myAuthorId = 'lord_' + Math.random().toString(36).substr(2, 9) + Date.now();
        localStorage.setItem('chess_saga_author_id', window.myAuthorId);
    }

    if (!window.myNickname) {
        const nicknameModal = document.getElementById('nickname-modal');
        if (nicknameModal) {
            nicknameModal.classList.remove('hidden');
        } else {
            console.warn('Nickname modal not found, skipping');
        }
    } else {
        updateNicknameDisplay();
        let guideShown = localStorage.getItem('chess_saga_guide_shown');
        if (!guideShown) {
            localStorage.setItem('chess_saga_guide_shown', 'true');
            setTimeout(window.openGuide, 500);
        }
        if (!localStorage.getItem('tutorialCompleted') && window.tutorialManager && !window.tutorialManager.isActive) {
            localStorage.setItem('tutorialCompleted', 'true');
            setTimeout(() => window.tutorialManager.start(), 1000);
        }
    }
};

window.addEventListener('DOMContentLoaded', () => {
    window.applyTranslations();
    window.updateScenariosLanguage();

    const langModal = document.getElementById('lang-select-modal');
    const savedLang = localStorage.getItem('chess_saga_lang');

    if (!savedLang && langModal) {
        // First launch: show language picker, hold boot until selection
        langModal.style.display = 'flex';
        // Sync settings dropdown if already rendered
        const sel = document.getElementById('lang-selector');
        if (sel) sel.value = 'ru';
    } else {
        // Language already chosen: hide modal and continue
        if (langModal) langModal.style.display = 'none';
        window._continueBootSequence();
    }
});

window.saveNickname = async function () {
    const input = document.getElementById('nickname-input').value.trim();
    if (input.length < 3) return window.showNotification(t('msg_short'), "error");
    if (window.AntiMat && window.AntiMat.check(input)) return window.showNotification(t('msg_inq'), "inq");

    window.myNickname = input;
    localStorage.setItem('chess_saga_nickname', window.myNickname);

    document.getElementById('nick-loader').style.display = 'flex';

    try {
        const resp = await fetch(window.API_URL);
        if (resp.ok) {
            const data = await resp.json();
            const rows = Array.isArray(data) ? data : (data.data || data.result || []);
            const isTaken = rows.some(r => {
                let p = typeof r.data === 'string' ? JSON.parse(r.data) : (r.data || r);
                return p.type === 'profile' && p.nickname.toLowerCase() === input.toLowerCase() && p.author_id !== window.myAuthorId;
            });

            if (isTaken) {
                localStorage.removeItem('chess_saga_nickname');
                window.myNickname = null;
                document.getElementById('nick-loader').style.display = 'none';
                return window.showNotification(t('msg_taken'), "error");
            }
        }
        await fetch(window.API_URL, { method: 'POST', body: JSON.stringify({ data: { type: 'profile', author_id: window.myAuthorId, nickname: input } }) });
    } catch (e) { }

    document.getElementById('nick-loader').style.display = 'none';
    document.getElementById('nickname-modal').classList.add('hidden');
    updateNicknameDisplay();
    window.showNotification(t('msg_welcome') + window.myNickname + "!", "success");

    let guideShown = localStorage.getItem('chess_saga_guide_shown');
    if (!guideShown) {
        localStorage.setItem('chess_saga_guide_shown', 'true');
        setTimeout(window.openGuide, 1000);
    }
    if (!localStorage.getItem('tutorialCompleted') && window.tutorialManager && !window.tutorialManager.isActive) {
        localStorage.setItem('tutorialCompleted', 'true');
        setTimeout(() => window.tutorialManager.start(), 1500);
    }

    // Also sync the lang dropdown in settings to current saved language
    const sel = document.getElementById('lang-selector');
    if (sel) sel.value = localStorage.getItem('chess_saga_lang') || 'ru';
}

window.openSettings = function () { updateNicknameDisplay(); document.getElementById('settings-modal').classList.remove('hidden'); }
window.closeSettings = function () { document.getElementById('settings-modal').classList.add('hidden'); }
window.openGuide = function () {
    if (window.tutorialManager) {
        window.tutorialManager.start();
    }
};
window.closeGuide = function () { document.getElementById('guide-modal').classList.add('hidden'); }

let chatPollInterval;
let lastChatTime = 0;

window.openChat = function () {
    document.getElementById('chat-modal').classList.remove('hidden');
    loadChat();
    if (chatPollInterval) clearInterval(chatPollInterval);
    chatPollInterval = setInterval(loadChat, 5000);
}

window.closeChat = function () {
    document.getElementById('chat-modal').classList.add('hidden');
    clearInterval(chatPollInterval);
}

window.sendChatMessage = async function () {
    const input = document.getElementById('chat-input');
    let text = input.value.trim();
    if (!text) return;

    if (Date.now() - lastChatTime < 3000) return window.showNotification(t('msg_spam'), "error");

    if (window.AntiMat) {
        let safeText = window.AntiMat.censor(text);
        if (safeText !== text) {
            window.showNotification(t('msg_inq'), "inq");
            text = safeText;
        }
    }
    if (text === "***") return;

    const msgObj = { author_id: window.myAuthorId, author_name: window.myNickname || t('unknown'), text: text };
    input.value = "";

    renderSingleMessage({ author_name: window.myNickname, text: text }, true);
    lastChatTime = Date.now();

    try {
        let url = window.API_URL.endsWith('/') ? window.API_URL + 'chat' : window.API_URL + '/chat';
        await fetch(url, { method: 'POST', body: JSON.stringify(msgObj) });
    } catch (e) { }
}

async function loadChat() {
    try {
        let url = window.API_URL.endsWith('/') ? window.API_URL + 'chat' : window.API_URL + '/chat';
        const resp = await fetch(url);
        if (resp.ok) {
            const messages = await resp.json();
            const container = document.getElementById('chat-messages');
            container.innerHTML = "";
            if (messages.length === 0) container.innerHTML = `<p class="text-center text-slate-500 italic mt-6">${t('chat_loading')}</p>`;
            else messages.forEach(m => renderSingleMessage(m, false));
        }
    } catch (e) { }
}

function renderSingleMessage(msg, scrollToBottom) {
    const container = document.getElementById('chat-messages');
    const isMe = msg.author_name === window.myNickname;
    const div = document.createElement('div');
    div.className = `chat-msg flex flex-col ${isMe ? 'items-end' : 'items-start'}`;
    div.innerHTML = `
        <span class="text-xs text-slate-500 uppercase tracking-widest mb-1 mx-1">${msg.author_name}</span>
        <div class="px-4 py-2 rounded-xl max-w-[80%] text-sm ${isMe ? 'bg-amber-600/20 border border-amber-600/50 text-amber-100 rounded-tr-sm' : 'bg-slate-700/50 border border-slate-600 text-slate-200 rounded-tl-sm'}">
            ${msg.text}
        </div>
    `;
    container.appendChild(div);
    if (scrollToBottom || isMe) container.scrollTop = container.scrollHeight;
}

window.showNotification = function (text, type = 'success') {
    const toast = document.getElementById('toast');
    const icon = document.getElementById('toast-icon');
    document.getElementById('toast-text').textContent = text;
    toast.className = 'fixed top-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full font-bold text-sm tracking-widest z-[9999] transition-all duration-300 flex items-center gap-3 shadow-[0_0_30px_rgba(0,0,0,0.8)] translate-y-0 opacity-100';

    if (type === 'success') {
        toast.classList.add('bg-amber-500', 'text-slate-900');
        icon.innerHTML = window.iconImg('✨', 'w-6 h-6 object-contain');
    }
    else if (type === 'error') {
        toast.classList.add('bg-red-600', 'text-white');
        icon.innerHTML = window.iconImg('‼️', 'w-6 h-6 object-contain');
    }
    else if (type === 'inq') {
        toast.classList.add('bg-purple-900', 'text-white');
        icon.innerHTML = window.iconImg('👁️', 'w-6 h-6 object-contain');
    }
    else {
        toast.classList.add('bg-sky-600', 'text-white');
        icon.innerHTML = window.iconImg('📜', 'w-6 h-6 object-contain');
    }

    setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('-translate-y-10', 'opacity-0');
    }, 3500);
}

let gallerySearchTerm = "";

window.updateGallerySearch = function () { gallerySearchTerm = document.getElementById('community-search').value.toLowerCase(); window.renderGalleryHTML(); }
window.openCommunityModal = function () { document.getElementById('community-modal').classList.remove('hidden'); window.renderGallery(); }
window.closeCommunityModal = function () { document.getElementById('community-modal').classList.add('hidden'); }

window.toggleReaction = async function (index, type) {
    const p = window.scenarios['custom_' + index];
    if (!p) return;
    const id = p.db_id || p.title;
    let current = window.userLikes[id] || 0;
    let diffLike = 0, diffDislike = 0;

    if (type === 'like') {
        if (current === 1) { window.userLikes[id] = 0; diffLike = -1; }
        else { window.userLikes[id] = 1; diffLike = 1; if (current === -1) diffDislike = -1; }
    } else {
        if (current === -1) { window.userLikes[id] = 0; diffDislike = -1; }
        else { window.userLikes[id] = -1; diffDislike = 1; if (current === 1) diffLike = -1; }
    }

    localStorage.setItem('chess_saga_likes', JSON.stringify(window.userLikes));

    // Безупречный фикс: берем длину массива, если это массив (чтобы избавиться от надписи user_id)
    let currentLikes = Array.isArray(p.likes) ? p.likes.length : (parseInt(p.likes) || 0);
    let currentDislikes = Array.isArray(p.dislikes) ? p.dislikes.length : (parseInt(p.dislikes) || 0);

    p.likes = currentLikes + diffLike;
    p.dislikes = currentDislikes + diffDislike;

    let customParties = JSON.parse(localStorage.getItem('chess_saga_custom') || '[]');
    let localIndex = customParties.findIndex(cp => cp.title === p.title);
    if (localIndex !== -1) {
        customParties[localIndex].likes = p.likes;
        customParties[localIndex].dislikes = p.dislikes;
        localStorage.setItem('chess_saga_custom', JSON.stringify(customParties));
    }

    window.renderGalleryHTML();

    if (p.db_id) {
        try {
            let url = window.API_URL.endsWith('/') ? window.API_URL + 'rate' : window.API_URL + '/rate';
            let response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: p.db_id, author_id: window.myAuthorId, action: type })
            });
            if (response.ok) {
                const resData = await response.json();
                p.likes = resData.likes;
                p.dislikes = resData.dislikes;
                window.renderGalleryHTML();
            }
        } catch (e) { }
    }
}

window.renderGallery = async function () {
    const gallery = document.getElementById('community-gallery');
    gallery.innerHTML = `<p class="col-span-full text-center text-slate-600 italic text-lg">...поиск свитков...</p>`;

    let localParties = JSON.parse(localStorage.getItem('chess_saga_custom') || '[]');
    let dbParties = [];
    try {
        const response = await fetch(window.API_URL, { mode: 'cors' });
        if (response.ok) {
            const data = await response.json();
            let rows = Array.isArray(data) ? data : (data.data || data.result || []);
            dbParties = rows.map(row => {
                let pd = typeof row.data === 'string' ? JSON.parse(row.data) : (row.data || row);
                pd.db_id = row.id || pd.id; return pd;
            });
        }
    } catch (e) { }

    let allParties = [...dbParties].filter(p => p.type !== 'profile' && p.type !== 'chat_msg');
    localParties.forEach(lp => { if (!allParties.some(p => p.title === lp.title)) allParties.push(lp); });

    window._cachedGalleryParties = allParties;
    window.renderGalleryHTML();
}

window.renderGalleryHTML = function () {
    const gallery = document.getElementById('community-gallery');
    const allParties = window._cachedGalleryParties || [];

    const filteredParties = allParties.filter(p =>
        (p.title && p.title.toLowerCase().includes(gallerySearchTerm)) ||
        (p.author_name && p.author_name.toLowerCase().includes(gallerySearchTerm))
    );

    if (filteredParties.length === 0) {
        gallery.innerHTML = `<p class="col-span-full text-center text-slate-600 italic text-lg">Свитки не найдены...</p>`;
        return;
    }

    gallery.innerHTML = filteredParties.map((p, originalIndex) => {
        if (!p || !p.story) return '';
        window.scenarios['custom_' + originalIndex] = p;
        const canDelete = p.author_id === window.myAuthorId;
        const uId = p.db_id || p.title;
        const safeTitle = window.escapeHTML(p.title);
        const safeAuthor = window.escapeHTML(p.author_name || t('unknown'));
        let tagsHtml = p.tags && p.tags.length > 0 ? `<div class="flex flex-wrap gap-1 mt-2 mb-2">` + p.tags.map(t => `<span class="bg-sky-900/40 text-sky-300 text-[10px] px-2 py-1 rounded-full uppercase tracking-wider">${window.escapeHTML(t)}</span>`).join('') + `</div>` : '';

        // Исправление бага с лайками (отображение)
        let likesCount = Array.isArray(p.likes) ? p.likes.length : (parseInt(p.likes) || 0);
        let dislikesCount = Array.isArray(p.dislikes) ? p.dislikes.length : (parseInt(p.dislikes) || 0);

        return `
        <div class="scenario-card border-purple-900 bg-slate-900/80 p-5 rounded-2xl flex flex-col justify-between hover:scale-105 transition-transform h-full relative">
            <div class="mb-4 pr-6">
                <h3 class="text-purple-400 font-bold truncate text-xl" title="${safeTitle}">${safeTitle}</h3>
                ${tagsHtml}
                <p class="text-xs text-slate-400 mt-2 uppercase">Ходов: ${p.story.length}</p>
            </div>
            ${canDelete ? `<button onclick="deleteFromGallery(${originalIndex})" class="absolute top-4 right-4 text-slate-500 hover:scale-110 transition-transform" title="Сжечь свиток">
                ${window.iconImg('🗑️', 'w-5 h-5 object-contain')}
            </button>` : ''}
            <div class="flex justify-between items-center mb-4">
                <span class="text-xs text-amber-500 font-bold truncate pr-2">Лорд: ${safeAuthor}</span>
                <div class="flex gap-3 text-sm">
                    <button onclick="toggleReaction(${originalIndex}, 'like')" class="${window.userLikes[uId] === 1 ? 'opacity-100' : 'opacity-50'} hover:opacity-100 transition-opacity flex items-center gap-1">
                        ${window.iconImg('♥️', 'w-4 h-4 object-contain')} ${likesCount}
                    </button>
                    <button onclick="toggleReaction(${originalIndex}, 'dislike')" class="${window.userLikes[uId] === -1 ? 'opacity-100' : 'opacity-50'} hover:opacity-100 transition-opacity flex items-center gap-1">
                        ${window.iconImg('💔', 'w-4 h-4 object-contain')} ${dislikesCount}
                    </button>
                </div>
            </div>
            <div class="flex gap-3">
                <button onclick="if(typeof playCustomScenario === 'function') playCustomScenario(${originalIndex})" class="flex-1 bg-sky-600 hover:bg-sky-500 py-2.5 rounded-xl text-sm font-bold uppercase transition-colors text-white flex items-center justify-center gap-2 shadow-lg">
                    ${window.iconImg('👁️', 'w-5 h-5')} ${t('read')}
                </button>
                <button onclick="if(typeof downloadFromGallery === 'function') downloadFromGallery(${originalIndex})" class="bg-slate-700 hover:bg-slate-600 px-4 py-2.5 rounded-xl transition-colors shadow-lg flex items-center justify-center" title="Забрать в архив">
                    ${window.iconImg('💾', 'w-5 h-5 object-contain')}
                </button>
            </div>
        </div>`;
    }).join('');
}

window.deleteFromGallery = async function (index) {
    const p = window.scenarios['custom_' + index];
    if (!confirm(`Вы точно хотите предать огню свиток "${p.title}"?`)) return;
    let customParties = JSON.parse(localStorage.getItem('chess_saga_custom') || '[]');
    customParties = customParties.filter(cp => cp.title !== p.title);
    localStorage.setItem('chess_saga_custom', JSON.stringify(customParties));
    if (p.db_id) {
        try {
            const endpoint = window.API_URL.endsWith('/') ? `${window.API_URL}${p.db_id}` : `${window.API_URL}/${p.db_id}`;
            const response = await fetch(endpoint, { method: 'DELETE', mode: 'cors' });
            if (response.ok) window.showNotification(t('msg_scroll_burned'), "success");
        } catch (error) { }
    } else {
        window.showNotification(t('msg_scroll_burned'), "success");
    }
    window.renderGallery();
}
