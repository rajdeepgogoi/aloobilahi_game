import Phaser from 'phaser';
import './style.css';
import BootScene from './scenes/BootScene.ts';
import TitleScene from './scenes/TitleScene.ts';
import GameScene from './scenes/GameScene.ts';
import DialogueScene from './scenes/DialogueScene.ts';
import UIScene from './scenes/UIScene.ts';
import PauseScene from './scenes/PauseScene.ts';
import EndingScene from './scenes/EndingScene.ts';
import { CONFIG } from './config.ts';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: CONFIG.width,
  height: CONFIG.height,
  parent: 'game-container',
  pixelArt: true, // Tell Phaser to use pixel-perfect scaling internally
  backgroundColor: '#0b132b',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: CONFIG.gravity },
      debug: false // Set to true to inspect bounding boxes during dev
    }
  },
  scene: [
    BootScene,
    TitleScene,
    GameScene,
    DialogueScene,
    UIScene,
    PauseScene,
    EndingScene
  ],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  input: {
    activePointers: 3
  }
};

// Initialize the Phaser game instance
new Phaser.Game(config);
