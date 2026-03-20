class SettingsManager {
    constructor() {
        this.voiceVolume = 0.5;
        this.vfxEnabled = true;

        this.loadState();
    }

    loadState() {
        const d = localStorage.getItem('chess_saga_settings');
        if (d) {
            try {
                const data = JSON.parse(d);
                // BUGFIX: validate voiceVolume before applying (prevent NaN/string injection)
                const parsedVol = parseFloat(data.voiceVolume);
                if (!isNaN(parsedVol) && parsedVol >= 0 && parsedVol <= 1) {
                    this.voiceVolume = parsedVol;
                }
                if (data.vfxEnabled !== undefined) this.vfxEnabled = data.vfxEnabled;
            } catch (e) {
                console.error("Settings parse error", e);
            }
        }
    }

    saveState() {
        localStorage.setItem('chess_saga_settings', JSON.stringify({
            voiceVolume: this.voiceVolume,
            vfxEnabled: this.vfxEnabled
        }));
    }

    init() {
        // Apply Voice Volume
        if (typeof window.updateVoiceVolume === 'function') {
            window.updateVoiceVolume(this.voiceVolume);
        }
        
        // Update UI inputs
        const voiceSlider = document.getElementById('setting-voice-volume');
        if (voiceSlider) voiceSlider.value = this.voiceVolume;

        const vfxToggle = document.getElementById('setting-vfx-toggle');
        if (vfxToggle) vfxToggle.checked = this.vfxEnabled;

        this.applyVFXState();
    }

    applyVFXState() {
        if (window.vfxManager) {
            window.vfxManager.active = this.vfxEnabled;
            if (!this.vfxEnabled) {
                window.vfxManager.clear();
            }
        }
    }

    setVoiceVolume(val) {
        this.voiceVolume = parseFloat(val);
        this.saveState();
        if (typeof window.updateVoiceVolume === 'function') {
            window.updateVoiceVolume(this.voiceVolume);
        }
    }

    setVfxEnabled(val) {
        this.vfxEnabled = val;
        this.saveState();
        this.applyVFXState();
    }

    wipeMemory() {
        if (confirm('СЕРЬЕЗНЫЙ РИТУАЛ: Вы уверены, что хотите забыть все подвиги? Уровень Пазлов и Лорд-Аватар вернутся в Бездну.')) {
            localStorage.removeItem('chess_saga_progression');
            localStorage.removeItem('chess_saga_settings');
            // Reset puzzle counters
            localStorage.removeItem('solvedPuzzles'); 
            
            // Reload page
            window.location.reload();
        }
    }

    openModal() {
        const modal = document.getElementById('settings-modal-new');
        if (modal) modal.style.display = 'flex';
    }

    closeModal() {
        const modal = document.getElementById('settings-modal-new');
        if (modal) modal.style.display = 'none';
    }
}

window.settingsManager = new SettingsManager();

document.addEventListener('DOMContentLoaded', () => {
    window.settingsManager.init();
});
