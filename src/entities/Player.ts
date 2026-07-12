import Phaser from 'phaser';
import AudioSynth from '../utils/AudioSynth.ts';
import { CONFIG } from '../config.ts';

export class Player extends Phaser.Physics.Arcade.Sprite {
  public characterType: 'aloo' | 'bilahi';
  private speed: number;
  private jumpVelocity: number;

  // Input bindings
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };

  // Virtual controller flags (for mobile support)
  public virtualLeft: boolean = false;
  public virtualRight: boolean = false;
  public virtualJump: boolean = false;

  // Game Feel variables
  private coyoteTimeMs: number = 200;
  private timeSinceOnGround: number = 0;
  private jumpBufferMs: number = 200;
  private timeSinceJumpPressed: number = 0;
  public isDead: boolean = false;
  private invulnerable: boolean = false;
  private jumpCount: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, heroType: 'aloo' | 'bilahi') {
    const defaultIdleKey = `${heroType}-idle`;
    super(scene, x, y, defaultIdleKey);
    
    this.characterType = heroType;
    const stats = CONFIG.characters[heroType];
    this.speed = stats.speed;
    this.jumpVelocity = stats.jumpVelocity;

    // Add to scene and enable physics
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Physics settings
    this.setCollideWorldBounds(true);
    this.body?.setSize(14, 20); // Crop collision box slightly for better platforming spacing
    this.body?.setOffset(5, 4);
    
    // Set drag and friction for smooth movement
    this.setDragX(CONFIG.physics.playerDrag);
    
    // Key bindings setup
    if (scene.input.keyboard) {
      this.cursors = scene.input.keyboard.createCursorKeys();
      this.wasd = {
        W: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
      };
    }
  }

  public update(_time: number, delta: number) {
    if (this.isDead) return;

    const onGround = this.body?.blocked.down || this.body?.touching.down;
    
    // 1. Coyote Time tracker
    if (onGround) {
      this.timeSinceOnGround = 0;
    } else {
      this.timeSinceOnGround += delta;
    }

    // 2. Jump Buffer tracker
    const jumpJustPressed = 
      Phaser.Input.Keyboard.JustDown(this.cursors.space) || 
      Phaser.Input.Keyboard.JustDown(this.cursors.up) || 
      (this.wasd && Phaser.Input.Keyboard.JustDown(this.wasd.W)) ||
      this.virtualJump;

    if (jumpJustPressed) {
      this.timeSinceJumpPressed = 0;
      this.virtualJump = false; // Reset mobile trigger
    } else {
      this.timeSinceJumpPressed += delta;
    }

    // 3. Horizontal Movement
    const leftPressed = this.cursors.left.isDown || (this.wasd && this.wasd.A.isDown) || this.virtualLeft;
    const rightPressed = this.cursors.right.isDown || (this.wasd && this.wasd.D.isDown) || this.virtualRight;

    const facesLeftByDefault = this.characterType === 'aloo';

    if (leftPressed) {
      this.setVelocityX(-this.speed);
      this.setFlipX(facesLeftByDefault ? false : true);
      if (onGround) {
        this.play(`${this.characterType}-walk`, true);
      }
    } else if (rightPressed) {
      this.setVelocityX(this.speed);
      this.setFlipX(facesLeftByDefault ? true : false);
      if (onGround) {
        this.play(`${this.characterType}-walk`, true);
      }
    } else {
      // Apply drag to slow down
      if (onGround) {
        this.setVelocityX(0);
        this.play(`${this.characterType}-idle`, true);
      }
    }

    if (onGround) {
      this.jumpCount = 0;
    }

    // 4. Jumping with Coyote Time, Jump Buffer, and Double Jump
    const wantsToJump = this.timeSinceJumpPressed < this.jumpBufferMs;

    if (wantsToJump) {
      const canNormalJump = onGround || (this.timeSinceOnGround < this.coyoteTimeMs);
      if (canNormalJump && this.jumpCount === 0) {
        this.setVelocityY(this.jumpVelocity);
        AudioSynth.playJump();
        this.jumpCount = 1;
        this.timeSinceJumpPressed = this.jumpBufferMs; // Consume jump buffer
        this.timeSinceOnGround = this.coyoteTimeMs; // Consume coyote time
      } else if (!onGround && this.jumpCount < 2) {
        // Double jump! Only allowed if double jump is unlocked (enabled by default now)
        const doubleJumpUnlocked = this.scene.registry.get('doubleJumpUnlocked') === true;
        if (doubleJumpUnlocked) {
          this.setVelocityY(this.jumpVelocity); // 100% velocity for a strong, easy double jump
          AudioSynth.playJump();
          
          // If player walked off a ledge (jumpCount is 0), the first jump sets it to 1 so they can jump again!
          if (this.jumpCount === 0) {
            this.jumpCount = 1;
          } else {
            this.jumpCount = 2;
          }
          
          this.timeSinceJumpPressed = this.jumpBufferMs; // Consume jump buffer
          
          // Spawn double jump particles
          const p = this.scene.add.particles(this.x, this.y + 10, 'particle', {
            speed: { min: 20, max: 50 },
            angle: { min: 0, max: 360 },
            scale: { start: 1.5, end: 0 },
            alpha: { start: 0.8, end: 0 },
            lifespan: 300,
            maxParticles: 6,
            tint: 0xffffff
          });
          this.scene.time.delayedCall(350, () => p.destroy());
        }
      }
    }

    // 5. Jump animations
    if (!onGround) {
      this.play(`${this.characterType}-idle`, true);
    }
  }

  public bounce() {
    this.setVelocityY(this.jumpVelocity * 0.6); // Slightly lower than normal jump
  }

  public takeDamage(isSpike: boolean, respawnCallback: () => void) {
    if (this.invulnerable || this.isDead) return;
    
    // Get current health
    let health = this.scene.registry.get('health') ?? 3;
    health -= 1;
    this.scene.registry.set('health', health);
    
    // Play hurt sound
    AudioSynth.playHurt();

    if (health <= 0) {
      this.isDead = true;
      this.setVelocity(0, 0);
      this.play(`${this.characterType}-hurt`, true);
      
      // Camera shake effect
      this.scene.cameras.main.shake(250, 0.02);

      // Death drop effect
      this.disableBody(false, false);
      this.scene.tweens.add({
        targets: this,
        y: this.y - 20,
        duration: 150,
        yoyo: true,
        onComplete: () => {
          this.scene.cameras.main.fade(300, 29, 53, 87);
          this.scene.time.delayedCall(300, () => {
            // Reset health for next try
            this.scene.registry.set('health', 3);
            respawnCallback();
            this.isDead = false;
            this.enableBody(true, this.x, this.y, true, true);
            this.play(`${this.characterType}-idle`, true);
            this.scene.cameras.main.fadeIn(300);
            
            // Make invulnerable briefly on respawn
            this.invulnerable = true;
            this.setAlpha(0.6);
            this.scene.time.delayedCall(1000, () => {
              this.invulnerable = false;
              this.setAlpha(1.0);
            });
          });
        }
      });
    } else {
      // Play hurt animation briefly and make invulnerable
      this.invulnerable = true;
      this.play(`${this.characterType}-hurt`, true);

      // Camera shake effect (smaller)
      this.scene.cameras.main.shake(150, 0.01);

      if (isSpike) {
        // For spikes, respawn at last checkpoint immediately but keep remaining health!
        this.isDead = true;
        this.setVelocity(0, 0);
        this.disableBody(false, false);
        this.scene.cameras.main.fade(200, 29, 53, 87);
        this.scene.time.delayedCall(200, () => {
          // Relocate to last checkpoint
          const activeCp = this.scene.registry.get('activeCheckpoint');
          let spawnX = 50;
          let spawnY = this.scene.scale.height - 100;
          if (activeCp) {
            spawnX = activeCp.x;
            spawnY = activeCp.y - 20;
          }
          this.x = spawnX;
          this.y = spawnY;
          this.isDead = false;
          this.enableBody(true, this.x, this.y, true, true);
          this.play(`${this.characterType}-idle`, true);
          this.scene.cameras.main.fadeIn(200);

          // Flash invulnerable
          this.scene.tweens.add({
            targets: this,
            alpha: 0.4,
            duration: 100,
            yoyo: true,
            repeat: 10,
            onComplete: () => {
              this.invulnerable = false;
              this.setAlpha(1.0);
            }
          });
        });
      } else {
        // Knockback player away from damage source
        const direction = this.flipX ? 1 : -1;
        this.setVelocity(direction * 180, -200);

        // Flash invulnerable
        this.scene.tweens.add({
          targets: this,
          alpha: 0.4,
          duration: 100,
          yoyo: true,
          repeat: 10,
          onComplete: () => {
            this.invulnerable = false;
            this.setAlpha(1.0);
            if (!this.isDead) {
              this.play(`${this.characterType}-idle`, true);
            }
          }
        });
      }
    }
  }

  public celebrate() {
    this.isDead = true;
    this.setVelocity(0, 0);
    this.play(`${this.characterType}-idle`, true);
  }
}
export default Player;
