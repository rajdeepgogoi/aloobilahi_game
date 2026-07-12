import Phaser from 'phaser';
import TextureGenerator from '../utils/TextureGenerator.ts';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Show a clean, aesthetic loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Background card for loading
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x1d3557, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const progressBar = this.add.graphics();

    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'Gardening the Assets...',
      style: {
        font: '16px monospace',
        color: '#ffffff'
      }
    });
    loadingText.setOrigin(0.5, 0.5);

    const percentText = this.make.text({
      x: width / 2,
      y: height / 2,
      text: '0%',
      style: {
        font: '14px monospace',
        color: '#ffb703'
      }
    });
    percentText.setOrigin(0.5, 0.5);

    // Simulate standard preloader events (we generate programmatically, but this gives a polished loading feel)
    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.1;
      if (progress >= 1.0) {
        progress = 1.0;
        clearInterval(interval);
        
        // Build all procedural textures
        TextureGenerator.generateAll(this);
        
        // Define player animations
        this.createAnimations();

        // Complete transition
        progressBar.destroy();
        progressBox.destroy();
        loadingText.destroy();
        percentText.destroy();
        this.scene.start('TitleScene');
      }
      
      progressBar.clear();
      progressBar.fillStyle(0xffb703, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * progress, 30);
      percentText.setText(Math.floor(progress * 100) + '%');
    }, 100);
  }

  private createAnimations() {
    // Aloo (Potato) Animations
    this.anims.create({
      key: 'aloo-walk',
      frames: [
        { key: 'aloo-walk1' },
        { key: 'aloo-walk2' }
      ],
      frameRate: 8,
      repeat: -1
    });
    this.anims.create({
      key: 'aloo-idle',
      frames: [{ key: 'aloo-idle' }],
      frameRate: 1
    });
    this.anims.create({
      key: 'aloo-hurt',
      frames: [{ key: 'aloo-hurt' }],
      frameRate: 1
    });

    // Bilahi (Tomato) Animations
    this.anims.create({
      key: 'bilahi-walk',
      frames: [
        { key: 'bilahi-walk1' },
        { key: 'bilahi-walk2' }
      ],
      frameRate: 8,
      repeat: -1
    });
    this.anims.create({
      key: 'bilahi-idle',
      frames: [{ key: 'bilahi-idle' }],
      frameRate: 1
    });
    this.anims.create({
      key: 'bilahi-hurt',
      frames: [{ key: 'bilahi-hurt' }],
      frameRate: 1
    });
  }
}
export default BootScene;
