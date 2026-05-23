// ========================================
// Morning Star — Phaser 3 Game
// A premium star-collecting platformer
// ========================================

// ---------- BOOT SCENE ----------
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Use Phaser's built-in assets from the Phaser Labs CDN
        const ASSET_BASE = 'https://labs.phaser.io/assets/';

        this.load.image('sky', ASSET_BASE + 'skies/space3.png');
        this.load.image('ground', ASSET_BASE + 'sprites/platform.png');
        this.load.image('star', ASSET_BASE + 'demoscene/star.png');
        this.load.image('bomb', ASSET_BASE + 'sprites/bomb.png');
        this.load.spritesheet('dude', ASSET_BASE + 'sprites/dude.png', {
            frameWidth: 32,
            frameHeight: 48
        });
        this.load.image('particle_white', ASSET_BASE + 'particles/white.png');
        this.load.image('particle_yellow', ASSET_BASE + 'particles/yellow.png');

        // Loading bar
        const { width, height } = this.cameras.main;
        const barW = 320, barH = 8;
        const barX = (width - barW) / 2;
        const barY = height / 2 + 40;

        const bg = this.add.graphics();
        bg.fillStyle(0x1a1a2e, 1);
        bg.fillRoundedRect(barX, barY, barW, barH, 4);

        const fill = this.add.graphics();
        this.load.on('progress', (v) => {
            fill.clear();
            fill.fillStyle(0xa855f7, 1);
            fill.fillRoundedRect(barX, barY, barW * v, barH, 4);
        });

        // Title while loading
        this.add.text(width / 2, height / 2 - 20, '☆ MORNING STAR ☆', {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '28px',
            fontStyle: 'bold',
            color: '#ffd700',
            shadow: { offsetX: 0, offsetY: 0, color: '#ffd700', blur: 20, fill: true }
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2 + 15, 'Loading...', {
            fontFamily: 'Inter, sans-serif',
            fontSize: '13px',
            color: '#9ca3af'
        }).setOrigin(0.5);
    }

    create() {
        this.time.delayedCall(400, () => {
            this.scene.start('MenuScene');
        });
    }
}

// ---------- MENU SCENE ----------
class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const { width, height } = this.cameras.main;

        // Animated background
        const sky = this.add.image(width / 2, height / 2, 'sky');
        sky.setDisplaySize(width, height);
        sky.setAlpha(0.6);

        // Floating stars in background
        this.floatingStars = [];
        for (let i = 0; i < 20; i++) {
            const s = this.add.image(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(0, height),
                'star'
            );
            s.setScale(Phaser.Math.FloatBetween(0.15, 0.4));
            s.setAlpha(Phaser.Math.FloatBetween(0.2, 0.6));
            s.setTint(Phaser.Math.RND.pick([0xffd700, 0xa855f7, 0x06b6d4, 0xec4899]));
            s._floatSpeed = Phaser.Math.FloatBetween(0.2, 0.8);
            s._floatOffset = Phaser.Math.FloatBetween(0, Math.PI * 2);
            s._baseY = s.y;
            this.floatingStars.push(s);
        }

        // Glow overlay
        const glow = this.add.graphics();
        glow.fillStyle(0x0a0a1a, 0.4);
        glow.fillRect(0, 0, width, height);

        // Title with glow
        const titleText = '✦ MORNING STAR ✦';
        const title = this.add.text(width / 2, height * 0.25, titleText, {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '42px',
            fontStyle: 'bold',
            color: '#ffd700',
            shadow: { offsetX: 0, offsetY: 0, color: '#ffd700', blur: 30, fill: true }
        }).setOrigin(0.5).setAlpha(0);

        // Subtitle
        const subtitle = this.add.text(width / 2, height * 0.25 + 50, 'Collect the Stars, Dodge the Danger', {
            fontFamily: 'Inter, sans-serif',
            fontSize: '15px',
            color: '#9ca3af',
            fontStyle: '300'
        }).setOrigin(0.5).setAlpha(0);

        // Animated player preview
        this.anims.create({
            key: 'menu_idle',
            frames: this.anims.generateFrameNumbers('dude', { start: 4, end: 4 }),
            frameRate: 1,
            repeat: -1
        });
        const playerPreview = this.add.sprite(width / 2, height * 0.50, 'dude');
        playerPreview.setScale(3);
        playerPreview.play('menu_idle');
        playerPreview.setAlpha(0);

        // Floating animation for player
        this.tweens.add({
            targets: playerPreview,
            y: height * 0.50 - 10,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Stars orbiting around player
        this.orbitStars = [];
        for (let i = 0; i < 5; i++) {
            const os = this.add.image(width / 2, height * 0.50, 'star');
            os.setScale(0.4);
            os.setAlpha(0);
            os._angle = (i / 5) * Math.PI * 2;
            os._radius = 60;
            os._centerX = width / 2;
            os._centerY = height * 0.50;
            this.orbitStars.push(os);
        }

        // Play button
        const btnY = height * 0.70;
        const btnBg = this.add.graphics();
        this.drawButton(btnBg, width / 2 - 100, btnY - 22, 200, 44, 0xa855f7, 0.9);

        const playBtn = this.add.text(width / 2, btnY, '▶  PLAY GAME', {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '16px',
            fontStyle: '600',
            color: '#ffffff'
        }).setOrigin(0.5).setAlpha(0);

        // Button interactive zone
        const btnZone = this.add.zone(width / 2, btnY, 200, 44).setInteractive({ useHandCursor: true });
        btnZone.on('pointerover', () => {
            this.drawButton(btnBg, width / 2 - 100, btnY - 22, 200, 44, 0xc084fc, 1);
            playBtn.setScale(1.05);
        });
        btnZone.on('pointerout', () => {
            this.drawButton(btnBg, width / 2 - 100, btnY - 22, 200, 44, 0xa855f7, 0.9);
            playBtn.setScale(1);
        });
        btnZone.on('pointerdown', () => {
            this.cameras.main.fade(500, 0, 0, 0);
            this.time.delayedCall(500, () => this.scene.start('GameScene'));
        });

        btnBg.setAlpha(0);

        // High score display
        const highScore = localStorage.getItem('morningstar_highscore') || 0;
        const hsText = this.add.text(width / 2, height * 0.82, `★ HIGH SCORE: ${highScore}`, {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '13px',
            color: '#ffd700',
            shadow: { offsetX: 0, offsetY: 0, color: '#ffd700', blur: 10, fill: true }
        }).setOrigin(0.5).setAlpha(0);

        // Controls info
        const controlsText = this.add.text(width / 2, height * 0.92, '← → MOVE  |  ↑ JUMP  |  SPACE JUMP', {
            fontFamily: 'Inter, sans-serif',
            fontSize: '11px',
            color: '#6b7280'
        }).setOrigin(0.5).setAlpha(0);

        // Entrance animations
        this.tweens.add({ targets: title, alpha: 1, y: title.y + 10, duration: 800, ease: 'Back.easeOut' });
        this.tweens.add({ targets: subtitle, alpha: 1, duration: 600, delay: 300 });
        this.tweens.add({ targets: playerPreview, alpha: 1, duration: 600, delay: 500 });
        this.tweens.add({ targets: this.orbitStars, alpha: 0.7, duration: 600, delay: 600 });
        this.tweens.add({ targets: [btnBg, playBtn], alpha: 1, duration: 600, delay: 800 });
        this.tweens.add({ targets: hsText, alpha: 1, duration: 600, delay: 1000 });
        this.tweens.add({ targets: controlsText, alpha: 0.6, duration: 600, delay: 1100 });

        // Title pulse
        this.tweens.add({
            targets: title,
            scaleX: 1.03,
            scaleY: 1.03,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.cameras.main.fadeIn(500, 0, 0, 0);
    }

    drawButton(gfx, x, y, w, h, color, alpha) {
        gfx.clear();
        gfx.fillStyle(color, alpha * 0.3);
        gfx.fillRoundedRect(x, y, w, h, 10);
        gfx.lineStyle(2, color, alpha);
        gfx.strokeRoundedRect(x, y, w, h, 10);
    }

    update(time) {
        // Floating background stars
        this.floatingStars.forEach(s => {
            s.y = s._baseY + Math.sin(time / 1000 * s._floatSpeed + s._floatOffset) * 15;
            s.rotation = Math.sin(time / 1500 * s._floatSpeed) * 0.3;
        });
        // Orbiting stars
        this.orbitStars.forEach(os => {
            os._angle += 0.015;
            os.x = os._centerX + Math.cos(os._angle) * os._radius;
            os.y = os._centerY + Math.sin(os._angle) * os._radius * 0.5;
        });
    }
}

// ---------- GAME SCENE ----------
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init() {
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.combo = 0;
        this.comboTimer = null;
        this.gameActive = true;
        this.starsCollected = 0;
        this.totalStarsThisLevel = 0;
        this.isInvincible = false;
        this.shieldActive = false;
    }

    create() {
        const { width, height } = this.cameras.main;

        // Create player animations
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'turn',
            frames: [{ key: 'dude', frame: 4 }],
            frameRate: 20
        });
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        // Background
        const sky = this.add.image(width / 2, height / 2, 'sky');
        sky.setDisplaySize(width, height);

        // Dark overlay for atmosphere
        const overlay = this.add.graphics();
        overlay.fillStyle(0x0a0a1a, 0.35);
        overlay.fillRect(0, 0, width, height);
        overlay.setDepth(0);

        // ---------- PLATFORMS ----------
        this.platforms = this.physics.add.staticGroup();
        this.createPlatforms();

        // ---------- PLAYER ----------
        this.player = this.physics.add.sprite(100, height - 150, 'dude');
        this.player.setBounce(0.15);
        this.player.setCollideWorldBounds(true);
        this.player.setDepth(5);

        // Trail effect container
        this.trailParticles = [];

        // ---------- STARS ----------
        this.stars = this.physics.add.group();
        this.spawnStars();

        // ---------- BOMBS ----------
        this.bombs = this.physics.add.group();

        // ---------- POWER-UPS ----------
        this.powerUps = this.physics.add.group();

        // ---------- COLLISIONS ----------
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.stars, this.platforms);
        this.physics.add.collider(this.bombs, this.platforms);
        this.physics.add.collider(this.powerUps, this.platforms);
        this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);
        this.physics.add.overlap(this.player, this.bombs, this.hitBomb, null, this);
        this.physics.add.overlap(this.player, this.powerUps, this.collectPowerUp, null, this);

        // ---------- CONTROLS ----------
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.wasd = {
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        };

        // ---------- UI ----------
        this.createUI();

        // Camera fade in
        this.cameras.main.fadeIn(500, 0, 0, 0);

        // Ambient particle effect
        this.createAmbientParticles();
    }

    createPlatforms() {
        const { width, height } = this.cameras.main;

        // Ground
        const groundY = height - 20;
        for (let x = 0; x < width; x += 400) {
            const g = this.platforms.create(x + 200, groundY, 'ground');
            g.setScale(1, 1).refreshBody();
            g.setTint(0x4a3b6b);
        }

        // Platforms — dynamic layout based on level
        const layouts = this.getPlatformLayout();
        layouts.forEach(p => {
            const plat = this.platforms.create(p.x, p.y, 'ground');
            plat.setScale(p.scale || 1, 0.5).refreshBody();
            plat.setTint(p.tint || 0x6b4fa0);
        });
    }

    getPlatformLayout() {
        const { width, height } = this.cameras.main;
        const baseLayouts = [
            // Layout 1
            [
                { x: width * 0.15, y: height * 0.70, scale: 0.5, tint: 0x7c3aed },
                { x: width * 0.5, y: height * 0.55, scale: 0.6, tint: 0x6d28d9 },
                { x: width * 0.85, y: height * 0.70, scale: 0.5, tint: 0x7c3aed },
                { x: width * 0.25, y: height * 0.40, scale: 0.4, tint: 0x8b5cf6 },
                { x: width * 0.75, y: height * 0.40, scale: 0.4, tint: 0x8b5cf6 },
                { x: width * 0.5, y: height * 0.28, scale: 0.35, tint: 0xa78bfa },
            ],
            // Layout 2
            [
                { x: width * 0.30, y: height * 0.75, scale: 0.4, tint: 0x0891b2 },
                { x: width * 0.70, y: height * 0.75, scale: 0.4, tint: 0x0891b2 },
                { x: width * 0.15, y: height * 0.55, scale: 0.5, tint: 0x06b6d4 },
                { x: width * 0.85, y: height * 0.55, scale: 0.5, tint: 0x06b6d4 },
                { x: width * 0.5, y: height * 0.42, scale: 0.55, tint: 0x22d3ee },
                { x: width * 0.3, y: height * 0.28, scale: 0.3, tint: 0x67e8f9 },
                { x: width * 0.7, y: height * 0.28, scale: 0.3, tint: 0x67e8f9 },
            ],
            // Layout 3
            [
                { x: width * 0.5, y: height * 0.78, scale: 0.5, tint: 0xdb2777 },
                { x: width * 0.18, y: height * 0.62, scale: 0.35, tint: 0xec4899 },
                { x: width * 0.82, y: height * 0.62, scale: 0.35, tint: 0xec4899 },
                { x: width * 0.4, y: height * 0.47, scale: 0.45, tint: 0xf472b6 },
                { x: width * 0.6, y: height * 0.47, scale: 0.45, tint: 0xf472b6 },
                { x: width * 0.5, y: height * 0.30, scale: 0.4, tint: 0xf9a8d4 },
                { x: width * 0.15, y: height * 0.35, scale: 0.25, tint: 0xfbb1cb },
                { x: width * 0.85, y: height * 0.35, scale: 0.25, tint: 0xfbb1cb },
            ]
        ];

        return baseLayouts[(this.level - 1) % baseLayouts.length];
    }

    spawnStars() {
        this.stars.clear(true, true);
        const { width } = this.cameras.main;
        const count = 10 + Math.min(this.level * 2, 10);
        this.totalStarsThisLevel = count;
        this.starsCollected = 0;

        for (let i = 0; i < count; i++) {
            const x = Phaser.Math.Between(40, width - 40);
            const y = Phaser.Math.Between(30, 200);
            const star = this.stars.create(x, y, 'star');
            star.setBounceY(Phaser.Math.FloatBetween(0.3, 0.6));
            star.setScale(0.6);
            star.setTint(Phaser.Math.RND.pick([0xffd700, 0xfbbf24, 0xf59e0b]));

            // Twinkle animation
            this.tweens.add({
                targets: star,
                scaleX: 0.7,
                scaleY: 0.7,
                alpha: 0.7,
                duration: Phaser.Math.Between(800, 1500),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
                delay: Phaser.Math.Between(0, 500)
            });
        }
    }

    spawnBombs() {
        const { width } = this.cameras.main;
        const bombCount = Math.min(this.level, 5);

        for (let i = 0; i < bombCount; i++) {
            const x = Phaser.Math.Between(50, width - 50);
            const bomb = this.bombs.create(x, 16, 'bomb');
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            const speed = 50 + this.level * 20;
            bomb.setVelocity(Phaser.Math.Between(-speed, speed), Phaser.Math.Between(50, 150));
            bomb.setScale(1.2);
            bomb.setTint(0xff4444);

            // Danger glow pulse
            this.tweens.add({
                targets: bomb,
                scaleX: 1.4,
                scaleY: 1.4,
                duration: 400,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    spawnPowerUp() {
        if (Phaser.Math.Between(1, 100) > 35) return; // 35% chance
        const { width } = this.cameras.main;
        const x = Phaser.Math.Between(50, width - 50);
        const pu = this.powerUps.create(x, 10, 'star');
        pu.setBounceY(0.4);
        pu.setScale(0.9);
        pu.setTint(0x06b6d4); // Cyan for shield power-up
        pu.powerType = 'shield';

        // Special glow
        this.tweens.add({
            targets: pu,
            scaleX: 1.1,
            scaleY: 1.1,
            alpha: 0.6,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    collectStar(player, star) {
        // Particle burst
        this.createStarBurst(star.x, star.y);

        star.disableBody(true, true);

        // Combo system
        this.combo++;
        if (this.comboTimer) this.comboTimer.remove();
        this.comboTimer = this.time.delayedCall(2000, () => { this.combo = 0; });

        const basePoints = 10;
        const comboMultiplier = Math.min(this.combo, 10);
        const points = basePoints * comboMultiplier;
        this.score += points;
        this.starsCollected++;

        // Floating score text
        this.showFloatingText(star.x, star.y - 20, `+${points}`, comboMultiplier > 1 ? '#06b6d4' : '#ffd700');
        if (comboMultiplier > 1) {
            this.showFloatingText(star.x, star.y - 45, `x${comboMultiplier} COMBO!`, '#ec4899', '14px');
        }

        this.updateUI();

        // Screen shake on high combo
        if (comboMultiplier >= 5) {
            this.cameras.main.shake(100, 0.003);
        }

        // All stars collected — next wave
        if (this.stars.countActive(true) === 0) {
            this.levelUp();
        }
    }

    levelUp() {
        this.level++;

        // Level up flash
        const { width, height } = this.cameras.main;
        const flash = this.add.graphics();
        flash.fillStyle(0xffd700, 0.3);
        flash.fillRect(0, 0, width, height);
        flash.setDepth(20);
        this.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 500,
            onComplete: () => flash.destroy()
        });

        // Show level text
        const lvlText = this.add.text(width / 2, height / 2, `LEVEL ${this.level}`, {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '48px',
            fontStyle: 'bold',
            color: '#ffd700',
            shadow: { offsetX: 0, offsetY: 0, color: '#ffd700', blur: 30, fill: true }
        }).setOrigin(0.5).setDepth(25);

        this.tweens.add({
            targets: lvlText,
            scaleX: 1.5,
            scaleY: 1.5,
            alpha: 0,
            duration: 1200,
            ease: 'Cubic.easeOut',
            onComplete: () => lvlText.destroy()
        });

        // Clear and recreate platforms for variety
        this.platforms.clear(true, true);
        this.createPlatforms();

        // Re-apply colliders
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.stars, this.platforms);
        this.physics.add.collider(this.bombs, this.platforms);
        this.physics.add.collider(this.powerUps, this.platforms);

        // Spawn new stars and bombs
        this.spawnStars();
        this.spawnBombs();
        this.spawnPowerUp();

        // Bonus life every 3 levels
        if (this.level % 3 === 0 && this.lives < 5) {
            this.lives++;
            this.showFloatingText(width / 2, height / 2 + 50, '+1 LIFE!', '#22c55e', '18px');
        }

        this.updateUI();
    }

    collectPowerUp(player, powerUp) {
        this.createStarBurst(powerUp.x, powerUp.y, 0x06b6d4);
        powerUp.disableBody(true, true);

        if (powerUp.powerType === 'shield') {
            this.activateShield();
        }
    }

    activateShield() {
        this.shieldActive = true;
        this.player.setTint(0x06b6d4);
        this.showFloatingText(this.player.x, this.player.y - 50, 'SHIELD!', '#06b6d4', '16px');

        // Shield duration
        this.time.delayedCall(5000, () => {
            this.shieldActive = false;
            this.player.clearTint();
        });
    }

    hitBomb(player, bomb) {
        if (this.isInvincible) return;

        if (this.shieldActive) {
            // Shield absorbs the hit
            this.shieldActive = false;
            this.player.clearTint();
            bomb.disableBody(true, true);
            this.createStarBurst(bomb.x, bomb.y, 0xff4444);
            this.showFloatingText(bomb.x, bomb.y - 20, 'BLOCKED!', '#06b6d4', '14px');
            this.cameras.main.shake(150, 0.005);
            return;
        }

        this.lives--;
        this.combo = 0;
        this.updateUI();

        // Hit effects
        this.cameras.main.shake(300, 0.01);
        this.cameras.main.flash(200, 255, 50, 50);

        if (this.lives <= 0) {
            this.gameOver();
        } else {
            // Invincibility frames
            this.isInvincible = true;
            this.player.setTint(0xff6666);

            // Blink effect
            this.tweens.add({
                targets: player,
                alpha: 0.3,
                duration: 150,
                yoyo: true,
                repeat: 8,
                onComplete: () => {
                    this.isInvincible = false;
                    player.setAlpha(1);
                    player.clearTint();
                }
            });

            // Destroy the bomb that hit
            bomb.disableBody(true, true);
            this.createStarBurst(bomb.x, bomb.y, 0xff4444);
        }
    }

    gameOver() {
        this.gameActive = false;
        this.physics.pause();
        this.player.setTint(0xff0000);
        this.player.anims.stop();

        // Save high score
        const hs = parseInt(localStorage.getItem('morningstar_highscore') || '0');
        if (this.score > hs) {
            localStorage.setItem('morningstar_highscore', this.score);
        }

        this.cameras.main.fade(1000, 0, 0, 0);
        this.time.delayedCall(1000, () => {
            this.scene.start('GameOverScene', {
                score: this.score,
                level: this.level,
                highScore: Math.max(this.score, hs)
            });
        });
    }

    createStarBurst(x, y, color) {
        const tint = color || 0xffd700;
        const count = 12;
        for (let i = 0; i < count; i++) {
            const p = this.add.image(x, y, 'particle_yellow');
            p.setScale(Phaser.Math.FloatBetween(0.15, 0.4));
            p.setTint(tint);
            p.setDepth(10);
            const angle = (i / count) * Math.PI * 2;
            const speed = Phaser.Math.Between(50, 150);
            this.tweens.add({
                targets: p,
                x: x + Math.cos(angle) * speed,
                y: y + Math.sin(angle) * speed,
                alpha: 0,
                scaleX: 0,
                scaleY: 0,
                duration: Phaser.Math.Between(300, 600),
                ease: 'Cubic.easeOut',
                onComplete: () => p.destroy()
            });
        }
    }

    showFloatingText(x, y, text, color, fontSize) {
        const t = this.add.text(x, y, text, {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: fontSize || '16px',
            fontStyle: 'bold',
            color: color || '#ffd700',
            shadow: { offsetX: 0, offsetY: 0, color: color || '#ffd700', blur: 8, fill: true }
        }).setOrigin(0.5).setDepth(15);

        this.tweens.add({
            targets: t,
            y: y - 40,
            alpha: 0,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 800,
            ease: 'Cubic.easeOut',
            onComplete: () => t.destroy()
        });
    }

    createUI() {
        const { width } = this.cameras.main;
        const uiDepth = 20;

        // Top bar background
        const topBar = this.add.graphics();
        topBar.fillStyle(0x0a0a1a, 0.7);
        topBar.fillRect(0, 0, width, 50);
        topBar.setDepth(uiDepth);

        // Score
        this.scoreText = this.add.text(16, 14, 'SCORE: 0', {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '15px',
            fontStyle: '600',
            color: '#ffd700',
            shadow: { offsetX: 0, offsetY: 0, color: '#ffd700', blur: 5, fill: true }
        }).setDepth(uiDepth + 1);

        // Level
        this.levelText = this.add.text(width / 2, 14, 'LEVEL 1', {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '15px',
            fontStyle: '600',
            color: '#a855f7',
            shadow: { offsetX: 0, offsetY: 0, color: '#a855f7', blur: 5, fill: true }
        }).setOrigin(0.5, 0).setDepth(uiDepth + 1);

        // Lives
        this.livesText = this.add.text(width - 16, 14, '♥♥♥', {
            fontFamily: 'sans-serif',
            fontSize: '18px',
            color: '#ef4444',
            shadow: { offsetX: 0, offsetY: 0, color: '#ef4444', blur: 5, fill: true }
        }).setOrigin(1, 0).setDepth(uiDepth + 1);

        // Stars progress
        this.progressText = this.add.text(width / 2, 34, '★ 0 / 0', {
            fontFamily: 'Inter, sans-serif',
            fontSize: '11px',
            color: '#9ca3af'
        }).setOrigin(0.5, 0).setDepth(uiDepth + 1);

        this.updateUI();
    }

    updateUI() {
        this.scoreText.setText(`SCORE: ${this.score}`);
        this.levelText.setText(`LEVEL ${this.level}`);
        this.livesText.setText('♥'.repeat(this.lives) + '♡'.repeat(Math.max(0, 3 - this.lives)));
        this.progressText.setText(`★ ${this.starsCollected} / ${this.totalStarsThisLevel}`);
    }

    createAmbientParticles() {
        const { width, height } = this.cameras.main;
        // Create drifting ambient particles
        for (let i = 0; i < 15; i++) {
            const p = this.add.image(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(0, height),
                'particle_white'
            );
            p.setScale(Phaser.Math.FloatBetween(0.05, 0.15));
            p.setAlpha(Phaser.Math.FloatBetween(0.1, 0.3));
            p.setTint(Phaser.Math.RND.pick([0xa855f7, 0x06b6d4, 0xffd700]));
            p.setDepth(1);

            this.tweens.add({
                targets: p,
                y: -20,
                x: p.x + Phaser.Math.Between(-100, 100),
                duration: Phaser.Math.Between(5000, 12000),
                repeat: -1,
                delay: Phaser.Math.Between(0, 3000),
                onRepeat: () => {
                    p.y = height + 20;
                    p.x = Phaser.Math.Between(0, width);
                }
            });
        }
    }

    update() {
        if (!this.gameActive) return;

        const speed = 220;
        const jumpSpeed = -420;

        // Horizontal movement
        if (this.cursors.left.isDown || this.wasd.left.isDown) {
            this.player.setVelocityX(-speed);
            this.player.anims.play('left', true);
        } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
            this.player.setVelocityX(speed);
            this.player.anims.play('right', true);
        } else {
            this.player.setVelocityX(0);
            this.player.anims.play('turn');
        }

        // Jump — allow both up arrow and space
        const jumpPressed = this.cursors.up.isDown || this.spaceKey.isDown || this.wasd.up.isDown;
        if (jumpPressed && this.player.body.touching.down) {
            this.player.setVelocityY(jumpSpeed);
            // Jump particle effect
            this.createJumpDust(this.player.x, this.player.y + 20);
        }

        // Player movement trail (when moving fast)
        if (Math.abs(this.player.body.velocity.x) > 100 || Math.abs(this.player.body.velocity.y) > 100) {
            if (Phaser.Math.Between(1, 3) === 1) {
                const trail = this.add.image(this.player.x, this.player.y, 'particle_white');
                trail.setScale(0.1);
                trail.setAlpha(0.4);
                trail.setTint(0xa855f7);
                trail.setDepth(4);
                this.tweens.add({
                    targets: trail,
                    alpha: 0,
                    scaleX: 0,
                    scaleY: 0,
                    duration: 300,
                    onComplete: () => trail.destroy()
                });
            }
        }
    }

    createJumpDust(x, y) {
        for (let i = 0; i < 6; i++) {
            const p = this.add.image(x, y, 'particle_white');
            p.setScale(Phaser.Math.FloatBetween(0.05, 0.12));
            p.setAlpha(0.5);
            p.setTint(0xd4d4d4);
            p.setDepth(3);
            this.tweens.add({
                targets: p,
                x: x + Phaser.Math.Between(-30, 30),
                y: y + Phaser.Math.Between(5, 15),
                alpha: 0,
                duration: 300,
                ease: 'Cubic.easeOut',
                onComplete: () => p.destroy()
            });
        }
    }
}

// ---------- GAME OVER SCENE ----------
class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.finalScore = data.score || 0;
        this.finalLevel = data.level || 1;
        this.highScore = data.highScore || 0;
        this.isNewHighScore = this.finalScore >= this.highScore && this.finalScore > 0;
    }

    create() {
        const { width, height } = this.cameras.main;

        // Background
        const sky = this.add.image(width / 2, height / 2, 'sky');
        sky.setDisplaySize(width, height);
        sky.setAlpha(0.4);

        // Dark overlay
        const overlay = this.add.graphics();
        overlay.fillStyle(0x0a0a1a, 0.7);
        overlay.fillRect(0, 0, width, height);

        // Game Over title
        const goTitle = this.add.text(width / 2, height * 0.18, 'GAME OVER', {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '44px',
            fontStyle: 'bold',
            color: '#ef4444',
            shadow: { offsetX: 0, offsetY: 0, color: '#ef4444', blur: 25, fill: true }
        }).setOrigin(0.5).setAlpha(0);

        // Stats card background
        const cardX = width / 2 - 140;
        const cardY = height * 0.30;
        const cardW = 280;
        const cardH = 180;
        const card = this.add.graphics();
        card.fillStyle(0x1a1a2e, 0.8);
        card.fillRoundedRect(cardX, cardY, cardW, cardH, 12);
        card.lineStyle(1, 0x3b3b5a, 0.5);
        card.strokeRoundedRect(cardX, cardY, cardW, cardH, 12);
        card.setAlpha(0);

        // Score display
        const scoreLabel = this.add.text(width / 2, cardY + 25, 'FINAL SCORE', {
            fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#9ca3af'
        }).setOrigin(0.5).setAlpha(0);

        const scoreValue = this.add.text(width / 2, cardY + 55, `${this.finalScore}`, {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '36px',
            fontStyle: 'bold',
            color: '#ffd700',
            shadow: { offsetX: 0, offsetY: 0, color: '#ffd700', blur: 15, fill: true }
        }).setOrigin(0.5).setAlpha(0);

        // Level reached
        const levelLabel = this.add.text(width / 2 - 60, cardY + 100, 'LEVEL', {
            fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#9ca3af'
        }).setOrigin(0.5).setAlpha(0);

        const levelValue = this.add.text(width / 2 - 60, cardY + 125, `${this.finalLevel}`, {
            fontFamily: 'Orbitron, sans-serif', fontSize: '24px', fontStyle: 'bold', color: '#a855f7',
            shadow: { offsetX: 0, offsetY: 0, color: '#a855f7', blur: 10, fill: true }
        }).setOrigin(0.5).setAlpha(0);

        // High score
        const hsLabel = this.add.text(width / 2 + 60, cardY + 100, 'BEST', {
            fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#9ca3af'
        }).setOrigin(0.5).setAlpha(0);

        const hsValue = this.add.text(width / 2 + 60, cardY + 125, `${this.highScore}`, {
            fontFamily: 'Orbitron, sans-serif', fontSize: '24px', fontStyle: 'bold', color: '#06b6d4',
            shadow: { offsetX: 0, offsetY: 0, color: '#06b6d4', blur: 10, fill: true }
        }).setOrigin(0.5).setAlpha(0);

        // New high score banner
        let newHsBanner = null;
        if (this.isNewHighScore) {
            newHsBanner = this.add.text(width / 2, cardY + 165, '★ NEW HIGH SCORE! ★', {
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '14px',
                fontStyle: 'bold',
                color: '#ffd700',
                shadow: { offsetX: 0, offsetY: 0, color: '#ffd700', blur: 15, fill: true }
            }).setOrigin(0.5).setAlpha(0);
        }

        // Retry button
        const retryY = height * 0.72;
        const retryBg = this.add.graphics();
        this.drawButton(retryBg, width / 2 - 100, retryY - 22, 200, 44, 0xa855f7, 0.9);
        retryBg.setAlpha(0);

        const retryBtn = this.add.text(width / 2, retryY, '↻  PLAY AGAIN', {
            fontFamily: 'Orbitron, sans-serif', fontSize: '15px', fontStyle: '600', color: '#ffffff'
        }).setOrigin(0.5).setAlpha(0);

        const retryZone = this.add.zone(width / 2, retryY, 200, 44).setInteractive({ useHandCursor: true });
        retryZone.on('pointerover', () => {
            this.drawButton(retryBg, width / 2 - 100, retryY - 22, 200, 44, 0xc084fc, 1);
            retryBtn.setScale(1.05);
        });
        retryZone.on('pointerout', () => {
            this.drawButton(retryBg, width / 2 - 100, retryY - 22, 200, 44, 0xa855f7, 0.9);
            retryBtn.setScale(1);
        });
        retryZone.on('pointerdown', () => {
            this.cameras.main.fade(500, 0, 0, 0);
            this.time.delayedCall(500, () => this.scene.start('GameScene'));
        });

        // Menu button
        const menuY = height * 0.82;
        const menuBtn = this.add.text(width / 2, menuY, 'MAIN MENU', {
            fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#9ca3af'
        }).setOrigin(0.5).setAlpha(0).setInteractive({ useHandCursor: true });
        menuBtn.on('pointerover', () => menuBtn.setColor('#ffffff'));
        menuBtn.on('pointerout', () => menuBtn.setColor('#9ca3af'));
        menuBtn.on('pointerdown', () => {
            this.cameras.main.fade(500, 0, 0, 0);
            this.time.delayedCall(500, () => this.scene.start('MenuScene'));
        });

        // Entrance animations
        this.cameras.main.fadeIn(500, 0, 0, 0);
        this.tweens.add({ targets: goTitle, alpha: 1, y: goTitle.y + 10, duration: 800, ease: 'Back.easeOut' });
        this.tweens.add({ targets: card, alpha: 1, duration: 600, delay: 400 });
        this.tweens.add({ targets: [scoreLabel, scoreValue], alpha: 1, duration: 500, delay: 600 });
        this.tweens.add({ targets: [levelLabel, levelValue, hsLabel, hsValue], alpha: 1, duration: 500, delay: 800 });
        if (newHsBanner) {
            this.tweens.add({
                targets: newHsBanner, alpha: 1, duration: 500, delay: 1000
            });
            this.tweens.add({
                targets: newHsBanner, scaleX: 1.1, scaleY: 1.1,
                duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: 1200
            });
        }
        this.tweens.add({ targets: [retryBg, retryBtn], alpha: 1, duration: 500, delay: 1200 });
        this.tweens.add({ targets: menuBtn, alpha: 0.7, duration: 500, delay: 1400 });

        // Floating particles
        for (let i = 0; i < 15; i++) {
            const p = this.add.image(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(0, height),
                'star'
            );
            p.setScale(Phaser.Math.FloatBetween(0.1, 0.25));
            p.setAlpha(Phaser.Math.FloatBetween(0.1, 0.3));
            p.setTint(Phaser.Math.RND.pick([0xffd700, 0xa855f7, 0x06b6d4]));
            this.tweens.add({
                targets: p,
                y: -30,
                x: p.x + Phaser.Math.Between(-80, 80),
                duration: Phaser.Math.Between(4000, 10000),
                repeat: -1,
                onRepeat: () => {
                    p.y = height + 30;
                    p.x = Phaser.Math.Between(0, width);
                }
            });
        }
    }

    drawButton(gfx, x, y, w, h, color, alpha) {
        gfx.clear();
        gfx.fillStyle(color, alpha * 0.3);
        gfx.fillRoundedRect(x, y, w, h, 10);
        gfx.lineStyle(2, color, alpha);
        gfx.strokeRoundedRect(x, y, w, h, 10);
    }
}

// ========================================
// PHASER GAME CONFIG
// ========================================
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 550,
    parent: 'game-container',
    backgroundColor: '#0a0a1a',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 450 },
            debug: false
        }
    },
    scene: [BootScene, MenuScene, GameScene, GameOverScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    render: {
        antialias: true,
        pixelArt: false,
        roundPixels: false
    }
};

const game = new Phaser.Game(config);
