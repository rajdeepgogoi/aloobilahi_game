import Phaser from 'phaser';
import AudioSynth from '../utils/AudioSynth.ts';
import { CONFIG } from '../config.ts';

export class TitleScene extends Phaser.Scene {
  private selectedHero: 'aloo' | 'bilahi' = 'aloo';
  
  // UI Objects
  private cardAloo!: Phaser.GameObjects.Graphics;
  private cardBilahi!: Phaser.GameObjects.Graphics;
  private spriteAloo!: Phaser.GameObjects.Sprite;
  private spriteBilahi!: Phaser.GameObjects.Sprite;
  private descText!: Phaser.GameObjects.Text;
  private volumeButton!: Phaser.GameObjects.Text;
  
  constructor() {
    super('TitleScene');
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Start background music loop on first interaction
    this.input.once('pointerdown', () => {
      AudioSynth.startMusic();
    });
    this.input.keyboard?.once('keydown', () => {
      AudioSynth.startMusic();
    });

    // 1. Sky Background
    this.add.graphics()
      .fillGradientStyle(0x457b9d, 0x457b9d, 0x1d3557, 0x1d3557, 1)
      .fillRect(0, 0, width, height);

    // Parallax background items
    const clouds = this.add.group();
    for (let i = 0; i < 4; i++) {
      const c = this.add.image(
        Phaser.Math.Between(50, width - 50),
        Phaser.Math.Between(40, 150),
        'cloud'
      );
      c.setScale(Phaser.Math.FloatBetween(1.0, 1.8));
      c.setAlpha(Phaser.Math.FloatBetween(0.3, 0.6));
      clouds.add(c);
    }

    // Add mountains at the bottom
    const m1 = this.add.image(200, height - 100, 'mountain').setScale(2.5).setAlpha(0.2);
    const m2 = this.add.image(600, height - 80, 'mountain').setScale(2.0).setAlpha(0.2);

    // Rotate/move clouds slowly
    this.time.addEvent({
      delay: 50,
      loop: true,
      callback: () => {
        clouds.getChildren().forEach((c: any) => {
          c.x += 0.2;
          if (c.x > width + 100) {
            c.x = -100;
            c.y = Phaser.Math.Between(40, 150);
          }
        });
        m1.x -= 0.05;
        m2.x -= 0.03;
        if (m1.x < -200) m1.x = width + 200;
        if (m2.x < -200) m2.x = width + 200;
      }
    });

    // 2. Title Text
    this.add.text(width / 2, 50, 'ALOO & BILAHI', {
      fontFamily: CONFIG.ui.fontFamily,
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#ffb703'
    }).setOrigin(0.5);

    const titleSub = this.add.text(width / 2, 85, 'THE GREAT VEGGIE RESCUE', {
      fontFamily: CONFIG.ui.fontFamily,
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#e63946'
    }).setOrigin(0.5);

    // Apply retro glow to titles
    this.tweens.add({
      targets: titleSub,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 3. Selection Box Title
    this.add.text(width / 2, 140, 'SELECT YOUR HERO', {
      fontFamily: CONFIG.ui.fontFamily,
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#f1faee'
    }).setOrigin(0.5);

    // 4. Character Cards Layout
    const cardW = 160;
    const cardH = 200;
    const cardY = 320;
    const cardAlooX = width / 2 - 100;
    const cardBilahiX = width / 2 + 100;

    // Graphics cards placeholders (we'll redraw them dynamically)
    this.cardAloo = this.add.graphics();
    this.cardBilahi = this.add.graphics();

    // Make cards interactive
    const hitAloo = this.add.zone(cardAlooX, cardY, cardW, cardH).setInteractive({ useHandCursor: true });
    const hitBilahi = this.add.zone(cardBilahiX, cardY, cardW, cardH).setInteractive({ useHandCursor: true });

    hitAloo.on('pointerdown', () => this.selectHero('aloo'));
    hitBilahi.on('pointerdown', () => this.selectHero('bilahi'));

    // Animated Hero Sprites inside the cards
    this.spriteAloo = this.add.sprite(cardAlooX, cardY - 20, 'aloo-idle').setScale(3);
    this.spriteBilahi = this.add.sprite(cardBilahiX, cardY - 20, 'bilahi-idle').setScale(3);

    // Hero Names
    this.add.text(cardAlooX, cardY + 30, 'ALOO', {
      fontFamily: CONFIG.ui.fontFamily,
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(cardBilahiX, cardY + 30, 'BILAHI', {
      fontFamily: CONFIG.ui.fontFamily,
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 5. Description Text
    this.descText = this.add.text(width / 2, 480, '', {
      fontFamily: CONFIG.ui.fontFamily,
      fontSize: '15px',
      color: '#ffb703',
      align: 'center',
      wordWrap: { width: 400 }
    }).setOrigin(0.5);

    // 6. Action Button / Start instructions
    const startBtn = this.add.graphics();
    startBtn.fillStyle(0xe63946, 1);
    startBtn.fillRoundedRect(width / 2 - 120, 550, 240, 45, 10);
    startBtn.lineStyle(2, 0xffffffff, 1);
    startBtn.strokeRoundedRect(width / 2 - 120, 550, 240, 45, 10);

    const startText = this.add.text(width / 2, 572, 'START ADVENTURE', {
      fontFamily: CONFIG.ui.fontFamily,
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    startText.on('pointerdown', () => this.confirmSelection());
    
    // Animate button scale on hover
    startText.on('pointerover', () => {
      this.tweens.add({ targets: startText, scaleX: 1.1, scaleY: 1.1, duration: 150 });
    });
    startText.on('pointerout', () => {
      this.tweens.add({ targets: startText, scaleX: 1.0, scaleY: 1.0, duration: 150 });
    });

    // 7. Sound Toggle (Top-right)
    this.volumeButton = this.add.text(width - 50, 30, AudioSynth.getMuted() ? '🔇' : '🔊', {
      fontSize: '24px'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.volumeButton.on('pointerdown', () => {
      const isMuted = AudioSynth.toggleMute();
      this.volumeButton.setText(isMuted ? '🔇' : '🔊');
    });

    // 8. Keyboard navigation
    this.input.keyboard?.on('keydown-LEFT', () => this.selectHero('aloo'));
    this.input.keyboard?.on('keydown-A', () => this.selectHero('aloo'));
    this.input.keyboard?.on('keydown-RIGHT', () => this.selectHero('bilahi'));
    this.input.keyboard?.on('keydown-D', () => this.selectHero('bilahi'));
    this.input.keyboard?.on('keydown-SPACE', () => this.confirmSelection());
    this.input.keyboard?.on('keydown-ENTER', () => this.confirmSelection());

    // Init Selection
    this.selectHero('aloo');
  }

  private selectHero(hero: 'aloo' | 'bilahi') {
    if (this.selectedHero !== hero) {
      AudioSynth.playJump();
    }
    this.selectedHero = hero;

    const width = this.cameras.main.width;
    const cardW = 160;
    const cardH = 200;
    const cardY = 320;
    const cardAlooX = width / 2 - 100;
    const cardBilahiX = width / 2 + 100;

    // Draw Aloo Card
    this.cardAloo.clear();
    if (hero === 'aloo') {
      this.cardAloo.fillStyle(0x1d3557, 0.9);
      this.cardAloo.lineStyle(4, 0xffb703, 1);
      this.spriteAloo.play('aloo-walk', true);
      this.spriteBilahi.play('bilahi-idle', true);
      
      // Card bounce tween
      this.tweens.add({
        targets: this.spriteAloo,
        y: cardY - 25,
        duration: 150,
        yoyo: true
      });
    } else {
      this.cardAloo.fillStyle(0x1d3557, 0.4);
      this.cardAloo.lineStyle(2, 0xffffff, 0.5);
    }
    this.cardAloo.fillRoundedRect(cardAlooX - cardW / 2, cardY - cardH / 2, cardW, cardH, 15);
    this.cardAloo.strokeRoundedRect(cardAlooX - cardW / 2, cardY - cardH / 2, cardW, cardH, 15);

    // Draw Bilahi Card
    this.cardBilahi.clear();
    if (hero === 'bilahi') {
      this.cardBilahi.fillStyle(0x1d3557, 0.9);
      this.cardBilahi.lineStyle(4, 0xffb703, 1);
      this.spriteBilahi.play('bilahi-walk', true);
      this.spriteAloo.play('aloo-idle', true);

      // Card bounce tween
      this.tweens.add({
        targets: this.spriteBilahi,
        y: cardY - 25,
        duration: 150,
        yoyo: true
      });
    } else {
      this.cardBilahi.fillStyle(0x1d3557, 0.4);
      this.cardBilahi.lineStyle(2, 0xffffff, 0.5);
    }
    this.cardBilahi.fillRoundedRect(cardBilahiX - cardW / 2, cardY - cardH / 2, cardW, cardH, 15);
    this.cardBilahi.strokeRoundedRect(cardBilahiX - cardW / 2, cardY - cardH / 2, cardW, cardH, 15);

    // Update description text
    const info = CONFIG.characters[hero];
    this.descText.setText(`${info.displayName}\n"${info.desc}"`);
  }

  private confirmSelection() {
    AudioSynth.playCoin();
    AudioSynth.startMusic('normal');
    
    // Store configuration in game registry
    const partner = CONFIG.characters[this.selectedHero].partner as 'aloo' | 'bilahi';
    this.registry.set('hero', this.selectedHero);
    this.registry.set('partner', partner);
    this.registry.set('score', 0);
    this.registry.set('health', 3);
    this.registry.set('secretsFound', 0);
    this.registry.set('secretBoxes', [false, false, false, false, false]); // Tracking all 5 gift boxes
    this.registry.set('activeCheckpoint', null);
    this.registry.set('doubleJumpUnlocked', true);

    // Quick camera flash and transition
    this.cameras.main.flash(500, 255, 255, 255);
    
    this.time.delayedCall(600, () => {
      this.scene.start('GameScene');
    });
  }
}
export default TitleScene;
