window.AntiMat = {
    // Корни из твоего файла (ловит все производные, напр: "выебон", "нахуевертить")
    badRoots: [
        'хуй', 'хуя', 'хуе', 'хуё', 'хуи', 'пизд', 'пезд', 'ебан', 'ебат', 'ебл', 'ебу', 
        'ёба', 'ёбн', 'ёбс', 'ебт', 'ёбт', 'бляд', 'блят', 'шлюх', 'мудак', 'мудо', 'муди', 
        'гандон', 'гондон', 'пидор', 'пидар', 'педик', 'залуп', 'херн', 'охуе', 'хуищ', 'долбое',
        'fuck', 'shit', 'bitch', 'cunt', 'whore', 'faggot', 'nigger', 'asshole', 'bollocks', 
        'bullshit', 'prick', 'twat', 'minge', 'bellend', 'clunge', 'punani', 'gash', 'munter', 
        'feck', 'douchebag', 'bloodclaat', 'motherfucker', 'bastard',
        'пізд', 'їбан', 'довбойоб', 'хуї', 'лайно', 'покидьок', 'шльондр', 'курва', 'срака'
    ],
    
    // Короткие слова (блокируются только целиком)
    exactWords: [
        'ass', 'dick', 'cock', 'hoe', 'slut', 'fool', 'dumb', 'retard', 'freak', 'jerk',
        'бля', 'лох', 'даун', 'сука', 'суки', 'хер', 'член', 'чмо', 'мразь'
    ],
    
    // БЕЛЫЙ СПИСОК (Шахматные термины, которые не блокируются)
    whitelist: [
        'шах', 'мат', 'пешка', 'пешку', 'пешки', 'шахмат', 'король', 'короля', 'ферзь', 'ферзя', 
        'ладья', 'ладью', 'слон', 'слона', 'конь', 'коня', 'доска', 'доску', 'партия', 'партию', 'матч'
    ], 
    
    // Leetspeak и удаление пробелов
    normalize: function(text) {
        let s = text.toLowerCase();
        const leet = {
            '@': 'а', 'a': 'а', '0': 'о', 'o': 'о', '3': 'з', '1': 'і', '!': 'і', '$': 's',
            'x': 'х', 'y': 'у', 'p': 'р', 'c': 'с', 'm': 'м', 'k': 'к', 'e': 'е', 'i': 'і', 'u': 'и'
        };
        return s.split('').map(c => leet[c] || c).join('').replace(/[\s\.\,\-\_\!\?\(\)\[\]\{\}\=\+]/g, '');
    },

    check: function(text) {
        if (!text) return false;
        let lower = text.toLowerCase();
        
        for (let w of this.whitelist) {
            let regex = new RegExp(w, 'g');
            lower = lower.replace(regex, ''); 
        }

        const words = lower.match(/[a-zа-яёіїєґ]+/g) || [];
        if (words.some(w => this.exactWords.includes(w))) return true;

        const normalized = this.normalize(lower);
        if (this.badRoots.some(w => normalized.includes(w))) return true;

        return false; 
    },

    // Функция, заменяющая маты на ***
    censor: function(text) {
        if (!text) return text;
        if (!this.check(text)) return text; // Если чисто, возвращаем как есть

        let result = text;
        const wordRegex = /[a-zA-Zа-яА-ЯёЁїієґЇІЄҐ]+/g;
        let match;
        const matches = [];
        
        while ((match = wordRegex.exec(text)) !== null) {
            matches.push({word: match[0], index: match.index});
        }
        
        let censoredSomething = false;
        for (let i = matches.length - 1; i >= 0; i--) {
            let w = matches[i].word;
            let l = w.toLowerCase();
            
            if (this.whitelist.some(white => l.includes(white))) continue;
            
            let isBad = this.exactWords.includes(l);
            if (!isBad) {
                let norm = this.normalize(l);
                isBad = this.badRoots.some(root => norm.includes(root));
            }
            if (isBad) {
                result = result.substring(0, matches[i].index) + '***' + result.substring(matches[i].index + w.length);
                censoredSomething = true;
            }
        }
        
        // Если мат был через пробелы (напр. "х у й") и по словам его не вырезало
        if (!censoredSomething && this.check(result)) {
            return "***"; // Блокируем всю строку
        }
        
        return result;
    }
};
