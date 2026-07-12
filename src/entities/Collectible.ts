import Phaser from 'phaser';
import AudioSynth from '../utils/AudioSynth.ts';

export class Collectible extends Phaser.Physics.Arcade.Sprite {
  public collectibleType: 'coin' | 'gift' | 'momo';
  public giftId: number; // 1-5 if gift box
  private isCollected: boolean = false;
  private bobTween!: Phaser.Tweens.Tween;

  constructor(
    scene: Phaser.Scene, 
    x: number, 
    y: number, 
    type: 'coin' | 'gift' | 'momo', 
    giftId: number = 0
  ) {
    let textureKey = '';
    if (type === 'coin') {
      textureKey = 'momo';
    } else if (type === 'gift') {
      textureKey = `gift-${giftId}`;
    } else {
      textureKey = 'momo';
    }

    super(scene, x, y, textureKey);
    this.collectibleType = type;
    this.giftId = giftId;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Disable gravity for items
    (this.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    this.body?.setSize(14, 14);

    // Bobbing animation for polish (disabled for Momo to keep it stationary)
    if (type !== 'momo') {
      this.bobTween = scene.tweens.add({
        targets: this,
        y: this.y - 6,
        duration: 1000 + Math.random() * 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  public collect() {
    if (this.isCollected) return;
    this.isCollected = true;

    // Stop bobbing if exists
    if (this.bobTween) {
      this.bobTween.stop();
    }

    // Disable physics body immediately
    this.disableBody(false, false);

    // Dynamic Sound & Visual feedback
    if (this.collectibleType === 'coin') {
      AudioSynth.playCoin();
      // Increase score by 100
      const currentScore = this.scene.registry.get('score') || 0;
      this.scene.registry.set('score', currentScore + 100);
      
      // Floating text score
      this.showPopText('+100');
    } else if (this.collectibleType === 'gift') {
      AudioSynth.playCheckpoint();
      // Mark this specific gift box as found in the registry array
      const boxes = this.scene.registry.get('secretBoxes') || [false, false, false, false, false];
      if (this.giftId >= 1 && this.giftId <= 5) {
        boxes[this.giftId - 1] = true;
      }
      this.scene.registry.set('secretBoxes', boxes);

      const foundCount = (this.scene.registry.get('secretsFound') || 0) + 1;
      this.scene.registry.set('secretsFound', foundCount);

      // Special popup message
      this.showPopText(`GIFT ${this.giftId}/5!`, '#ffb703');
    } else if (this.collectibleType === 'momo') {
      AudioSynth.playCheckpoint();
      // Unlock double jump in registry!
      this.scene.registry.set('doubleJumpUnlocked', true);
      
      // Special popup message
      this.showPopText('MOMO POWER! DOUBLE JUMP UNLOCKED!', '#4ade80');
    }

    // Sparkle Particle Burst
    this.createSparkleBurst();

    // Spin & float away tween
    this.scene.tweens.add({
      targets: this,
      y: this.y - 30,
      scaleX: 0,
      scaleY: 0,
      angle: 360,
      alpha: 0,
      duration: 400,
      onComplete: () => {
        this.destroy();
      }
    });
  }

  private showPopText(text: string, color: string = '#ffffff') {
    const textObj = this.scene.add.text(this.x, this.y - 12, text, {
      fontFamily: '"Outfit", "Inter", sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: color
    }).setOrigin(0.5);

    this.scene.tweens.add({
      targets: textObj,
      y: this.y - 40,
      alpha: 0,
      duration: 800,
      onComplete: () => {
        textObj.destroy();
      }
    });
  }

  private createSparkleBurst() {
    const confettiColors = [0xff7096, 0x4cc9f0, 0xffb703, 0x9d4edd, 0x4ade80, 0xf72585, 0xff9f1c];
    const particles = this.scene.add.particles(this.x, this.y, 'particle', {
      speed: { min: 30, max: 100 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.2, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: { min: 300, max: 600 },
      maxParticles: 16,
      tint: confettiColors
    });
    
    // Automatically clean up particle manager after completion
    this.scene.time.delayedCall(650, () => {
      particles.destroy();
    });
  }
}
export default Collectible;
