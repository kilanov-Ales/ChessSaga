const audioFolderPath = "audio/";

// ─────────────────────────────────────────────────────────────────────────────
// Music catalog
// ─────────────────────────────────────────────────────────────────────────────
const MUSIC_CATALOG = {
    ambient: [
        'Ambient/Base Ambient (1).mp3',
        'Ambient/Base Ambient (2).mp3',
        'Ambient/Base Ambient (3).mp3',
        'Ambient/Base-Ambient-_1_.mp3'
    ],
    battle: [
        'Soundtrack/Soundtrack.mp3',
        'Soundtrack/Soundtrack (2).mp3',
        'Soundtrack/Soundtrack (3).mp3'
    ],
    tension: [
        'Ambient/Frightening environment.mp3',
        'Soundtrack/Epic soundtrack.mp3'
    ],
    climax: 'Soundtrack/End of soundtrack.mp3'
};

// ─────────────────────────────────────────────────────────────────────────────
// AudioManager — master controller
// ─────────────────────────────────────────────────────────────────────────────
class AudioManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();

        // Four independent HTML5 Audio channels
        this.channels = {
            music:   new Audio(),
            ambient: new Audio(),    // kept for legacy calls from outside
            sfx:     new Audio(),
            voice:   new Audio()
        };

        this.channels.music.loop   = true;
        this.channels.ambient.loop = true;

        // Volume settings read from localStorage (fallback to 0.5)
        this.baseMusicVolume = parseFloat(
            localStorage.getItem('chess_saga_music_vol') ?? '0.5'
        );
        this.voiceVolume = parseFloat(
            localStorage.getItem('chess_saga_voice_vol') ?? '0.5'
        );

        // Dark-Alchemy voice FX
        this.voicePitch             = parseFloat(localStorage.getItem('chess_saga_voice_pitch') ?? '1.0');
        this.voiceDistortionAmount  = parseInt(localStorage.getItem('chess_saga_voice_dist')   ?? '0', 10);

        // State tracking
        this.currentMusicPath  = null;
        this.currentMusicState = null;   // 'ambient' | 'battle' | 'tension' | 'climax'
        this.initialized       = false;
        this.isStoppedAll      = false;

        // Fade-interval registry keyed by channel name — prevents memory leaks
        this._fades = {};
    }

    // ── Init (called once on first user gesture) ──────────────────────────────
    init() {
        if (this.initialized) return;
        this.initialized = true;

        if (this.ctx.state === 'suspended') this.ctx.resume();

        this._setupVoiceEffects();
        this._applyVolumes();

        if (window.vfxManager) window.vfxManager.start();

        // Start in ambient mode (menu)
        this.playStateAmbient();
    }

    // ══════════════════════════════════════════════════════════════════════════
    // PUBLIC STATE METHODS — these are what game.js calls
    // ══════════════════════════════════════════════════════════════════════════

    /** Menu, Forge, Scroll Hall — random ambient track, 2 s crossfade */
    playStateAmbient() {
        if (!this.initialized || this.isStoppedAll) return;
        if (this.currentMusicState === 'ambient') return;   // already ambient
        this.currentMusicState = 'ambient';
        const track = this._pickRandom(MUSIC_CATALOG.ambient, this.currentMusicPath);
        this.crossfadeTo(track, 2000);
    }

    /** Game started — random battle track, 2 s crossfade */
    playStateBattle() {
        if (!this.initialized || this.isStoppedAll) return;
        if (this.currentMusicState === 'battle') return;
        this.currentMusicState = 'battle';
        const track = this._pickRandom(MUSIC_CATALOG.battle, this.currentMusicPath);
        this.crossfadeTo(track, 2000);
    }

    /** Board tension (check / late-game) — fast 1 s crossfade */
    playStateTension() {
        if (!this.initialized || this.isStoppedAll) return;
        if (this.currentMusicState === 'tension') return;
        this.currentMusicState = 'tension';
        const track = this._pickRandom(MUSIC_CATALOG.tension, this.currentMusicPath);
        this.crossfadeTo(track, 1000);
    }

    /** Checkmate / game over — slam everything in 0.5 s, play climax once */
    async playStateClimax() {
        if (!this.initialized) return;
        if (this.currentMusicState === 'climax') return;
        this.currentMusicState = 'climax';
        this.isStoppedAll = true;   // block any future crossfade from overriding

        const ch = this.channels.music;
        const DURATION = 500;
        const STEPS    = 15;
        const stepTime = DURATION / STEPS;
        const startVol = ch.volume;

        this._killFades('music');
        
        const climaxUrl = await this.loadTrack(MUSIC_CATALOG.climax);

        let s = 0;
        this._fades['music_out'] = setInterval(() => {
            s++;
            ch.volume = Math.max(0, startVol * (1 - s / STEPS));
            if (s >= STEPS) {
                clearInterval(this._fades['music_out']);
                this._fades['music_out'] = null;

                ch.loop    = false;
                ch.src     = climaxUrl;
                ch.volume  = this._targetMusicVol();
                this.currentMusicPath = MUSIC_CATALOG.climax;

                // Allow this one track to play through (re-enable stopAll guard after)
                this.isStoppedAll = false;
                ch.play().catch(e => console.warn('[AudioManager] climax play:', e));
                this.isStoppedAll = true;
            }
        }, stepTime);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // CROSSFADE ENGINE
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * crossfadeTo(newTrackPath, duration = 2000)
     *
     * Fades current music track out over `duration` ms, then fades the new
     * track in over the same duration.  Cleans up any previous fade intervals
     * before starting so there are no leaked timers.
     */
    async loadTrack(trackPath) {
        const fullPath = audioFolderPath + trackPath;
        if (window.AssetManager) {
            return await window.AssetManager.loadTrack(fullPath);
        }
        return fullPath;
    }

    async crossfadeTo(newTrackPath, duration = 2000) {
        if (!this.initialized || this.isStoppedAll) return;
        if (this.currentMusicPath === newTrackPath) return;

        this.currentMusicPath = newTrackPath;
        const ch      = this.channels.music;
        const STEPS   = 30;
        const stepMs  = duration / STEPS;

        this._killFades('music');
        
        const srcUrl = await this.loadTrack(newTrackPath);
        if (this.currentMusicPath !== newTrackPath) return;

        // Nothing playing yet — start immediately at target volume
        if (ch.paused || !ch.src) {
            ch.loop   = true;
            ch.src    = srcUrl;
            ch.volume = 0;
            ch.play().catch(e => console.warn('[AudioManager] play:', e));
            this._fadeIn(ch, STEPS, stepMs);
            return;
        }

        // ── Fade out current track ────────────────────────────────────────────
        const startVol = ch.volume;
        let s = 0;
        this._fades['music_out'] = setInterval(() => {
            s++;
            ch.volume = Math.max(0, startVol * (1 - s / STEPS));

            if (s >= STEPS) {
                clearInterval(this._fades['music_out']);
                this._fades['music_out'] = null;

                ch.loop   = true;
                ch.src    = srcUrl;
                ch.volume = 0;
                ch.play().catch(e => console.warn('[AudioManager] play:', e));

                // ── Fade in new track ─────────────────────────────────────────
                this._fadeIn(ch, STEPS, stepMs);
            }
        }, stepMs);
    }

    // ── Internal fade-in helper ───────────────────────────────────────────────
    _fadeIn(ch, steps, stepMs) {
        let s = 0;
        this._fades['music_in'] = setInterval(() => {
            s++;
            ch.volume = this._targetMusicVol() * (s / steps);
            if (s >= steps) {
                clearInterval(this._fades['music_in']);
                this._fades['music_in'] = null;
                ch.volume = this._targetMusicVol();
                this._applyVolumes();   // sync all channels
            }
        }, stepMs);
    }

    // ── Kill all pending fade timers for a channel ────────────────────────────
    _killFades(channel) {
        ['_out', '_in'].forEach(suffix => {
            const key = channel + suffix;
            if (this._fades[key]) {
                clearInterval(this._fades[key]);
                this._fades[key] = null;
            }
        });
    }

    // ══════════════════════════════════════════════════════════════════════════
    // LEGACY HELPERS (kept so existing callers don't break)
    // ══════════════════════════════════════════════════════════════════════════

    /** @deprecated — prefer playStateAmbient / playStateBattle etc. */
    playMusic(trackName)   { this.crossfadeTo(trackName, 2000); }
    /** @deprecated */
    playAmbient(trackName) { this.crossfadeTo(trackName, 2000); }

    /** SFX — instant, no crossfade */
    async playSFX(trackName) {
        if (!this.initialized) return;
        const url = await this.loadTrack(trackName);
        this.ctx.resume().then(() => {
            this.channels.sfx.src    = url;
            this.channels.sfx.volume = this.baseMusicVolume;
            this.channels.sfx.play().catch(e => console.warn('[AudioManager] sfx:', e));
        });
    }

    stopAll() {
        this.isStoppedAll = true;
        this._killFades('music');
        Object.values(this.channels).forEach(ch => { ch.pause(); ch.src = ""; });
        this.currentMusicPath  = null;
        this.currentMusicState = null;
    }

    // ══════════════════════════════════════════════════════════════════════════
    // VOLUME
    // ══════════════════════════════════════════════════════════════════════════

    _targetMusicVol() {
        const base = this.baseMusicVolume * 0.3;
        const inMenu = window.isMainMenu || false;
        let vol = inMenu ? base * 0.25 : base;
        if (window.isSpeaking || !this.channels.voice.paused) vol *= 0.1;
        return Math.max(0, Math.min(1, vol));
    }

    _applyVolumes() {
        const mv = this._targetMusicVol();
        // Only set if a fade isn't in progress (don't stomp on fading)
        if (!this._fades['music_out'] && !this._fades['music_in']) {
            this.channels.music.volume = mv;
        }
        this.channels.ambient.volume = mv;    // legacy channel
        this.channels.sfx.volume     = this.baseMusicVolume;
        this.channels.voice.volume   = this.voiceVolume;
        if (this.voiceGainBox) this.voiceGainBox.gain.value = this.voiceVolume;
    }

    updateVolume(val) {
        this.baseMusicVolume = parseFloat(val);
        localStorage.setItem('chess_saga_music_vol', val);
        this._applyVolumes();
    }

    updateVoiceVolume(val) {
        this.voiceVolume = parseFloat(val);
        localStorage.setItem('chess_saga_voice_vol', val);
        this._applyVolumes();
    }

    updateVoicePitch(val) {
        this.voicePitch = parseFloat(val);
        localStorage.setItem('chess_saga_voice_pitch', val);
        if (this.channels.voice) {
            this.channels.voice.preservesPitch = false;
            this.channels.voice.playbackRate   = this.voicePitch;
        }
    }

    updateVoiceDistortion(val) {
        this.voiceDistortionAmount = parseInt(val, 10);
        localStorage.setItem('chess_saga_voice_dist', val);
        if (this.distortionNode) {
            this.distortionNode.curve = this._makeDistortionCurve(this.voiceDistortionAmount);
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // VOICE FX (Web Audio chain)
    // ══════════════════════════════════════════════════════════════════════════

    _setupVoiceEffects() {
        if (this.voiceEffectsSetup) return;
        this.voiceEffectsSetup = true;

        this.voiceSourceNode   = this.ctx.createMediaElementSource(this.channels.voice);
        this.distortionNode    = this.ctx.createWaveShaper();
        this.distortionNode.curve      = this._makeDistortionCurve(this.voiceDistortionAmount);
        this.distortionNode.oversample = '4x';

        this.reverbNode        = this.ctx.createConvolver();
        this.reverbNode.buffer = this._createImpulseResponse();

        this.voiceGainBox      = this.ctx.createGain();
        this.voiceGainBox.gain.value = this.voiceVolume;

        // Chain: Source → Distortion → Reverb → Gain → Destination
        this.voiceSourceNode.connect(this.distortionNode);
        this.distortionNode.connect(this.reverbNode);
        this.reverbNode.connect(this.voiceGainBox);
        this.voiceGainBox.connect(this.ctx.destination);
    }

    _makeDistortionCurve(amount) {
        if (amount <= 0) return new Float32Array([0, 0]);
        const k = amount * 2;
        const n = 44100;
        const curve = new Float32Array(n);
        const deg = Math.PI / 180;
        for (let i = 0; i < n; i++) {
            const x = i * 2 / n - 1;
            curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
        }
        return curve;
    }

    _createImpulseResponse() {
        const rate   = this.ctx.sampleRate || 44100;
        const length = rate * 2;
        const buf    = this.ctx.createBuffer(2, length, rate);
        [buf.getChannelData(0), buf.getChannelData(1)].forEach(ch => {
            for (let i = 0; i < length; i++) {
                ch[i] = (Math.random() * 2 - 1) * Math.exp(-i / (rate * 0.3));
            }
        });
        return buf;
    }

    // ── Utilities ─────────────────────────────────────────────────────────────

    /** Pick a random track from an array, avoiding the currently playing one if possible */
    _pickRandom(arr, current) {
        const filtered = arr.filter(t => t !== current);
        const pool     = filtered.length ? filtered : arr;
        return pool[Math.floor(Math.random() * pool.length)];
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Singleton
// ─────────────────────────────────────────────────────────────────────────────
window.audioManager = new AudioManager();

// ─────────────────────────────────────────────────────────────────────────────
// Global volume proxies (called from HTML sliders)
// ─────────────────────────────────────────────────────────────────────────────
window.updateVolume = function(val) {
    window.audioManager.updateVolume(val);
    document.querySelectorAll('.volume-slider, .menu-volume-slider')
        .forEach(s => s.value = val);
};

window.updateVoiceVolume = function(val) {
    window.audioManager.updateVoiceVolume(val);
    document.querySelectorAll('input[oninput="updateVoiceVolume(this.value)"]')
        .forEach(s => s.value = val);
};

window.updateVoicePitch = function(val) {
    window.audioManager.updateVoicePitch(val);
    document.querySelectorAll('input[oninput="updateVoicePitch(this.value)"]')
        .forEach(s => s.value = val);
};

window.updateVoiceDistortion = function(val) {
    window.audioManager.updateVoiceDistortion(val);
    document.querySelectorAll('input[oninput="updateVoiceDistortion(this.value)"]')
        .forEach(s => s.value = val);
};

// ─────────────────────────────────────────────────────────────────────────────
// Hook: first user gesture triggers AudioContext resume + init
// ─────────────────────────────────────────────────────────────────────────────
document.addEventListener('click', () => window.audioManager.init(), { once: true });

// ─────────────────────────────────────────────────────────────────────────────
// Sync sliders on DOMContentLoaded
// ─────────────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const am = window.audioManager;
    document.querySelectorAll('.volume-slider, .menu-volume-slider')
        .forEach(s => s.value = am.baseMusicVolume);
    document.querySelectorAll('input[oninput="updateVoiceVolume(this.value)"]')
        .forEach(s => s.value = am.voiceVolume);
    document.querySelectorAll('input[oninput="updateVoicePitch(this.value)"]')
        .forEach(s => s.value = am.voicePitch);
    document.querySelectorAll('input[oninput="updateVoiceDistortion(this.value)"]')
        .forEach(s => s.value = am.voiceDistortionAmount);
});

// ─────────────────────────────────────────────────────────────────────────────
// Legacy global functions (kept for backward compat with index.html calls)
// ─────────────────────────────────────────────────────────────────────────────
window.resumeAudio          = () => window.audioManager.init();
window.applyMenuVolumeLogic = () => window.audioManager._applyVolumes();

// ─────────────────────────────────────────────────────────────────────────────
// Oracle voice narration
// ─────────────────────────────────────────────────────────────────────────────
window.isSpeaking = false;

window.speak = function(text, turn, stepAtMoment) {
    if (!window.audioManager.initialized) {
        if (typeof window.finalizeTurnLogic === 'function') window.finalizeTurnLogic();
        return;
    }

    window.isSpeaking = true;
    window.audioManager._applyVolumes();

    if (window.speechSynthesis) window.speechSynthesis.cancel();

    const lang   = localStorage.getItem('chess_saga_lang') || 'ru';
    const prefix = lang === 'en' ? 'E_' : lang === 'uk' ? 'U_' : '';

    let fileName = '';
    if (window.selectedScenarioKey && stepAtMoment !== undefined) {
        fileName = `${prefix}${window.selectedScenarioKey}_${stepAtMoment}.mp3`;
    }

    const voiceChannel = window.audioManager.channels.voice;
    voiceChannel.src   = audioFolderPath + 'Stories/' + fileName;

    voiceChannel.onended = () => {
        window.isSpeaking = false;
        window.audioManager._applyVolumes();
        if (typeof window.finalizeTurnLogic === 'function') window.finalizeTurnLogic();
    };

    voiceChannel.preservesPitch = false;
    voiceChannel.playbackRate   = window.audioManager.voicePitch || 1.0;

    voiceChannel.onerror = async () => {
        try {
            const baseUrl = window.API_URL
                ? window.API_URL.replace(/\/$/, '')
                : 'https://chess-api.kilanov.workers.dev';

            const res = await fetch(`${baseUrl}/tts`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ text, lang })
            });

            if (!res.ok) throw new Error('TTS proxy failed');
            const url = URL.createObjectURL(await res.blob());

            voiceChannel.onerror  = () => {
                window.isSpeaking = false;
                window.audioManager._applyVolumes();
                if (typeof window.finalizeTurnLogic === 'function') window.finalizeTurnLogic();
            };
            voiceChannel.onended = () => {
                URL.revokeObjectURL(url);
                window.isSpeaking = false;
                window.audioManager._applyVolumes();
                if (typeof window.finalizeTurnLogic === 'function') window.finalizeTurnLogic();
            };

            voiceChannel.src = url;
            voiceChannel.play().catch(() => voiceChannel.onerror());

        } catch (e) {
            console.error('[AudioManager] TTS fallback failed:', e);
            window.isSpeaking = false;
            window.audioManager._applyVolumes();
            if (typeof window.finalizeTurnLogic === 'function') window.finalizeTurnLogic();
        }
    };

    if (fileName) {
        voiceChannel.play().catch(() => voiceChannel.onerror());
    } else {
        voiceChannel.onerror();
    }
};
