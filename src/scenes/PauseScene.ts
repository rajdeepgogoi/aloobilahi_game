import Phaser from 'phaser';
import AudioSynth from '../utils/AudioSynth.ts';
import { CONFIG } from '../config.ts';

export class PauseScene extends Phaser.Scene {
  constructor() {
    super('PauseScene');
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    // Semi-transparent backdrop
    this.add.graphics()
      .fillStyle(0x1d3557, 0.7)
      .fillRect(0, 0, width, height);

    // Modal Box container
    const modalW = 320;
    const modalH = 260;
    const modalX = (width - modalW) / 2;
    const modalY = (height - modalH) / 2;

    const modalBg = this.add.graphics();
    modalBg.fillStyle(0x1d3557, 0.95);
    modalBg.lineStyle(3, 0xffb703, 1);
    modalBg.fillRoundedRect(modalX, modalY, modalW, modalH, 15);
    modalBg.strokeRoundedRect(modalX, modalY, modalW, modalH, 15);

    // Pause Title
    this.add.text(width / 2, modalY + 30, 'PAUSED', {
      fontFamily: CONFIG.ui.fontFamily,
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#e63946'
    }).setOrigin(0.5);

    // Buttons
    this.createButton(width / 2, modalY + 90, 'Resume Game', () => {
      this.scene.stop('PauseScene');
      this.scene.resume('GameScene');
    });

    this.createButton(width / 2, modalY + 140, 'Restart Level', () => {
      this.scene.stop('PauseScene');
      this.scene.stop('UIScene');
      this.scene.stop('GameScene');
      // Reset score and checkpoints
      this.registry.set('score', 0);
      this.registry.set('health', 3);
      this.registry.set('secretsFound', 0);
      this.registry.set('secretBoxes', [false, false, false, false, false]);
      this.registry.set('activeCheckpoint', null);
      this.scene.start('GameScene');
    });

    this.createButton(width / 2, modalY + 190, 'Main Menu', () => {
      this.scene.stop('PauseScene');
      this.scene.stop('UIScene');
      this.scene.stop('GameScene');
      this.scene.start('TitleScene');
    });

    // Keyboard trigger: Esc or P also resumes
    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.stop('PauseScene');
      this.scene.resume('GameScene');
    });
    this.input.keyboard?.on('keydown-P', () => {
      this.scene.stop('PauseScene');
      this.scene.resume('GameScene');
    });
  }

  private createButton(x: number, y: number, text: string, callback: () => void) {
    const btn = this.add.text(x, y, text, {
      fontFamily: CONFIG.ui.fontFamily,
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#ffffff',
      backgroundColor: 'rgba(255,255,255,0.08)',
      padding: { x: 16, y: 8 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerdown', () => {
      AudioSynth.playSwitch();
      callback();
    });

    btn.on('pointerover', () => {
      btn.setColor('#ffb703');
      btn.setBackgroundColor('rgba(255,255,255,0.15)');
    });

    btn.on('pointerout', () => {
      btn.setColor('#ffffff');
      btn.setBackgroundColor('rgba(255,255,255,0.08)');
    });
  }
}
export default PauseScene;
