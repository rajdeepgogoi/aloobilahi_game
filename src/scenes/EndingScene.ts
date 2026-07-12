import Phaser from 'phaser';
import AudioSynth from '../utils/AudioSynth.ts';
import { CONFIG } from '../config.ts';
import birthdayConfig from '../birthday_config.json';

export class EndingScene extends Phaser.Scene {
  private secretEnding = false;
  private currentSlideIndex = 0;
  private balloonTimer?: Phaser.Time.TimerEvent;

  // UI slide components
  private slideCard!: Phaser.GameObjects.Graphics;
  private slideTitle!: Phaser.GameObjects.Text;
  private slideText!: Phaser.GameObjects.Text;
  private slideArt!: Phaser.GameObjects.Graphics;
  private slideNavLeft!: Phaser.GameObjects.Text;
  private slideNavRight!: Phaser.GameObjects.Text;

  // Particle emitters
  private confettiGroup!: Phaser.GameObjects.Group;

  // Game objects to clean up on transition
  private cakeSprite!: Phaser.GameObjects.Sprite;
  private cakeSparkles!: any; // ParticleEmitter
  private alooSprite!: Phaser.GameObjects.Sprite;
  private bilahiSprite!: Phaser.GameObjects.Sprite;
  private congratsHeader!: Phaser.GameObjects.Text;
  private cardContainer!: Phaser.GameObjects.Container;
  private cardBgInside!: Phaser.GameObjects.Graphics;
  private cardText!: Phaser.GameObjects.Text;
  private closeHelper!: Phaser.GameObjects.Text;
  private coverContainer!: Phaser.GameObjects.Container;
  private isCardOpen = false;

  private specialEndingBtn?: Phaser.GameObjects.Text;
  private replayBtn?: Phaser.GameObjects.Text;
  private menuBtn?: Phaser.GameObjects.Text;

  constructor() {
    super('EndingScene');
  }

  create(data?: any) {
    const width = this.scale.width;
    const height = this.scale.height;

    // Check if player unlocked the secret ending (all 5 boxes found)
    const boxes = this.registry.get('secretBoxes') || [false, false, false, false, false];
    this.secretEnding = boxes.every((b: boolean) => b);

    // Stop normal loop, play victory music/notes
    AudioSynth.stopMusic();
    AudioSynth.playVictoryFanfare();

    // 1. Festive Background
    this.add.graphics()
      .fillGradientStyle(0x1d3557, 0x1d3557, 0x560bad, 0x560bad, 1)
      .fillRect(0, 0, width, height);

    // 2. Continuous Confetti Fall
    this.setupConfetti();

    // 3. Floating Balloons Timer (standard rate initially)
    this.setupBalloons(2000);

    // 4. Fireworks Spawning Loop
    this.setupFireworks();

    // 5. Congratulations Header at the top (above cake)
    this.congratsHeader = this.add.text(width / 2, 60, '🎉 CONGRATULATIONS! 🎉', {
      fontFamily: CONFIG.ui.fontFamily,
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#ffb703'
    }).setOrigin(0.5);

    // 6. Giant Birthday Cake in Center
    const cakeY = height / 2 - 80;
    this.cakeSprite = this.add.sprite(width / 2, cakeY, 'cake').setScale(2.5);
    this.tweens.add({
      targets: this.cakeSprite,
      y: cakeY - 10,
      scaleX: 2.7,
      scaleY: 2.7,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Sparkle particles around the cake
    this.cakeSparkles = this.add.particles(width / 2, cakeY + 40, 'particle', {
      speed: { min: 10, max: 40 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 800,
      frequency: 200,
      tint: 0xffb703
    });

    // 7. Spawn celebrating Aloo and Bilahi on either side of the cake (aligned on ground)
    this.alooSprite = this.add.sprite(width / 2 - 80, height / 2 - 40, 'aloo-idle').setScale(2.2);
    this.bilahiSprite = this.add.sprite(width / 2 + 80, height / 2 - 40, 'bilahi-idle').setScale(2.2);
    this.alooSprite.play('aloo-walk', true);
    this.bilahiSprite.play('bilahi-walk', true);
    this.alooSprite.setFlipX(true);
    this.bilahiSprite.setFlipX(true);

    this.tweens.add({
      targets: [this.alooSprite, this.bilahiSprite],
      y: '+=6',
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 8. Birthday Card Container
    const cardW = 380;
    const cardH = 360; // Expanded height to comfortably fit long message without clipping
    const messageY = height / 2 + 180; // Starts lower down at the bottom of the screen when closed
    const openY = height / 2 + 30; // Centered when open, hiding cake

    // Determine initial state from data (passed when coming back from Bouquet Page)
    const startOpen = data && data.startOpen;
    this.isCardOpen = !!startOpen;

    const initialY = this.isCardOpen ? openY : messageY;
    this.cardContainer = this.add.container(width / 2, initialY);

    // Card Inside Background (Cream colored inside)
    this.cardBgInside = this.add.graphics();
    this.cardBgInside.fillStyle(0xfdf0d5, 1);
    this.cardBgInside.lineStyle(2, 0xff7096, 1);
    this.cardBgInside.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 10);
    this.cardBgInside.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 10);
    this.cardBgInside.setVisible(this.isCardOpen).setAlpha(this.isCardOpen ? 1 : 0);
    this.cardContainer.add(this.cardBgInside);

    // Inner Card Text Message
    const bdayMessage = birthdayConfig.birthdayMessage;
    this.cardText = this.add.text(0, -10, bdayMessage, {
      fontFamily: CONFIG.ui.fontFamily,
      fontSize: '13px',
      color: '#1d3557', // High contrast dark text on cream white
      align: 'center',
      wordWrap: { width: 330 }, // Spacing margins to prevent border touch
      lineSpacing: 5
    }).setOrigin(0.5).setAlpha(this.isCardOpen ? 1 : 0).setVisible(this.isCardOpen);
    this.cardContainer.add(this.cardText);

    // Close helper text
    this.closeHelper = this.add.text(0, cardH / 2 - 20, "✖ Tap Card to Close", {
      fontFamily: CONFIG.ui.fontFamily,
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#e63946'
    }).setOrigin(0.5).setAlpha(this.isCardOpen ? 1 : 0).setVisible(this.isCardOpen);
    this.cardContainer.add(this.closeHelper);

    // Inside card interactive close trigger
    const closeZone = this.add.zone(0, 0, cardW, cardH).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.cardContainer.add(closeZone);
    closeZone.on('pointerdown', () => {
      if (this.isCardOpen) {
        this.toggleCard(false);
      }
    });

    // 9. Secret ending button PLACED BELOW the card when opened (Y coordinate gap increased)
    const buttonY = openY + cardH / 2 + 45; // Spaced 45px below the card's bottom
    if (this.secretEnding) {
      this.specialEndingBtn = this.add.text(width / 2, buttonY, "Click here for the special (5/5 gifts)", {
        fontFamily: CONFIG.ui.fontFamily,
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#ffb703',
        backgroundColor: 'rgba(255,255,255,0.08)',
        padding: { x: 16, y: 10 }
      }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setAlpha(this.isCardOpen ? 1 : 0).setVisible(this.isCardOpen);

      this.specialEndingBtn.on('pointerdown', () => {
        AudioSynth.playCoin();
        this.transitionToBouquetPage();
      });

      this.specialEndingBtn.on('pointerover', () => {
        this.specialEndingBtn?.setColor('#ffffff');
        this.specialEndingBtn?.setBackgroundColor('rgba(255,255,255,0.15)');
      });
      this.specialEndingBtn.on('pointerout', () => {
        this.specialEndingBtn?.setColor('#ffb703');
        this.specialEndingBtn?.setBackgroundColor('rgba(255,255,255,0.08)');
      });
    }

    // Card Cover Container
    const coverH = 100; // Visual height of closed envelope
    this.coverContainer = this.add.container(0, 0);
    this.coverContainer.setVisible(!this.isCardOpen);
    if (this.isCardOpen) {
      this.coverContainer.setScale(1, 0);
      this.coverContainer.y = -cardH / 2;
    }

    const coverBg = this.add.graphics();
    coverBg.fillStyle(0xe63946, 1);
    coverBg.lineStyle(3, 0xffb703, 1);
    coverBg.fillRoundedRect(-cardW / 2, -coverH / 2, cardW, coverH, 10);
    coverBg.strokeRoundedRect(-cardW / 2, -coverH / 2, cardW, coverH, 10);
    this.coverContainer.add(coverBg);

    const coverText = this.add.text(0, 0, "✉️ A Special Message for You 💖\n(Tap to Open Card)", {
      fontFamily: CONFIG.ui.fontFamily,
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#ffffff',
      align: 'center',
      lineSpacing: 8
    }).setOrigin(0.5);
    this.coverContainer.add(coverText);

    this.cardContainer.add(this.coverContainer);

    // Interactive cover trigger zone
    const coverZone = this.add.zone(0, 0, cardW, coverH).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.coverContainer.add(coverZone);

    coverZone.on('pointerdown', () => {
      if (!this.isCardOpen) {
        this.toggleCard(true);
      }
    });

    // Exit buttons (for normal ending) below card
    this.setupExitButtons(height - 40);
    this.replayBtn?.setAlpha(this.isCardOpen && !this.secretEnding ? 1 : 0).setVisible(this.isCardOpen && !this.secretEnding);
    this.menuBtn?.setAlpha(this.isCardOpen && !this.secretEnding ? 1 : 0).setVisible(this.isCardOpen && !this.secretEnding);

    // If starting in open state, hide cake/characters immediately
    if (this.isCardOpen) {
      this.cakeSprite.setAlpha(0);
      this.alooSprite.setAlpha(0);
      this.bilahiSprite.setAlpha(0);
      if (this.cakeSparkles) this.cakeSparkles.setAlpha(0);
    }
  }

  private toggleCard(open: boolean) {
    const height = this.scale.height;
    const cardH = 360;
    const messageY = height / 2 + 180;
    const openY = height / 2 + 30;

    if (open) {
      this.isCardOpen = true;
      AudioSynth.playVictoryFanfare();

      // 1. Smoothly fade out cake scene elements
      this.tweens.add({
        targets: [this.cakeSprite, this.alooSprite, this.bilahiSprite],
        alpha: 0,
        duration: 500
      });
      if (this.cakeSparkles) {
        this.tweens.add({
          targets: this.cakeSparkles,
          alpha: 0,
          duration: 500
        });
      }

      // 2. Tween card container position
      this.tweens.add({
        targets: this.cardContainer,
        y: openY,
        duration: 600,
        ease: 'Cubic.easeOut'
      });

      // 3. Fold open cover
      this.tweens.add({
        targets: this.coverContainer,
        scaleY: 0,
        y: -cardH / 2,
        duration: 600,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          this.coverContainer.setVisible(false);
          this.cardBgInside.setVisible(true);
          this.cardText.setVisible(true);
          this.closeHelper.setVisible(true);

          this.tweens.add({
            targets: [this.cardBgInside, this.cardText, this.closeHelper],
            alpha: 1,
            duration: 300
          });

          // Show buttons
          if (this.specialEndingBtn) {
            this.specialEndingBtn.setVisible(true);
            this.tweens.add({
              targets: this.specialEndingBtn,
              alpha: 1,
              duration: 300
            });
          }
          if (this.replayBtn && this.menuBtn && !this.secretEnding) {
            this.replayBtn.setVisible(true);
            this.menuBtn.setVisible(true);
            this.tweens.add({
              targets: [this.replayBtn, this.menuBtn],
              alpha: 1,
              duration: 300
            });
          }
        }
      });

    } else {
      this.isCardOpen = false;
      AudioSynth.playSwitch();

      // Fade out buttons
      if (this.specialEndingBtn) {
        this.tweens.add({
          targets: this.specialEndingBtn,
          alpha: 0,
          duration: 300,
          onComplete: () => this.specialEndingBtn?.setVisible(false)
        });
      }
      if (this.replayBtn && this.menuBtn) {
        this.tweens.add({
          targets: [this.replayBtn, this.menuBtn],
          alpha: 0,
          duration: 300,
          onComplete: () => {
            this.replayBtn?.setVisible(false);
            this.menuBtn?.setVisible(false);
          }
        });
      }

      // Fade out inside card contents
      this.tweens.add({
        targets: [this.cardBgInside, this.cardText, this.closeHelper],
        alpha: 0,
        duration: 300,
        onComplete: () => {
          this.cardBgInside.setVisible(false);
          this.cardText.setVisible(false);
          this.closeHelper.setVisible(false);
          
          this.coverContainer.setVisible(true);
          // Fold cover back down
          this.tweens.add({
            targets: this.coverContainer,
            scaleY: 1,
            y: 0,
            duration: 600,
            ease: 'Cubic.easeOut'
          });
        }
      });

      // Tween card container back down
      this.tweens.add({
        targets: this.cardContainer,
        y: messageY,
        duration: 600,
        ease: 'Cubic.easeOut'
      });

      // Fade in cake scene elements
      this.tweens.add({
        targets: [this.cakeSprite, this.alooSprite, this.bilahiSprite],
        alpha: 1,
        duration: 500
      });
      if (this.cakeSparkles) {
        this.tweens.add({
          targets: this.cakeSparkles,
          alpha: 1,
          duration: 500
        });
      }
    }
  }

  private setupExitButtons(y: number) {
    const width = this.scale.width;
    
    this.replayBtn = this.add.text(width / 2 - 120, y, 'Replay Game', {
      fontFamily: CONFIG.ui.fontFamily,
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#ffffff',
      backgroundColor: 'rgba(255,255,255,0.08)',
      padding: { x: 14, y: 6 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.replayBtn.on('pointerdown', () => {
      AudioSynth.playCoin();
      this.resetRegistry();
      this.scene.start('GameScene');
    });

    this.menuBtn = this.add.text(width / 2 + 120, y, 'Character Select', {
      fontFamily: CONFIG.ui.fontFamily,
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#ffffff',
      backgroundColor: 'rgba(255,255,255,0.08)',
      padding: { x: 14, y: 6 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.menuBtn.on('pointerdown', () => {
      AudioSynth.playCoin();
      this.resetRegistry();
      this.scene.start('TitleScene');
    });

    [this.replayBtn, this.menuBtn].forEach(btn => {
      btn.on('pointerover', () => {
        btn.setColor('#ffb703');
        btn.setBackgroundColor('rgba(255,255,255,0.15)');
      });
      btn.on('pointerout', () => {
        btn.setColor('#ffffff');
        btn.setBackgroundColor('rgba(255,255,255,0.08)');
      });
    });
  }

  private transitionToBouquetPage() {
    const width = this.scale.width;
    const height = this.scale.height;

    // Camera flash and play chime
    this.cameras.main.flash(600, 255, 255, 255);
    AudioSynth.playVictoryFanfare();

    // Destroy cake scene components
    this.cakeSprite.destroy();
    if (this.cakeSparkles) this.cakeSparkles.destroy();
    this.alooSprite.destroy();
    this.bilahiSprite.destroy();
    this.congratsHeader.destroy();
    this.cardContainer.destroy();
    if (this.specialEndingBtn) this.specialEndingBtn.destroy();
    if (this.replayBtn) this.replayBtn.destroy();
    if (this.menuBtn) this.menuBtn.destroy();

    // 1. Title Header at the top
    this.congratsHeader = this.add.text(width / 2, 60, '🌟 SECRET BOUQUET UNLOCKED! 🌟', {
      fontFamily: CONFIG.ui.fontFamily,
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#ffb703'
    }).setOrigin(0.5);

    // 2. Spawn giant bouquet in center (increased size for main visual focus)
    const bouquetY = height / 2 - 120;
    const bouquetSprite = this.add.sprite(width / 2, bouquetY, 'bouquet').setScale(3.5);
    this.tweens.add({
      targets: bouquetSprite,
      y: bouquetY - 12,
      scaleX: 3.8,
      scaleY: 3.8,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Sparkles around the bouquet
    this.add.particles(width / 2, bouquetY + 50, 'particle', {
      speed: { min: 20, max: 70 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.5, end: 0 },
      alpha: { start: 0.9, end: 0 },
      lifespan: 1000,
      frequency: 120,
      tint: [0xff7096, 0xffb703, 0x4ade80, 0xffffff]
    });

    // Screen-wide sparkles in background
    this.add.particles(width / 2, height / 2, 'particle', {
      x: { min: 0, max: width },
      y: { min: 0, max: height },
      speed: { min: 5, max: 25 },
      scale: { start: 1.0, end: 0 },
      alpha: { start: 0.4, end: 0 },
      lifespan: 2000,
      frequency: 100,
      tint: [0xffb703, 0xff7096, 0xffffff, 0xcaffbf]
    });

    // 3. Accelerate balloon spawn rate
    this.setupBalloons(500);

    // 4. Spawn celebrating characters beside the bouquet
    this.alooSprite = this.add.sprite(width / 2 - 130, height / 2 - 40, 'aloo-idle').setScale(2.2);
    this.bilahiSprite = this.add.sprite(width / 2 + 130, height / 2 - 40, 'bilahi-idle').setScale(2.2);
    this.alooSprite.play('aloo-walk', true);
    this.bilahiSprite.play('bilahi-walk', true);
    this.alooSprite.setFlipX(true);
    this.bilahiSprite.setFlipX(true);

    this.tweens.add({
      targets: [this.alooSprite, this.bilahiSprite],
      y: '+=6',
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 5. Card with secret text PLACED BELOW the bouquet
    const textCardW = 380;
    const textCardH = 100;
    const textCardY = height / 2 + 95;

    const textCardContainer = this.add.container(width / 2, textCardY);

    const textCardBg = this.add.graphics();
    textCardBg.fillStyle(0x1d3557, 0.95);
    textCardBg.lineStyle(2, 0xffb703, 1);
    textCardBg.fillRoundedRect(-textCardW / 2, -textCardH / 2, textCardW, textCardH, 10);
    textCardBg.strokeRoundedRect(-textCardW / 2, -textCardH / 2, textCardW, textCardH, 10);
    textCardContainer.add(textCardBg);

    const secretText = this.add.text(0, 0, "Yayyyy pookie, I knew you would collect all the 5 secret gifts to have this secret ending. Here's a lil bouquet for you! 💖", {
      fontFamily: CONFIG.ui.fontFamily,
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 340 },
      lineSpacing: 6
    }).setOrigin(0.5);
    textCardContainer.add(secretText);

    // 6. Setup Interactive Memory Slideshow
    this.setupSlideshow(width / 2, height - 160);

    // 7. Spawn Exit/Return buttons at the bottom
    const backBtn = this.add.text(width / 2 - 135, height - 40, '◀ Back to Card', {
      fontFamily: CONFIG.ui.fontFamily,
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#ffffff',
      backgroundColor: 'rgba(255,255,255,0.08)',
      padding: { x: 10, y: 6 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    backBtn.on('pointerdown', () => {
      AudioSynth.playCoin();
      this.scene.start('EndingScene', { startOpen: true });
    });

    this.replayBtn = this.add.text(width / 2, height - 40, 'Replay Game', {
      fontFamily: CONFIG.ui.fontFamily,
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#ffffff',
      backgroundColor: 'rgba(255,255,255,0.08)',
      padding: { x: 10, y: 6 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.replayBtn.on('pointerdown', () => {
      AudioSynth.playCoin();
      this.resetRegistry();
      this.scene.start('GameScene');
    });

    this.menuBtn = this.add.text(width / 2 + 135, height - 40, 'Character Select', {
      fontFamily: CONFIG.ui.fontFamily,
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#ffffff',
      backgroundColor: 'rgba(255,255,255,0.08)',
      padding: { x: 10, y: 6 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.menuBtn.on('pointerdown', () => {
      AudioSynth.playCoin();
      this.resetRegistry();
      this.scene.start('TitleScene');
    });

    [backBtn, this.replayBtn, this.menuBtn].forEach(btn => {
      btn.on('pointerover', () => {
        btn.setColor('#ffb703');
        btn.setBackgroundColor('rgba(255,255,255,0.15)');
      });
      btn.on('pointerout', () => {
        btn.setColor('#ffffff');
        btn.setBackgroundColor('rgba(255,255,255,0.08)');
      });
    });
  }

  update() {
    // Spin / drift confetti down
    this.confettiGroup.getChildren().forEach((p: any) => {
      p.y += p.getData('speedY');
      p.x += Math.sin(this.time.now / 200 + p.getData('wobble')) * 0.4;
      p.angle += p.getData('spin');
      
      // Wrap confetti
      if (p.y > this.scale.height + 10) {
        p.y = -10;
        p.x = Phaser.Math.Between(0, this.scale.width);
      }
    });
  }

  private resetRegistry() {
    this.registry.set('score', 0);
    this.registry.set('health', 3);
    this.registry.set('secretsFound', 0);
    this.registry.set('secretBoxes', [false, false, false, false, false]);
    this.registry.set('activeCheckpoint', null);
    this.registry.set('doubleJumpUnlocked', true);
  }

  // --- Confetti Generation ---
  private setupConfetti() {
    const width = this.scale.width;
    const density = this.secretEnding ? 100 : 50;
    this.confettiGroup = this.add.group();

    const colors = [0xffadad, 0xffd6a5, 0xfdffb6, 0xcaffbf, 0x9bf6ff, 0xa0c4ff, 0xbdb2ff, 0xffc6ff];

    for (let i = 0; i < density; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(-this.scale.height, 0); // disperse vertically
      const size = Phaser.Math.Between(4, 8);
      
      // Draw rectangular confetti block
      const graphic = this.add.graphics();
      graphic.fillStyle(Phaser.Utils.Array.GetRandom(colors), 1.0);
      graphic.fillRect(-size / 2, -size / 2, size, size);
      
      const c = this.add.container(x, y, [graphic]);
      
      // Set physical parameters
      c.setData('speedY', Phaser.Math.FloatBetween(1.2, 3.0));
      c.setData('wobble', Phaser.Math.FloatBetween(0, Math.PI));
      c.setData('spin', Phaser.Math.FloatBetween(-3, 3));
      
      this.confettiGroup.add(c);
    }
  }

  // --- Floating Balloons ---
  private setupBalloons(delay = 2000) {
    if (this.balloonTimer) {
      this.balloonTimer.destroy();
    }
    const width = this.scale.width;
    const height = this.scale.height;
    const colors = ['#ff4d4d', '#ffb703', '#2a9d8f', '#ff7096', '#9d4edd'];

    this.balloonTimer = this.time.addEvent({
      delay: delay,
      loop: true,
      callback: () => {
        const x = Phaser.Math.Between(40, width - 40);
        const radius = Phaser.Math.Between(12, 18);
        const colStr = Phaser.Utils.Array.GetRandom(colors);
        const colHex = Phaser.Display.Color.HexStringToColor(colStr).color;

        // Draw balloon
        const balloon = this.add.graphics();
        balloon.fillStyle(colHex, 0.85);
        balloon.lineStyle(1, 0xffffff, 0.4);
        balloon.fillCircle(0, 0, radius);
        balloon.strokeCircle(0, 0, radius);
        
        // Draw string
        balloon.lineStyle(1, 0xffffff, 0.6);
        balloon.moveTo(0, radius);
        balloon.lineTo(0, radius + 25);
        balloon.strokePath();

        const container = this.add.container(x, height + 40, [balloon]);

        this.tweens.add({
          targets: container,
          y: -50,
          x: x + Phaser.Math.Between(-60, 60),
          duration: Phaser.Math.Between(6000, 10000),
          onComplete: () => container.destroy()
        });
      }
    });
  }

  // --- Sky Fireworks ---
  private setupFireworks() {
    const width = this.scale.width;
    const colors = [0xff0054, 0x9e0059, 0xff5400, 0xffbd00, 0x390099, 0x06d6a0, 0x277da1];

    this.time.addEvent({
      delay: this.secretEnding ? 1200 : 2200,
      loop: true,
      callback: () => {
        const fireX = Phaser.Math.Between(100, width - 100);
        const fireY = Phaser.Math.Between(50, 200);
        const col = Phaser.Utils.Array.GetRandom(colors);

        // Flash burst particle emitter
        const emitter = this.add.particles(fireX, fireY, 'particle', {
          speed: { min: 40, max: 120 },
          angle: { min: 0, max: 360 },
          scale: { start: 1.5, end: 0 },
          alpha: { start: 1.0, end: 0 },
          lifespan: 700,
          maxParticles: this.secretEnding ? 24 : 12,
          tint: col
        });

        // Small pop sound
        AudioSynth.playCoin();

        this.time.delayedCall(750, () => emitter.destroy());
      }
    });
  }

  // --- Interactive Slideshow Gallery ---
  private setupSlideshow(x: number, y: number) {
    const cardW = 340;
    const cardH = 95;
    const cardX = x - cardW / 2;

    // Card background
    this.slideCard = this.add.graphics();
    this.slideCard.fillStyle(0x1d3557, 0.95);
    this.slideCard.lineStyle(2, 0xff7096, 1);
    this.slideCard.fillRoundedRect(cardX, y, cardW, cardH, 10);
    this.slideCard.strokeRoundedRect(cardX, y, cardW, cardH, 10);

    // Interactive Photo Art drawing block
    this.slideArt = this.add.graphics();
    this.add.existing(this.slideArt);

    // Text slides
    this.slideTitle = this.add.text(cardX + 90, y + 10, '', {
      fontFamily: CONFIG.ui.fontFamily,
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ffb703'
    });

    this.slideText = this.add.text(cardX + 90, y + 32, '', {
      fontFamily: CONFIG.ui.fontFamily,
      fontSize: '12px',
      color: '#ffffff',
      wordWrap: { width: cardW - 110 }
    });

    // Left Navigation Arrow
    this.slideNavLeft = this.add.text(cardX - 25, y + cardH / 2 - 12, '◀', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.slideNavLeft.on('pointerdown', () => this.changeSlide(-1));

    // Right Navigation Arrow
    this.slideNavRight = this.add.text(cardX + cardW + 25, y + cardH / 2 - 12, '▶', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.slideNavRight.on('pointerdown', () => this.changeSlide(1));

    // Glow highlights for arrows
    [this.slideNavLeft, this.slideNavRight].forEach(nav => {
      nav.on('pointerover', () => nav.setColor('#ffb703'));
      nav.on('pointerout', () => nav.setColor('#ffffff'));
    });

    // Render initial slide
    this.renderSlide();
  }

  private changeSlide(direction: number) {
    AudioSynth.playSwitch();
    const slides = birthdayConfig.slideshow;
    this.currentSlideIndex = (this.currentSlideIndex + direction + slides.length) % slides.length;
    this.renderSlide();
  }

  private renderSlide() {
    const slides = birthdayConfig.slideshow;
    const current = slides[this.currentSlideIndex];
    
    this.slideTitle.setText(current.title);
    this.slideText.setText(current.text);

    // Redraw memory thumbnail inside the gallery box
    const drawX = this.scale.width / 2 - 170 + 45;
    const drawY = this.scale.height - 160 + 45;

    this.slideArt.clear();
    this.slideArt.lineStyle(1.5, 0xffffff, 0.8);

    // Draw customized mini vector shapes based on the current slide index
    if (this.currentSlideIndex === 0) {
      // Draw potato + tomato holding hands
      this.slideArt.fillStyle(0xc8963e, 1);
      this.slideArt.fillCircle(drawX - 10, drawY, 8);
      this.slideArt.fillStyle(0xe63946, 1);
      this.slideArt.fillCircle(drawX + 10, drawY, 8);
      
      // Joining hand line
      this.slideArt.lineStyle(2, 0xffffff, 1);
      this.slideArt.moveTo(drawX - 5, drawY);
      this.slideArt.lineTo(drawX + 5, drawY);
      this.slideArt.strokePath();
    } else if (this.currentSlideIndex === 1) {
      // Draw a Christmas/Birthday tree
      this.slideArt.fillStyle(0x38b000, 1);
      this.slideArt.beginPath();
      this.slideArt.moveTo(drawX, drawY - 18);
      this.slideArt.lineTo(drawX - 14, drawY + 12);
      this.slideArt.lineTo(drawX + 14, drawY + 12);
      this.slideArt.closePath();
      this.slideArt.fill();

      // Trunk
      this.slideArt.fillStyle(0xa16207, 1);
      this.slideArt.fillRect(drawX - 4, drawY + 12, 8, 8);
    } else if (this.currentSlideIndex === 2) {
      // Draw a castle shield/crest
      this.slideArt.fillStyle(0x94a3b8, 1);
      this.slideArt.fillRect(drawX - 10, drawY - 12, 20, 16);
      this.slideArt.beginPath();
      this.slideArt.moveTo(drawX - 10, drawY + 4);
      this.slideArt.lineTo(drawX, drawY + 16);
      this.slideArt.lineTo(drawX + 10, drawY + 4);
      this.slideArt.closePath();
      this.slideArt.fill();

      // Yellow star crest
      this.slideArt.fillStyle(0xffb703, 1);
      this.slideArt.fillCircle(drawX, drawY - 2, 4);
    } else {
      // Draw a big pink heart
      this.slideArt.fillStyle(0xff7096, 1);
      this.slideArt.fillCircle(drawX - 7, drawY - 5, 8);
      this.slideArt.fillCircle(drawX + 7, drawY - 5, 8);
      this.slideArt.beginPath();
      this.slideArt.moveTo(drawX - 14, drawY - 2);
      this.slideArt.lineTo(drawX, drawY + 14);
      this.slideArt.lineTo(drawX + 14, drawY - 2);
      this.slideArt.closePath();
      this.slideArt.fill();
    }
  }
}
export default EndingScene;
