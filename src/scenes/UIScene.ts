import Phaser from 'phaser';
import Player from '../entities/Player.ts';
import AudioSynth from '../utils/AudioSynth.ts';
import { CONFIG } from '../config.ts';

export class UIScene extends Phaser.Scene {
  private player!: Player;
  private coinText!: Phaser.GameObjects.Text;
  private giftContainer!: Phaser.GameObjects.Container;
  private volumeButton!: Phaser.GameObjects.Text;
  private healthText!: Phaser.GameObjects.Text;

  // Touch zones/graphics
  private btnLeft!: Phaser.GameObjects.Graphics;
  private btnRight!: Phaser.GameObjects.Graphics;
  private btnJump!: Phaser.GameObjects.Graphics;

  constructor() {
    super('UIScene');
  }

  create(data: { player: Player }) {
    this.player = data.player;
    const width = this.scale.width;

    // 1. HUD Left: Coin/Potato Counter
    const coinTexture = 'momo';
    
    // Coin Icon
    this.add.image(25, 25, coinTexture).setScale(1.8);
    this.coinText = this.add.text(45, 15, 'x 000', {
      fontFamily: CONFIG.ui.fontFamily,
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#ffffff'
    });

    // Health Hearts Counter
    const initialHealth = this.registry.get('health') ?? 3;
    this.healthText = this.add.text(125, 15, '❤️'.repeat(initialHealth), {
      fontSize: '18px'
    });

    // 2. HUD Right: Secret Gift Box Tracker (1-5 color dots)
    this.giftContainer = this.add.container(width - 150, 15);
    this.updateGiftHUD();

    // 3. Pause & Volume Buttons (Top center-right)
    const pauseBtn = this.add.text(width - 200, 15, '⏸️', {
      fontSize: '20px'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    pauseBtn.on('pointerdown', () => {
      AudioSynth.playSwitch();
      this.scene.pause('GameScene');
      this.scene.launch('PauseScene');
    });

    this.volumeButton = this.add.text(width - 240, 15, AudioSynth.getMuted() ? '🔇' : '🔊', {
      fontSize: '20px'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.volumeButton.on('pointerdown', () => {
      const isMuted = AudioSynth.toggleMute();
      this.volumeButton.setText(isMuted ? '🔇' : '🔊');
    });

    // 4. Render Virtual On-screen Controls (playable on both PC and mobile)
    this.setupVirtualControls();

    // 5. Setup Registry Listeners for Auto-HUD updates
    this.registry.events.on('changedata-score', (_parent: any, val: number) => {
      this.coinText.setText(`x ${String(val).padStart(3, '0')}`);
    });

    this.registry.events.on('changedata-secretBoxes', () => {
      this.updateGiftHUD();
    });

    this.registry.events.on('changedata-health', (_parent: any, val: number) => {
      this.healthText.setText('❤️'.repeat(Math.max(0, val)));
    });
  }

  private updateGiftHUD() {
    this.giftContainer.removeAll(true);
    
    const boxes = this.registry.get('secretBoxes') || [false, false, false, false, false];
    
    boxes.forEach((found: boolean, index: number) => {
      const xOffset = index * 24;
      const giftTexture = `gift-${index + 1}`;
      
      const img = this.add.image(xOffset, 10, giftTexture).setScale(1.2);
      if (!found) {
        img.setAlpha(0.25).setTint(0x555555); // Gray out uncollected
      } else {
        img.setAlpha(1.0).clearTint();
        
        // Pulse animation for collected ones
        this.tweens.add({
          targets: img,
          scaleX: 1.5,
          scaleY: 1.5,
          duration: 150,
          yoyo: true
        });
      }
      this.giftContainer.add(img);
    });
  }

  private setupVirtualControls() {
    const height = this.scale.height;
    const width = this.scale.width;

    const controlBarHeight = 240; // Increased to cover Vivo X200 bottom bar area and maintain 16px grid alignment

    // Draw solid black background bar at the bottom for controls
    const blackBar = this.add.graphics();
    blackBar.fillStyle(0x000000, 1.0);
    blackBar.fillRect(0, height - controlBarHeight, width, controlBarHeight);
    blackBar.lineStyle(3, 0x333333, 1);
    blackBar.lineBetween(0, height - controlBarHeight, width, height - controlBarHeight);

    // Glassmorphic design styling constants (comfortably sized for mobile thumbs)
    const btnSize = 80;
    const jumpSize = 105;
    const padding = 15;
    
    const leftX = btnSize / 2 + padding + 15;
    const leftY = height - 120; // Raised further up to prevent screen border clips and gestures overlap
    
    const rightX = leftX + btnSize + padding + 15;
    const rightY = leftY;

    const jumpX = width - jumpSize / 2 - padding - 15;
    const jumpY = height - 120; // Raised further up

    // LEFT BUTTON
    this.btnLeft = this.add.graphics();
    this.drawButtonIdle(this.btnLeft, leftX, leftY, btnSize / 2);
    this.add.text(leftX, leftY, '◀', { fontSize: '32px', color: '#ffffff' }).setOrigin(0.5);

    this.btnLeft.setInteractive(
      new Phaser.Geom.Circle(leftX, leftY, btnSize / 2),
      Phaser.Geom.Circle.Contains
    );
    this.btnLeft.on('pointerdown', () => {
      this.player.virtualLeft = true;
      this.drawButtonPressed(this.btnLeft, leftX, leftY, btnSize / 2);
    });
    this.btnLeft.on('pointerup', () => {
      this.player.virtualLeft = false;
      this.drawButtonIdle(this.btnLeft, leftX, leftY, btnSize / 2);
    });
    this.btnLeft.on('pointerout', () => {
      this.player.virtualLeft = false;
      this.drawButtonIdle(this.btnLeft, leftX, leftY, btnSize / 2);
    });

    // RIGHT BUTTON
    this.btnRight = this.add.graphics();
    this.drawButtonIdle(this.btnRight, rightX, rightY, btnSize / 2);
    this.add.text(rightX, rightY, '▶', { fontSize: '32px', color: '#ffffff' }).setOrigin(0.5);

    this.btnRight.setInteractive(
      new Phaser.Geom.Circle(rightX, rightY, btnSize / 2),
      Phaser.Geom.Circle.Contains
    );
    this.btnRight.on('pointerdown', () => {
      this.player.virtualRight = true;
      this.drawButtonPressed(this.btnRight, rightX, rightY, btnSize / 2);
    });
    this.btnRight.on('pointerup', () => {
      this.player.virtualRight = false;
      this.drawButtonIdle(this.btnRight, rightX, rightY, btnSize / 2);
    });
    this.btnRight.on('pointerout', () => {
      this.player.virtualRight = false;
      this.drawButtonIdle(this.btnRight, rightX, rightY, btnSize / 2);
    });

    // JUMP BUTTON
    this.btnJump = this.add.graphics();
    this.drawButtonJumpIdle(this.btnJump, jumpX, jumpY, jumpSize / 2);
    this.add.text(jumpX, jumpY, 'JUMP', { fontSize: '18px', fontStyle: 'bold', color: '#ffffff' }).setOrigin(0.5);

    this.btnJump.setInteractive(
      new Phaser.Geom.Circle(jumpX, jumpY, jumpSize / 2),
      Phaser.Geom.Circle.Contains
    );
    this.btnJump.on('pointerdown', () => {
      this.player.virtualJump = true;
      this.drawButtonJumpPressed(this.btnJump, jumpX, jumpY, jumpSize / 2);
    });
    this.btnJump.on('pointerup', () => {
      this.drawButtonJumpIdle(this.btnJump, jumpX, jumpY, jumpSize / 2);
    });
    this.btnJump.on('pointerout', () => {
      this.drawButtonJumpIdle(this.btnJump, jumpX, jumpY, jumpSize / 2);
    });

    // Safety: global pointerup listener resets keys to prevent stuck inputs
    this.input.on('pointerup', () => {
      const pointer1Down = this.input.pointer1 && this.input.pointer1.isDown;
      const pointer2Down = this.input.pointer2 && this.input.pointer2.isDown;
      const pointer3Down = this.input.pointer3 && this.input.pointer3.isDown;
      const mousePointerDown = this.input.mousePointer && this.input.mousePointer.isDown;

      if (!pointer1Down && !pointer2Down && !pointer3Down && !mousePointerDown) {
        this.player.virtualLeft = false;
        this.player.virtualRight = false;
        this.player.virtualJump = false;
        this.drawButtonIdle(this.btnLeft, leftX, leftY, btnSize / 2);
        this.drawButtonIdle(this.btnRight, rightX, rightY, btnSize / 2);
        this.drawButtonJumpIdle(this.btnJump, jumpX, jumpY, jumpSize / 2);
      }
    });
  }

  private drawButtonIdle(graphics: Phaser.GameObjects.Graphics, x: number, y: number, radius: number) {
    graphics.clear();
    graphics.fillStyle(0xffffff, 0.15);
    graphics.lineStyle(2, 0xffffff, 0.3);
    graphics.fillCircle(x, y, radius);
    graphics.strokeCircle(x, y, radius);
  }

  private drawButtonPressed(graphics: Phaser.GameObjects.Graphics, x: number, y: number, radius: number) {
    graphics.clear();
    graphics.fillStyle(0xffb703, 0.5);
    graphics.lineStyle(2, 0xffb703, 0.8);
    graphics.fillCircle(x, y, radius);
    graphics.strokeCircle(x, y, radius);
  }

  private drawButtonJumpIdle(graphics: Phaser.GameObjects.Graphics, x: number, y: number, radius: number) {
    graphics.clear();
    graphics.fillStyle(0xe63946, 0.3);
    graphics.lineStyle(2, 0xffffff, 0.4);
    graphics.fillCircle(x, y, radius);
    graphics.strokeCircle(x, y, radius);
  }

  private drawButtonJumpPressed(graphics: Phaser.GameObjects.Graphics, x: number, y: number, radius: number) {
    graphics.clear();
    graphics.fillStyle(0xe63946, 0.7);
    graphics.lineStyle(2, 0xffffff, 0.8);
    graphics.fillCircle(x, y, radius);
    graphics.strokeCircle(x, y, radius);
  }

  shutdown() {
    this.registry.events.off('changedata-score');
    this.registry.events.off('changedata-secretBoxes');
    this.registry.events.off('changedata-health');
  }
}
export default UIScene;
