class ProgressionManager {
    constructor() {
        this.level = 1;
        this.currentXP = 0;
        this.nextLevelXP = 150; // Formula: 1 * 100 + 50
        this.currentAvatar = 'Visualization/avatars/avatar-shadow.png';

        this.titles = [
            { min: 1,  max: 5,  name: 'Послушник' },
            { min: 6,  max: 10, name: 'Тень' },
            { min: 11, max: 15, name: 'Адепт' },
            { min: 16, max: 20, name: 'Магистр' },
            { min: 21, max: 30, name: 'Лорд Бездны' },
            { min: 31, max: 999, name: 'Оракул' }
        ];

        this.loadState();
    }

    // Load from localStorage
    loadState() {
        const d = localStorage.getItem('chess_saga_progression');
        if (d) {
            try {
                const data = JSON.parse(d);
                this.level = data.level || 1;
                this.currentXP = data.currentXP || 0;
                this.currentAvatar = data.currentAvatar || 'Visualization/avatars/avatar-shadow.png';
                this._calculateNextTier();
            } catch (e) {
                console.error("Progression parse error", e);
            }
        } else {
            this._calculateNextTier();
        }
    }

    saveState() {
        localStorage.setItem('chess_saga_progression', JSON.stringify({
            level: this.level,
            currentXP: this.currentXP,
            currentAvatar: this.currentAvatar
        }));
    }

    _calculateNextTier() {
        this.nextLevelXP = this.level * 100 + 50;
    }

    getTitle() {
        // Find title tier
        for (let t of this.titles) {
            if (this.level >= t.min && this.level <= t.max) {
                return t.name;
            }
        }
        return 'Оракул';
    }

    addXP(amount) {
        this.currentXP += amount;
        let leveledUp = false;

        while (this.currentXP >= this.nextLevelXP) {
            this.currentXP -= this.nextLevelXP;
            this.level++;
            this._calculateNextTier();
            leveledUp = true;
        }

        this.saveState();
        this.updateUI();

        if (leveledUp) {
            this._triggerLevelUp();
        }
    }

    setAvatar(avatarPath) {
        this.currentAvatar = avatarPath;
        this.saveState();
        this.updateUI();
        this.closeAvatarModal();
    }

    updateUI() {
        const avatarImgs = document.querySelectorAll('.profile-avatar-img');
        const levelTexts = document.querySelectorAll('.profile-level-text');
        const xpFills = document.querySelectorAll('.profile-xp-fill');
        const xpTexts = document.querySelectorAll('.profile-xp-text');

        avatarImgs.forEach(img => img.src = this.currentAvatar);
        levelTexts.forEach(txt => txt.textContent = `Уровень ${this.level} • ${this.getTitle()}`);
        
        const pct = Math.min(100, Math.max(0, (this.currentXP / this.nextLevelXP) * 100));
        xpFills.forEach(fill => fill.style.width = pct + '%');
        xpTexts.forEach(txt => txt.textContent = `${this.currentXP} / ${this.nextLevelXP} XP`);
    }

    _triggerLevelUp() {
        // Voice
        if (typeof window.speak === 'function') {
            window.speak("Твоя сила растёт. Уровень повышен!", "oracle");
        }
        
        // VFX Burst on 'e4'
        if (window.vfxManager) {
            window.vfxManager.spawnShadowDeath('e4');
        }

        // Add a glow to the profile bar for a second
        const profileContainers = document.querySelectorAll('.player-profile-container');
        profileContainers.forEach(container => {
            container.classList.add('level-up-glow');
            setTimeout(() => container.classList.remove('level-up-glow'), 2000);
        });
    }

    openAvatarModal() {
        const modal = document.getElementById('avatar-modal');
        if (modal) modal.style.display = 'flex';
    }

    closeAvatarModal() {
        const modal = document.getElementById('avatar-modal');
        if (modal) modal.style.display = 'none';
    }
}

// Global instance
window.progressionManager = new ProgressionManager();

// Update UI initially when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    window.progressionManager.updateUI();
});
