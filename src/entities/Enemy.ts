import Phaser from 'phaser';
import { CONFIG } from '../config.ts';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  public type: 'garlic' | 'bean';
  private patrolSpeed: number;
  private isDead: boolean = false;

  // Jumping bean timer
  private nextJumpTime: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, enemyType: 'garlic' | 'bean') {
    const textureKey = `enemy-${enemyType}`;
    super(scene, x, y, textureKey);
    this.type = enemyType;
    this.patrolSpeed = CONFIG.physics.enemySpeed;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.body?.setSize(14, 14);
    
    // Set initial moving direction
    this.setVelocityX(-this.patrolSpeed);
  }

  public update(time: number, _delta: number) {
    if (this.isDead) return;

    const onGround = this.body?.blocked.down || this.body?.touching.down;

    // Patroller AI
    if (this.type === 'garlic') {
      // Reverse direction when colliding with a wall
      if (this.body?.blocked.left) {
        this.setVelocityX(this.patrolSpeed);
        this.setFlipX(true);
      } else if (this.body?.blocked.right) {
        this.setVelocityX(-this.patrolSpeed);
        this.setFlipX(false);
      }
    } 
    
    else if (this.type === 'bean') {
      // Jumper AI: moves back and forth, and hops when on ground
      if (this.body?.blocked.left) {
        this.setVelocityX(this.patrolSpeed);
        this.setFlipX(true);
      } else if (this.body?.blocked.right) {
        this.setVelocityX(-this.patrolSpeed);
        this.setFlipX(false);
      }

      if (onGround && time > this.nextJumpTime) {
        // Jump!
        this.setVelocityY(-250);
        // Set next jump time (randomized between 1.5 and 2.5 seconds)
        this.nextJumpTime = time + Phaser.Math.Between(1500, 2500);
      }
    }
  }

  public stomp() {
    if (this.isDead) return;
    this.isDead = true;

    // Disable physics
    this.disableBody(false, false);
    
    // Play squish/spin death animation
    this.setFlipY(true);
    this.setVelocity(0, -150); // Small pop up
    
    this.scene.tweens.add({
      targets: this,
      y: this.y + 100,
      alpha: 0,
      angle: 180,
      duration: 500,
      onComplete: () => {
        this.destroy();
      }
    });
  }

  public getIsDead(): boolean {
    return this.isDead;
  }
}
export default Enemy;
