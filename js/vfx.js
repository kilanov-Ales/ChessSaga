class VFXManager {
    constructor() {
        this.particles = [];
        this.bloodTrails = [];
        this.kingPlea = null; // { square: 'e4', active: false }
        
        this.lastTime = performance.now();
        this.animationId = null;

        // Debounced resize — fires on orientation change, window resize, fullscreen toggle
        let _resizeTimer = null;
        window.addEventListener('resize', () => {
            clearTimeout(_resizeTimer);
            _resizeTimer = setTimeout(() => this.resize(), 100);
        });
        window.addEventListener('orientationchange', () => {
            // orientationchange fires before the new dimensions are available;
            // wait ~300ms for the browser to reflow before resizing the canvas.
            setTimeout(() => this.resize(), 350);
        });
    }

    start() {
        if (!this.animationId) {
            this.lastTime = performance.now();
            this.loop();
        }
    }

    loop() {
        this.animationId = requestAnimationFrame(() => this.loop());
        
        const now = performance.now();
        const dt = (now - this.lastTime) / 1000;
        this.lastTime = now;

        const canvas = this._getActiveCanvas();
        if (!canvas) return; // If no canvas is found, it will just not draw.

        const ctx = canvas.getContext('2d');
        
        // Ensure canvas size matches its container (chess-board-outer)
        if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        this._updateAndDrawParticles(ctx, dt);
        this._updateAndDrawBloodTrails(ctx, dt);
        this._drawKingPlea(ctx, now);
    }

    _getActiveCanvas() {
        return Array.from(document.querySelectorAll('.vfx-canvas')).find(c => c.offsetParent !== null);
    }

    // Gets pixel coordinates of a square (e.g., 'e4') relative to the ACTIVE canvas
    _getSquareCenter(square) {
        // Find visible square element
        const squareEl = Array.from(document.querySelectorAll(`.square-${square}`)).find(el => el.offsetParent !== null);
        if (!squareEl) return null;

        const canvas = this._getActiveCanvas();
        if (!canvas) return null;

        const boardRect = canvas.getBoundingClientRect();
        const sqRect = squareEl.getBoundingClientRect();

        return {
            x: sqRect.left - boardRect.left + sqRect.width / 2,
            y: sqRect.top - boardRect.top + sqRect.height / 2,
            size: sqRect.width
        };
    }

    // --- EFFECTS ---

    spawnShadowDeath(square) {
        const center = this._getSquareCenter(square);
        if (!center) return;
        this._spawnShadowDeathRaw(center.x, center.y);
    }

    _spawnShadowDeathRaw(x, y) {
        for (let i = 0; i < 40; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 60 + 20; // 20 to 80 px/s
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                maxLife: Math.random() * 0.6 + 0.4, // 0.4s to 1.0s
                size: Math.random() * 15 + 10,
                color: Math.random() > 0.5 ? 'rgba(20, 20, 25, ' : 'rgba(30, 20, 40, '
            });
        }
        this.start();
    }

    spawnBloodTrail(fromSquare, toSquare) {
        const start = this._getSquareCenter(fromSquare);
        const end = this._getSquareCenter(toSquare);
        if (!start || !end) return;

        const dist = Math.hypot(end.x - start.x, end.y - start.y);
        const count = Math.max(8, Math.floor(dist / 12)); // frequency of drops

        for (let i = 0; i < count; i++) {
            const t = i / count;
            const x = start.x + (end.x - start.x) * t;
            const y = start.y + (end.y - start.y) * t;

            // jitter to make it look scattered
            const jx = x + (Math.random() - 0.5) * 15;
            const jy = y + (Math.random() - 0.5) * 15;

            this.bloodTrails.push({
                x: jx,
                y: jy,
                life: 1.0,
                maxLife: 2.0 + Math.random() * 3.0, // Lasts 2-5 seconds
                size: Math.random() * 4 + 2, // 2-6px drops
            });
        }
        this.start();
    }

    startKingPlea(square) {
        this.kingPlea = { square, startTime: performance.now() };
        this.start();
    }

    stopKingPlea() {
        this.kingPlea = null;
    }

    // ── Resize: called on window resize / orientation change ──────────
    resize() {
        // Re-stamp every VFX canvas to its current CSS size
        document.querySelectorAll('.vfx-canvas').forEach(canvas => {
            const w = canvas.clientWidth;
            const h = canvas.clientHeight;
            if (w > 0 && h > 0 && (canvas.width !== w || canvas.height !== h)) {
                canvas.width  = w;
                canvas.height = h;
            }
        });

        // Purge particles that would now render outside the new bounds
        // (prevents ghost particles floating in empty space after a landscape→portrait flip)
        const canvas = this._getActiveCanvas();
        if (!canvas) return;
        const { width: W, height: H } = canvas;
        const margin = 60; // allow slight overshoot before culling
        this.particles   = this.particles.filter(p => p.x > -margin && p.x < W + margin && p.y > -margin && p.y < H + margin);
        this.bloodTrails = this.bloodTrails.filter(p => p.x > -margin && p.x < W + margin && p.y > -margin && p.y < H + margin);
    }

    // --- RENDERING ---

    _updateAndDrawParticles(ctx, dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= dt / p.maxLife;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            p.x += p.vx * dt;
            p.y += p.vy * dt;

            // Slow down over time (drag)
            p.vx *= 0.95;
            p.vy *= 0.95;

            // Expand
            p.size += dt * 10;

            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.max(0.1, p.size), 0, Math.PI * 2);
            ctx.fillStyle = p.color + (p.life * 0.8) + ')'; // fades out
            ctx.fill();
        }
    }

    _updateAndDrawBloodTrails(ctx, dt) {
        for (let i = this.bloodTrails.length - 1; i >= 0; i--) {
            const p = this.bloodTrails[i];
            p.life -= dt / p.maxLife;

            if (p.life <= 0) {
                this.bloodTrails.splice(i, 1);
                continue;
            }

            // Dripping effect
            p.y += dt * (5 + Math.random() * 10); 

            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.max(0.1, p.size), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(128, 111, 170, ${p.life * 0.8})`; // Arcane Purple
            ctx.shadowColor = 'rgba(194, 163, 255, 0.5)';
            ctx.shadowBlur = 4;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    _drawKingPlea(ctx, now) {
        if (!this.kingPlea) return;
        
        const center = this._getSquareCenter(this.kingPlea.square);
        if (!center) return;

        const time = (now - this.kingPlea.startTime) / 1000;
        const pulse = Math.sin(time * Math.PI * 3) * 0.5 + 0.5; // Rapid heartbeat pulse

        // Jagged aura radius
        const baseRadius = center.size * 0.6;
        const radius = baseRadius + pulse * (center.size * 0.2) + Math.random() * 4;

        ctx.beginPath();
        ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);

        const gradient = ctx.createRadialGradient(
            center.x, center.y, center.size * 0.2, 
            center.x, center.y, radius
        );
        gradient.addColorStop(0, `rgba(194, 163, 255, ${0.4 + pulse * 0.4})`);
        gradient.addColorStop(1, 'rgba(194, 163, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.fill();
    }
}

window.vfxManager = new VFXManager();
