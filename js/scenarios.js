const defaultScenarios = {
    ru: {
        argus: {
            goals: ["Освящение центра", "Взгляд на f7", "ПОБЕДА ЭКЗОДАРА"],
            egoals: ["Осквернение e5", "Теневая связка", "Падение Пророка"],
            story: [
                { move: "e2e4", turn: 'white', title: "Свет Аргуса", text: "Воздаятель делает первый шаг, призывая энергию кристаллов.", icon: "<span class="icon-placeholder" data-icon="sparkles">✨</span>", goal: 0 },
                { move: "e7e5", turn: 'black', title: "Ответ Изгнанника", text: "Темные дренеи выставляют свой заслон.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">🟣</span>", egoal: 0 },
                { move: "g1f3", turn: 'white', title: "Копыта Праведности", text: "Элезар устремляется вперед на своем Талбуке.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">🐐</span>" },
                { move: "d7d6", turn: 'black', title: "Щит Тенебра", text: "Отступники укрепляют свои ряды молитвой стойкости.", icon: "<span class="icon-placeholder" data-icon="shield-alt">🛡</span>️" },
                { move: "f1c4", turn: 'white', title: "Око Пророка", text: "Верховный Мудрец направляет посох в уязвимое место.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">👁</span>️", goal: 1 },
                { move: "c8g4", turn: 'black', title: "Шепот Бездны", text: "Темный Жнец накладывает проклятие страха.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">⛓</span>️", egoal: 1 },
                { move: "b1c3", turn: 'white', title: "Братство Света", text: "Второй всадник выходит из теней Экзодара.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">🤺</span>" },
                { move: "b8c6", turn: 'black', title: "Тень подкрадывается", text: "Армия Бездны призывает своих всадников.", icon: "<span class="icon-placeholder" data-icon="cyclone">🌀</span>" },
                { move: "h2h3", turn: 'white', title: "Слово Очищения", text: "Воздаятель направляет искру Света.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">☀</span>️" },
                { move: "g4h5", turn: 'black', title: "Упрямство Падших", text: "Жнец отступает лишь на шаг.", icon: "<span class="icon-placeholder" data-icon="dark-moon">🌑</span>" },
                { move: "f3e5", turn: 'white', title: "Жертва Наару", text: "Элезар разрывает цепи и бросается в атаку!", icon: "<span class="icon-placeholder" data-icon="lightning">⚡</span>", capture: true },
                { move: "h5d1", turn: 'black', title: "Триумф Хаоса", text: "Жнец повергает лидера Света. Тьма ликует.", icon: "<span class="icon-placeholder" data-icon="skull">💀</span>", egoal: 2, capture: true },
                { move: "c4f7", turn: 'white', title: "Удар Искупления", text: "Луч энергии в чело Темного Короля!", icon: "<span class="icon-placeholder" data-icon="trident">🔱</span>", capture: true },
                { move: "e8e7", turn: 'black', title: "Позорное бегство", text: "Поверженный лидер Тьмы вынужден бежать.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">😰</span>" },
                { move: "c3d5", turn: 'white', title: "ПРИГОВОР СВЕТА", text: "Второй всадник настигает тирана.", icon: "<span class="icon-placeholder" data-icon="crown">👑</span>", goal: 2 }
            ]
        },
        standard: {
            goals: ["Освящение рубежа", "Сокрушение преграды", "ПОБЕДА ОРДЕНА"],
            egoals: ["Ответная ярость", "Кровавая жатва", "Самопожертвование рабов"],
            story: [
                { move: "e2e4", turn: 'white', title: "Знамя Света", text: "Юный рыцарь вонзает штандарт в сухую землю.", icon: "<span class="icon-placeholder" data-icon="flag">🚩</span>", goal: 0 },
                { move: "e7e5", turn: 'black', title: "Рог Войны", text: "Вождь кочевников принимает вызов.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">🪓</span>", egoal: 0 },
                { move: "g1f3", turn: 'white', title: "Клятва Всадника", text: "Рыцарь делает выпад в горло врагу.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">🐎</span>" },
                { move: "d7d6", turn: 'black', title: "Каменная Черепаха", text: "Кочевники смыкают щиты.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">🐢</span>" },
                { move: "f1c4", turn: 'white', title: "Око Юстициария", text: "Старый воевода выискивает щель в шлеме вождя.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">👁</span>️" },
                { move: "h7h6", turn: 'black', title: "Тень Сомнения", text: "Вождь приказывает поднять щиты выше.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">☁</span>️" },
                { move: "d2d4", turn: 'white', title: "Удар Молота", text: "Основные силы ордена идут на таран.", icon: "<span class="icon-placeholder" data-icon="hammer">🔨</span>", goal: 1 },
                { move: "e5d4", turn: 'black', title: "Кровавая Жатва", text: "Кочевники расступаются, заманивая в ловушку.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">🩸</span>", egoal: 1, capture: true },
                { move: "c2c3", turn: 'white', title: "Дар Мученика", text: "Паладины бросают щиты, чтобы быть быстрее.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">🕊</span>️" },
                { move: "d4c3", turn: 'black', title: "Пир Стервятника", text: "Кочевники вгрызаются в брешь.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">🦅</span>", capture: true },
                { move: "c4f7", turn: 'white', title: "Гнев Юстициария", text: "Клинок воеводы разрубает трон вождя!", icon: "<span class="icon-placeholder" data-icon="icon-unknown">⚔</span>️", capture: true },
                { move: "e8f7", turn: 'black', title: "Ответная Ярость", text: "Вождь сносит голову воеводе.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">👺</span>", capture: true },
                { move: "f3e5", turn: 'white', title: "Приговор Небес", text: "Всадник влетает в самую гущу битвы.", icon: "<span class="icon-placeholder" data-icon="lightning">⚡</span>" },
                { move: "f7e8", turn: 'black', title: "Путь Труса", text: "Воитель бежит к своим шатрам.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">🏃</span>" },
                { move: "d1h5", turn: 'white', title: "Зов Искупительницы", text: "Свет испепеляет стражу вождя.", icon: "<span class="icon-placeholder" data-icon="trident">🔱</span>" },
                { move: "g7g6", turn: 'black', title: "Последний Заслон", text: "Телохратели бросаются в пламя.", icon: "<span class="icon-placeholder" data-icon="fire">🔥</span>", egoal: 2 },
                { move: "h5g6", turn: 'white', title: "Сияние", text: "Свет проходит сквозь плоть и кости.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">🔆</span>", capture: true },
                { move: "e8e7", turn: 'black', title: "Тень Агонии", text: "Вождь загнан к обрыву.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">🌫</span>️" },
                { move: "g6f7", turn: 'white', title: "ВЕЧНЫЙ ПОКОЙ", text: "Последний удар нанесен.", icon: "<span class="icon-placeholder" data-icon="trophy">🏆</span>", goal: 2 }
            ]
        },
        traxler: {
            goals: ["Захватить центр", "Штурм форпоста f7", "Свергнуть Монарха"],
            egoals: ["Сдержать натиск", "Ловушка Тракслера", "Казнь Короля"],
            story: [
                { move: "e2e4", turn: 'white', title: "Вторжение", text: "Белое Солнце выдвигает авангард.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">⚔</span>️", goal: 0 },
                { move: "e7e5", turn: 'black', title: "Ответ Луны", text: "Черный легион блокирует продвижение.", icon: "<span class="icon-placeholder" data-icon="shield-alt">🛡</span>️", egoal: 0 },
                { move: "g1f3", turn: 'white', title: "Конница", text: "Сир Фредерик выходит на фланг.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">🐎</span>" },
                { move: "b8c6", turn: 'black', title: "Перехват", text: "Черные всадники выходят навстречу.", icon: "♞" },
                { move: "f1c4", turn: 'white', title: "Высоты", text: "Инквизитор видит слабую стену.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">⛪</span>" },
                { move: "g8f6", turn: 'black', title: "Ловушка", text: "Враг выпускает рыцаря.", icon: "<span class="icon-placeholder" data-icon="dark-moon">🌑</span>" },
                { move: "f3g5", turn: 'white', title: "Штурм", text: "Копья направлены на f7.", icon: "<span class="icon-placeholder" data-icon="fire">🔥</span>", goal: 1 },
                { move: "f8c5", turn: 'black', title: "Тракслер", text: "Гамбит безумия активирован!", icon: "<span class="icon-placeholder" data-icon="icon-unknown">⚠</span>️", egoal: 1 },
                { move: "g5f7", turn: 'white', title: "Прорыв", text: "Рыцарь врывается в башню!", icon: "<span class="icon-placeholder" data-icon="icon-unknown">🍴</span>", capture: true },
                { move: "c5f2", turn: 'black', title: "Взрыв", text: "Черный диверсант подрывает ворота!", icon: "<span class="icon-placeholder" data-icon="collision">💥</span>", capture: true },
                { move: "e1f2", turn: 'white', title: "Казнь", text: "Монарх лично убивает диверсанта.", icon: "<span class="icon-placeholder" data-icon="crown">👑</span>", capture: true },
                { move: "f6e4", turn: 'black', title: "Налет", text: "Черный Рыцарь в тронном зале!", icon: "<span class="icon-placeholder" data-icon="icon-unknown">☁</span>️", capture: true },
                { move: "f2g1", turn: 'white', title: "Тень", text: "Король прячется в углу.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">🏃</span>" },
                { move: "d8h4", turn: 'black', title: "Королева", text: "Черная Владычица обращает камень в пепел.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">👸</span>" },
                { move: "f7h8", turn: 'white', title: "Жадность", text: "Ваш Рыцарь грабит сокровищницу.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">💎</span>", capture: true },
                { move: "h4f2", turn: 'black', title: "Крах", text: "История Империи окончена.", icon: "<span class="icon-placeholder" data-icon="skull">💀</span>", goal: 2, egoal: 2 }
            ]
        }
    },
    en: {
        argus: {
            goals: ["Consecration of the center", "Gaze on f7", "VICTORY OF EXODAR"],
            egoals: ["Desecration of e5", "Shadow bond", "Fall of the Prophet"],
            story: [
                { move: "e2e4", turn: 'white', title: "Light of Argus", text: "The Vindicator takes the first step, summoning the energy of the crystals.", icon: "<span class="icon-placeholder" data-icon="sparkles">✨</span>", goal: 0 },
                { move: "e7e5", turn: 'black', title: "Exile's Reply", text: "The Dark Draenei set up their barrier.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">🟣</span>", egoal: 0 },
                { move: "g1f3", turn: 'white', title: "Hooves of Righteousness", text: "Eleazar rushes forward on his Talbuk.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">🐐</span>" },
                { move: "d7d6", turn: 'black', title: "Shield of Tenebrae", text: "The Apostates fortify their ranks with a prayer of fortitude.", icon: "<span class="icon-placeholder" data-icon="shield-alt">🛡</span>️" },
                { move: "f1c4", turn: 'white', title: "Eye of the Prophet", text: "The High Sage points his staff at a vulnerable spot.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">👁</span>️", goal: 1 },
                { move: "c8g4", turn: 'black', title: "Whisper of the Void", text: "The Dark Reaper casts a curse of fear.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">⛓</span>️", egoal: 1 },
                { move: "b1c3", turn: 'white', title: "Brotherhood of Light", text: "The second rider emerges from the shadows of Exodar.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">🤺</span>" },
                { move: "b8c6", turn: 'black', title: "The Shadow Creeps", text: "The Army of the Void summons its riders.", icon: "<span class="icon-placeholder" data-icon="cyclone">🌀</span>" },
                { move: "h2h3", turn: 'white', title: "Word of Cleansing", text: "The Vindicator channels a spark of Light.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">☀</span>️" },
                { move: "g4h5", turn: 'black', title: "Stubbornness of the Fallen", text: "The Reaper retreats but a single step.", icon: "<span class="icon-placeholder" data-icon="dark-moon">🌑</span>" },
                { move: "f3e5", turn: 'white', title: "Sacrifice of the Naaru", text: "Eleazar breaks the chains and charges into the attack!", icon: "<span class="icon-placeholder" data-icon="lightning">⚡</span>", capture: true },
                { move: "h5d1", turn: 'black', title: "Triumph of Chaos", text: "The Reaper strikes down the leader of Light. The Darkness rejoices.", icon: "<span class="icon-placeholder" data-icon="skull">💀</span>", egoal: 2, capture: true },
                { move: "c4f7", turn: 'white', title: "Strike of Redemption", text: "A beam of energy strikes the forehead of the Dark King!", icon: "<span class="icon-placeholder" data-icon="trident">🔱</span>", capture: true },
                { move: "e8e7", turn: 'black', title: "Shameful Flight", text: "The defeated leader of Darkness is forced to flee.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">😰</span>" },
                { move: "c3d5", turn: 'white', title: "JUDGMENT OF LIGHT", text: "The second rider overtakes the tyrant.", icon: "<span class="icon-placeholder" data-icon="crown">👑</span>", goal: 2 }
            ]
        },
        standard: {
            goals: ["Consecrate the border", "Crush the barrier", "VICTORY OF THE ORDER"],
            egoals: ["Retaliatory fury", "Bloody harvest", "Sacrifice of the slaves"],
            story: [
                { move: "e2e4", turn: 'white', title: "Banner of Light", text: "The young knight drives the standard into the dry earth.", icon: "<span class="icon-placeholder" data-icon="flag">🚩</span>", goal: 0 },
                { move: "e7e5", turn: 'black', title: "Horn of War", text: "The nomad warchief accepts the challenge.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">🪓</span>", egoal: 0 },
                { move: "g1f3", turn: 'white', title: "Oath of the Rider", text: "The knight lunges at the enemy's throat.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">🐎</span>" },
                { move: "d7d6", turn: 'black', title: "Stone Turtle", text: "The nomads lock their shields.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">🐢</span>" },
                { move: "f1c4", turn: 'white', title: "Eye of the Justiciar", text: "The old warlord looks for a gap in the warchief's helmet.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">👁</span>️" },
                { move: "h7h6", turn: 'black', title: "Shadow of Doubt", text: "The warchief orders the shields raised higher.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">☁</span>️" },
                { move: "d2d4", turn: 'white', title: "Strike of the Hammer", text: "The main forces of the order ram forward.", icon: "<span class="icon-placeholder" data-icon="hammer">🔨</span>", goal: 1 },
                { move: "e5d4", turn: 'black', title: "Bloody Harvest", text: "The nomads step aside, luring them into a trap.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">🩸</span>", egoal: 1, capture: true },
                { move: "c2c3", turn: 'white', title: "Gift of the Martyr", text: "The paladins drop their shields to be faster.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">🕊</span>️" },
                { move: "d4c3", turn: 'black', title: "Feast of the Vulture", text: "The nomads bite into the breach.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">🦅</span>", capture: true },
                { move: "c4f7", turn: 'white', title: "Wrath of the Justiciar", text: "The warlord's blade cleaves the warchief's throne!", icon: "<span class="icon-placeholder" data-icon="icon-unknown">⚔</span>️", capture: true },
                { move: "e8f7", turn: 'black', title: "Retaliatory Fury", text: "The warchief severs the warlord's head.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">👺</span>", capture: true },
                { move: "f3e5", turn: 'white', title: "Sentence of the Heavens", text: "The rider flies into the thick of the battle.", icon: "<span class="icon-placeholder" data-icon="lightning">⚡</span>" },
                { move: "f7e8", turn: 'black', title: "Path of the Coward", text: "The warrior flees to his tents.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">🏃</span>" },
                { move: "d1h5", turn: 'white', title: "Call of the Redeemer", text: "The Light incinerates the warchief's guards.", icon: "<span class="icon-placeholder" data-icon="trident">🔱</span>" },
                { move: "g7g6", turn: 'black', title: "The Last Stand", text: "The bodyguards throw themselves into the flames.", icon: "<span class="icon-placeholder" data-icon="fire">🔥</span>", egoal: 2 },
                { move: "h5g6", turn: 'white', title: "Radiance", text: "The Light passes through flesh and bone.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">🔆</span>", capture: true },
                { move: "e8e7", turn: 'black', title: "Shadow of Agony", text: "The warchief is driven to the cliff edge.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">🌫</span>️" },
                { move: "g6f7", turn: 'white', title: "ETERNAL PEACE", text: "The final blow is struck.", icon: "<span class="icon-placeholder" data-icon="trophy">🏆</span>", goal: 2 }
            ]
        },
        traxler: {
            goals: ["Capture the center", "Assault outpost f7", "Overthrow the Monarch"],
            egoals: ["Hold the onslaught", "Traxler's Trap", "Execution of the King"],
            story: [
                { move: "e2e4", turn: 'white', title: "Invasion", text: "The White Sun advances its vanguard.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">⚔</span>️", goal: 0 },
                { move: "e7e5", turn: 'black', title: "Answer of the Moon", text: "The Black Legion blocks the advance.", icon: "<span class="icon-placeholder" data-icon="shield-alt">🛡</span>️", egoal: 0 },
                { move: "g1f3", turn: 'white', title: "Cavalry", text: "Sir Frederick moves to the flank.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">🐎</span>" },
                { move: "b8c6", turn: 'black', title: "Interception", text: "The black riders ride out to meet them.", icon: "♞" },
                { move: "f1c4", turn: 'white', title: "Highlands", text: "The Inquisitor spots a weak wall.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">⛪</span>" },
                { move: "g8f6", turn: 'black', title: "Trap", text: "The enemy unleashes a knight.", icon: "<span class="icon-placeholder" data-icon="dark-moon">🌑</span>" },
                { move: "f3g5", turn: 'white', title: "Assault", text: "Spears are aimed at f7.", icon: "<span class="icon-placeholder" data-icon="fire">🔥</span>", goal: 1 },
                { move: "f8c5", turn: 'black', title: "Traxler", text: "The gambit of madness is activated!", icon: "<span class="icon-placeholder" data-icon="icon-unknown">⚠</span>️", egoal: 1 },
                { move: "g5f7", turn: 'white', title: "Breakthrough", text: "The knight bursts into the tower!", icon: "<span class="icon-placeholder" data-icon="icon-unknown">🍴</span>", capture: true },
                { move: "c5f2", turn: 'black', title: "Explosion", text: "The black saboteur blows up the gates!", icon: "<span class="icon-placeholder" data-icon="collision">💥</span>", capture: true },
                { move: "e1f2", turn: 'white', title: "Execution", text: "The Monarch personally kills the saboteur.", icon: "<span class="icon-placeholder" data-icon="crown">👑</span>", capture: true },
                { move: "f6e4", turn: 'black', title: "Raid", text: "The Black Knight is in the throne room!", icon: "<span class="icon-placeholder" data-icon="icon-unknown">☁</span>️", capture: true },
                { move: "f2g1", turn: 'white', title: "Shadow", text: "The King hides in the corner.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">🏃</span>" },
                { move: "d8h4", turn: 'black', title: "Queen", text: "The Black Mistress turns stone to ash.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">👸</span>" },
                { move: "f7h8", turn: 'white', title: "Greed", text: "Your Knight loots the treasury.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">💎</span>", capture: true },
                { move: "h4f2", turn: 'black', title: "Collapse", text: "The history of the Empire is over.", icon: "<span class="icon-placeholder" data-icon="skull">💀</span>", goal: 2, egoal: 2 }
            ]
        }
    },
    uk: {
        argus: {
            goals: ["Освячення центру", "Погляд на f7", "ПЕРЕМОГА ЕКЗОДАРУ"],
            egoals: ["Осквернення e5", "Тіньова зв'язка", "Падіння Пророка"],
            story: [
                { move: "e2e4", turn: 'white', title: "Світло Аргуса", text: "Воздаятель робить перший крок, закликаючи енергію кристалів.", icon: "<span class="icon-placeholder" data-icon="sparkles">✨</span>", goal: 0 },
                { move: "e7e5", turn: 'black', title: "Відповідь Вигнанця", text: "Темні дренеї виставляють свій заслін.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">🟣</span>", egoal: 0 },
                { move: "g1f3", turn: 'white', title: "Копита Праведності", text: "Елезар мчить уперед на своєму Талбуку.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">🐐</span>" },
                { move: "d7d6", turn: 'black', title: "Щит Тенебра", text: "Відступники зміцнюють свої лави молитвою стійкості.", icon: "<span class="icon-placeholder" data-icon="shield-alt">🛡</span>️" },
                { move: "f1c4", turn: 'white', title: "Око Пророка", text: "Верховний Мудрець направляє посох у вразливе місце.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">👁</span>️", goal: 1 },
                { move: "c8g4", turn: 'black', title: "Шепіт Безодні", text: "Темний Жнець накладає прокляття страху.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">⛓</span>️", egoal: 1 },
                { move: "b1c3", turn: 'white', title: "Братерство Світла", text: "Другий вершник виходить із тіней Екзодару.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">🤺</span>" },
                { move: "b8c6", turn: 'black', title: "Тінь підкрадається", text: "Армія Безодні закликає своїх вершників.", icon: "<span class="icon-placeholder" data-icon="cyclone">🌀</span>" },
                { move: "h2h3", turn: 'white', title: "Слово Очищення", text: "Воздаятель направляє іскру Світла.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">☀</span>️" },
                { move: "g4h5", turn: 'black', title: "Впертість Полеглих", text: "Жнець відступає лише на крок.", icon: "<span class="icon-placeholder" data-icon="dark-moon">🌑</span>" },
                { move: "f3e5", turn: 'white', title: "Жертва Наару", text: "Елезар розриває ланцюги і кидається в атаку!", icon: "<span class="icon-placeholder" data-icon="lightning">⚡</span>", capture: true },
                { move: "h5d1", turn: 'black', title: "Тріумф Хаосу", text: "Жнець повалює лідера Світла. Темрява радіє.", icon: "<span class="icon-placeholder" data-icon="skull">💀</span>", egoal: 2, capture: true },
                { move: "c4f7", turn: 'white', title: "Удар Спокути", text: "Промінь енергії вражає чоло Темного Короля!", icon: "<span class="icon-placeholder" data-icon="trident">🔱</span>", capture: true },
                { move: "e8e7", turn: 'black', title: "Ганебна втеча", text: "Повалений лідер Темряви змушений тікати.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">😰</span>" },
                { move: "c3d5", turn: 'white', title: "ВИРОК СВІТЛА", text: "Другий вершник наздоганяє тирана.", icon: "<span class="icon-placeholder" data-icon="crown">👑</span>", goal: 2 }
            ]
        },
        standard: {
            goals: ["Освячення рубежу", "Знищення перепони", "ПЕРЕМОГА ОРДЕНУ"],
            egoals: ["Лють у відповідь", "Криваві жнива", "Самопожертва рабів"],
            story: [
                { move: "e2e4", turn: 'white', title: "Прапор Світла", text: "Юний лицар встромляє штандарт у суху землю.", icon: "<span class="icon-placeholder" data-icon="flag">🚩</span>", goal: 0 },
                { move: "e7e5", turn: 'black', title: "Ріг Війни", text: "Вождь кочівників приймає виклик.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">🪓</span>", egoal: 0 },
                { move: "g1f3", turn: 'white', title: "Клятва Вершника", text: "Лицар робить випад у горло ворогу.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">🐎</span>" },
                { move: "d7d6", turn: 'black', title: "Кам'яна Черепаха", text: "Кочівники змикають щити.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">🐢</span>" },
                { move: "f1c4", turn: 'white', title: "Око Юстиціарія", text: "Старий воєвода шукає щілину в шоломі вождя.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">👁</span>️" },
                { move: "h7h6", turn: 'black', title: "Тінь Сумніву", text: "Вождь наказує підняти щити вище.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">☁</span>️" },
                { move: "d2d4", turn: 'white', title: "Удар Молота", text: "Основні сили ордену йдуть на таран.", icon: "<span class="icon-placeholder" data-icon="hammer">🔨</span>", goal: 1 },
                { move: "e5d4", turn: 'black', title: "Криваві Жнива", text: "Кочівники розступаються, заманюючи в пастку.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">🩸</span>", egoal: 1, capture: true },
                { move: "c2c3", turn: 'white', title: "Дар Мученика", text: "Паладини кидають щити, щоб бути швидшими.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">🕊</span>️" },
                { move: "d4c3", turn: 'black', title: "Бенкет Стерв'ятника", text: "Кочівники вгризаються в пролом.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">🦅</span>", capture: true },
                { move: "c4f7", turn: 'white', title: "Гнів Юстиціарія", text: "Клинок воєводи розрубує трон вождя!", icon: "<span class="icon-placeholder" data-icon="icon-unknown">⚔</span>️", capture: true },
                { move: "e8f7", turn: 'black', title: "Лють у відповідь", text: "Вождь зносить голову воєводі.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">👺</span>", capture: true },
                { move: "f3e5", turn: 'white', title: "Вирок Небес", text: "Вершник влітає в саму гущу битви.", icon: "<span class="icon-placeholder" data-icon="lightning">⚡</span>" },
                { move: "f7e8", turn: 'black', title: "Шлях Боягуза", text: "Воїн тікає до своїх шатрів.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">🏃</span>" },
                { move: "d1h5", turn: 'white', title: "Поклик Відкупительки", text: "Світло спопеляє варту вождя.", icon: "<span class="icon-placeholder" data-icon="trident">🔱</span>" },
                { move: "g7g6", turn: 'black', title: "Останній Заслін", text: "Охоронці кидаються в полум'я.", icon: "<span class="icon-placeholder" data-icon="fire">🔥</span>", egoal: 2 },
                { move: "h5g6", turn: 'white', title: "Сяйво", text: "Світло проходить крізь плоть і кістки.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">🔆</span>", capture: true },
                { move: "e8e7", turn: 'black', title: "Тінь Агонії", text: "Вождя загнано до урвища.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">🌫</span>️" },
                { move: "g6f7", turn: 'white', title: "ВІЧНИЙ СПОКІЙ", text: "Останній удар завдано.", icon: "<span class="icon-placeholder" data-icon="trophy">🏆</span>", goal: 2 }
            ]
        },
        traxler: {
            goals: ["Захопити центр", "Штурм форпосту f7", "Повалити Монарха"],
            egoals: ["Стримати натиск", "Пастка Тракслера", "Страта Короля"],
            story: [
                { move: "e2e4", turn: 'white', title: "Вторгнення", text: "Біле Сонце висуває авангард.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">⚔</span>️", goal: 0 },
                { move: "e7e5", turn: 'black', title: "Відповідь Місяця", text: "Чорний легіон блокує просування.", icon: "<span class="icon-placeholder" data-icon="shield-alt">🛡</span>️", egoal: 0 },
                { move: "g1f3", turn: 'white', title: "Кіннота", text: "Сер Фредерік виходить на фланг.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">🐎</span>" },
                { move: "b8c6", turn: 'black', title: "Перехоплення", text: "Чорні вершники виходять назустріч.", icon: "♞" },
                { move: "f1c4", turn: 'white', title: "Висоти", text: "Інквізитор бачить слабку стіну.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">⛪</span>" },
                { move: "g8f6", turn: 'black', title: "Пастка", text: "Ворог випускає лицаря.", icon: "<span class="icon-placeholder" data-icon="dark-moon">🌑</span>" },
                { move: "f3g5", turn: 'white', title: "Штурм", text: "Списи спрямовані на f7.", icon: "<span class="icon-placeholder" data-icon="fire">🔥</span>", goal: 1 },
                { move: "f8c5", turn: 'black', title: "Тракслер", text: "Гамбіт божевілля активовано!", icon: "<span class="icon-placeholder" data-icon="icon-unknown">⚠</span>️", egoal: 1 },
                { move: "g5f7", turn: 'white', title: "Прорив", text: "Лицар вривається у вежу!", icon: "<span class="icon-placeholder" data-icon="icon-unknown">🍴</span>", capture: true },
                { move: "c5f2", turn: 'black', title: "Вибух", text: "Чорний диверсант підриває браму!", icon: "<span class="icon-placeholder" data-icon="collision">💥</span>", capture: true },
                { move: "e1f2", turn: 'white', title: "Страта", text: "Монарх особисто вбиває диверсанта.", icon: "<span class="icon-placeholder" data-icon="crown">👑</span>", capture: true },
                { move: "f6e4", turn: 'black', title: "Наліт", text: "Чорний Лицар у тронній залі!", icon: "<span class="icon-placeholder" data-icon="icon-unknown">☁</span>️", capture: true },
                { move: "f2g1", turn: 'white', title: "Тінь", text: "Король ховається в кутку.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">🏃</span>" },
                { move: "d8h4", turn: 'black', title: "Королева", text: "Чорна Володарка обертає камінь на попіл.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">👸</span>" },
                { move: "f7h8", turn: 'white', title: "Жадібність", text: "Ваш Лицар грабує скарбницю.", icon: "<span class="icon-placeholder" data-icon="icon-unknown">💎</span>", capture: true },
                { move: "h4f2", turn: 'black', title: "Крах", text: "Історію Імперії завершено.", icon: "<span class="icon-placeholder" data-icon="skull">💀</span>", goal: 2, egoal: 2 }
            ]
        }
    }
};

// Глобальная переменная для текущих загруженных сценариев (обновляется в script.js)
let scenarios = {};
