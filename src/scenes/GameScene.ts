import Phaser from 'phaser';
import Player from '../entities/Player.ts';
import Enemy from '../entities/Enemy.ts';
import Collectible from '../entities/Collectible.ts';
import AudioSynth from '../utils/AudioSynth.ts';
import { CONFIG } from '../config.ts';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private partner!: Phaser.GameObjects.Sprite; // Hostage at the end
  private boss!: Phaser.Physics.Arcade.Sprite; // Count Eggplant
  private cage!: Phaser.GameObjects.Sprite;
  
  // Physics groups
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private movingPlatforms!: Phaser.Physics.Arcade.Group;
  private spikes!: Phaser.Physics.Arcade.StaticGroup;
  private coins!: Phaser.GameObjects.Group;
  private gifts!: Phaser.GameObjects.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private projectiles!: Phaser.Physics.Arcade.Group;
  private checkpoints!: Phaser.Physics.Arcade.StaticGroup;
  private switches!: Phaser.Physics.Arcade.StaticGroup;
  private momos!: Phaser.Physics.Arcade.Group;

  // Parallax layers
  private bgClouds!: Phaser.GameObjects.TileSprite;
  private bgMountains!: Phaser.GameObjects.TileSprite;

  // Boss state
  private switchesActive = [false, false, false];
  private bossHits = 0;
  private bossState: 'hover' | 'angry' | 'defeated' = 'hover';
  private nextBombTime = 0;
  private activeSwitchSprites: Phaser.GameObjects.Sprite[] = [];
  private bossRoomTriggered = false;
  private rescueTriggered = false;
  private castleEndReachTriggered = false;

  // Secret Wall Overlay (Hidden room)
  private secretWalls!: Phaser.Physics.Arcade.StaticGroup;

  // Level grid dimensions
  private tileWidth = 16;
  private mapWidthTiles = 330;
  private playHeight!: number;

  constructor() {
    super('GameScene');
  }

  create() {
    AudioSynth.startMusic('normal');
    this.bossState = 'hover';
    this.bossHits = 0;
    this.switchesActive = [false, false, false];
    this.activeSwitchSprites = [];
    this.bossRoomTriggered = false;

    this.playHeight = this.scale.height - 240;
    const height = this.playHeight;

    // 1. Setup Camera bounds
    const worldWidth = this.mapWidthTiles * this.tileWidth;
    this.physics.world.setBounds(0, 0, worldWidth, height);
    this.cameras.main.setBounds(0, 0, worldWidth, height);
    this.cameras.main.setViewport(0, 0, this.scale.width, height);

    // 2. Parallax background layers
    this.add.graphics()
      .fillGradientStyle(0xa8dadc, 0xa8dadc, 0x457b9d, 0x457b9d, 1)
      .fillRect(0, 0, worldWidth, height);

    this.bgClouds = this.add.tileSprite(0, 120, worldWidth, 64, 'cloud');
    this.bgClouds.setOrigin(0, 0).setScrollFactor(0.1).setAlpha(0.5);

    this.bgMountains = this.add.tileSprite(0, height - 280, worldWidth, 128, 'mountain');
    this.bgMountains.setOrigin(0, 0).setScrollFactor(0.2).setScale(3.2).setAlpha(0.3);

    // 3. Initialize groups
    this.platforms = this.physics.add.staticGroup();
    this.movingPlatforms = this.physics.add.group();
    this.spikes = this.physics.add.staticGroup();
    this.coins = this.add.group();
    this.gifts = this.add.group();
    this.enemies = this.physics.add.group();
    this.projectiles = this.physics.add.group();
    this.checkpoints = this.physics.add.staticGroup();
    this.switches = this.physics.add.staticGroup();
    this.secretWalls = this.physics.add.staticGroup();
    this.momos = this.physics.add.group();

    this.rescueTriggered = false;
    this.castleEndReachTriggered = false;

    // 4. Generate Level Grid Map
    this.buildLevel();

    // 5. Setup Player spawn point
    let spawnX = 50;
    let spawnY = height - 100;

    // Read active checkpoint
    const activeCp = this.registry.get('activeCheckpoint');
    if (activeCp) {
      spawnX = activeCp.x;
      spawnY = activeCp.y - 20;
    }

    const selectedHero = this.registry.get('hero') || 'aloo';
    this.player = new Player(this, spawnX, spawnY, selectedHero);

    // 6. Camera Follow
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setDeadzone(100, 100);
    this.cameras.main.setZoom(1.2);

    // 7. Setup Colliders
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.enemies, this.platforms);
    
    // Moving platforms custom physics
    this.physics.add.collider(this.player, this.movingPlatforms, undefined, (playerObj, _platform) => {
      const p = playerObj as Player;
      // Only stand on platform if falling down onto it
      return ((p.body as Phaser.Physics.Arcade.Body).velocity.y) >= 0;
    });

    // Player vs Spikes (instant respawn/damage)
    this.physics.add.overlap(this.player, this.spikes, () => {
      this.handlePlayerDamage(true);
    });

    // Player vs Coins
    this.physics.add.overlap(this.player, this.coins, (_player, coin) => {
      (coin as Collectible).collect();
    });

    // Player vs Secret Gifts
    this.physics.add.overlap(this.player, this.gifts, (_player, gift) => {
      (gift as Collectible).collect();
    });

    // Player vs Checkpoints
    this.physics.add.overlap(this.player, this.checkpoints, (_player, flagObj) => {
      const flag = flagObj as Phaser.GameObjects.Sprite;
      if (flag.texture.key === 'checkpoint-empty') {
        flag.setTexture('checkpoint-active');
        AudioSynth.playCheckpoint();
        
        // Show checkpoint prompt
        const text = this.add.text(flag.x, flag.y - 30, 'CHECKPOINT!', {
          fontFamily: CONFIG.ui.fontFamily,
          fontSize: '12px',
          fontStyle: 'bold',
          color: '#4ade80'
        }).setOrigin(0.5);
        this.tweens.add({
          targets: text,
          y: flag.y - 60,
          alpha: 0,
          duration: 1000,
          onComplete: () => text.destroy()
        });

        // Set checkpoint coordinates
        this.registry.set('activeCheckpoint', { x: flag.x, y: flag.y });
      }
    });

    // Player vs Enemies (Stomp or Damage)
    this.physics.add.collider(this.player, this.enemies, (playerObj, enemyObj) => {
      const p = playerObj as Player;
      const e = enemyObj as Enemy;

      if (e.getIsDead()) return;

      // Stomp check: if player is in the air (after jump), OR if player's feet are above enemy's midpoint and moving down
      const inAir = p.body && (!p.body.blocked.down && !p.body.touching.down);
      if (inAir || (p.body && p.body.velocity.y > 0 && p.y + p.height / 2 < e.y + 4)) {
        p.bounce();
        e.stomp();
        
        // Award points
        const score = this.registry.get('score') || 0;
        this.registry.set('score', score + 200);
      } else {
        this.handlePlayerDamage();
      }
    });

    // Player vs Switches (Boss Room)
    this.physics.add.overlap(this.player, this.switches, (_player, switchObj) => {
      const s = switchObj as Phaser.GameObjects.Sprite;
      const idx = s.getData('index') as number;
      if (!this.switchesActive[idx]) {
        this.switchesActive[idx] = true;
        s.setTexture('switch-down');
        AudioSynth.playSwitch();

        // Check if all active
        if (this.switchesActive.every(val => val)) {
          this.triggerCageRelease();
        }
      }
    });

    // Player vs Seed Bombs (Boss Projectiles)
    this.physics.add.overlap(this.player, this.projectiles, (_player, projectile) => {
      projectile.destroy();
      this.handlePlayerDamage();
    });

    // Projectile vs Ground (Explodes)
    this.physics.add.collider(this.projectiles, this.platforms, (projectileObj) => {
      const proj = projectileObj as Phaser.Physics.Arcade.Sprite;
      // Create small spark particles
      const p = this.add.particles(proj.x, proj.y, 'particle', {
        speed: { min: 20, max: 50 },
        lifespan: 300,
        maxParticles: 5,
        tint: 0xef4444
      });
      this.time.delayedCall(350, () => p.destroy());
      proj.destroy();
    });

    // Player vs Boss (Final Challenge Stomp)
    this.physics.add.overlap(this.player, this.boss, (playerObj, _bossObj) => {
      if (this.bossState !== 'angry') return;
      const p = playerObj as Player;
      
      // Stomp check: if player is in the air (after jump), OR if player's feet are above boss midpoint
      const inAir = p.body && (!p.body.blocked.down && !p.body.touching.down);
      if (inAir || (p.body && p.body.velocity.y > 0 && p.y + p.height / 2 < this.boss.y + 4)) {
        p.bounce();
        this.damageBoss();
      } else {
        this.handlePlayerDamage();
      }
    });

    // Player vs Secret Wall Overlap (Reveals Hidden Area)
    this.physics.add.overlap(this.player, this.secretWalls, (_player, wallTile) => {
      // Fade out the secret wall tiles!
      this.tweens.add({
        targets: wallTile,
        alpha: 0,
        duration: 300
      });
    });

    // Player vs Momo
    this.physics.add.overlap(this.player, this.momos, (_player, momo) => {
      (momo as Collectible).collect();
    });

    // Register score listener for fireworks effect
    const scoreListener = (_parent: any, val: number) => {
      if (val > 0 && val % 500 === 0) {
        this.triggerMomoFireworks();
      }
    };
    this.registry.events.on('changedata-score', scoreListener);
    this.events.once('shutdown', () => {
      this.registry.events.off('changedata-score', scoreListener);
    });

    // 8. Launch UI HUD and dialogue overlay
    this.scene.launch('UIScene', { player: this.player });
    
    // Play intro dialogue on first spawn
    if (!activeCp) {
      this.time.delayedCall(500, () => {
        this.triggerDialogue('intro');
      });
    }
  }

  update(time: number, delta: number) {
    // 1. Update backgrounds for parallax scrolling
    this.bgClouds.tilePositionX = this.cameras.main.scrollX * 0.1;
    this.bgMountains.tilePositionX = this.cameras.main.scrollX * 0.2;

    // 2. Update player
    this.player.update(time, delta);

    // Make player follow moving platforms if standing on them
    let onMovingPlat = false;
    let platVelX = 0;
    let platVelY = 0;
    this.movingPlatforms.getChildren().forEach((plat: any) => {
      const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
      const platBody = plat.body as Phaser.Physics.Arcade.Body;
      if (playerBody.touching.down && platBody.touching.up) {
        onMovingPlat = true;
        platVelX = platBody.velocity.x;
        platVelY = platBody.velocity.y;
      }
    });
    if (onMovingPlat) {
      this.player.x += platVelX * (delta / 1000);
      this.player.y += platVelY * (delta / 1000);
    }

    // 3. Update all active enemies
    this.enemies.getChildren().forEach((e: any) => {
      e.update(time, delta);
    });

    // 4. Update moving platforms
    this.movingPlatforms.getChildren().forEach((plat: any) => {
      const platBody = plat.body as Phaser.Physics.Arcade.Body;
      const speedFactor = plat.getData('speedFactor') ?? 1;
      const speed = CONFIG.physics.movingPlatformSpeed * speedFactor;
      if (platBody.velocity.x === 0) {
        platBody.setVelocityX(speed);
      }
      // Reverse moving platform at boundaries
      const startX = plat.getData('startX');
      const dist = plat.getData('dist');
      if (plat.x > startX + dist && platBody.velocity.x > 0) {
        platBody.setVelocityX(-speed);
      } else if (plat.x < startX && platBody.velocity.x < 0) {
        platBody.setVelocityX(speed);
      }
    });

    // 5. Castle End Reach Trigger (partner shouts about switches)
    if (this.player.x > 265 * 16 && !this.castleEndReachTriggered) {
      this.castleEndReachTriggered = true;
      this.triggerDialogue('castle_end_reach');
    }

    // 6. Boss AI sequence (drops bombs when player is in Boss Room)
    if (this.bossState !== 'defeated' && this.boss && this.player.x > 4500) {
      if (!this.bossRoomTriggered) {
        this.bossRoomTriggered = true;
        AudioSynth.startMusic('tense'); // Play tense boss room music!
        this.triggerDialogue('boss_intro');
      }
      this.handleBossAI(time);
    }

    // 7. Rescue Trigger (Castle End Cage, after defeating boss)
    if (this.bossState === 'defeated' && this.player.x > 280 * 16 && !this.rescueTriggered) {
      this.rescueTriggered = true;
      this.completeRescue();
    }
  }

  private handlePlayerDamage(isSpike = false) {
    this.player.takeDamage(isSpike, () => {
      // Respawn: reload scene at checkpoint
      this.scene.restart();
    });
  }

  // --- Level Builder ---

  private buildLevel() {
    const height = this.playHeight;

    // Constructing level rows. Row index 0 to 29 (480px total height, each tile is 16px)
    // Floor is at row 28-29 (height - 32px)
    
    // Fill all floor tiles horizontally
    for (let x = 0; x < this.mapWidthTiles; x++) {
      let isCastle = x >= 220;
      
      // Spike pitfalls (made narrower/easier)
      const isSpikePit = 
        (x >= 81 && x <= 82) || 
        (x >= 142 && x <= 143) ||
        (x >= 181 && x <= 182) ||
        (x >= 242 && x <= 243) ||
        (x >= 266 && x <= 267) ||
        (x >= 312 && x <= 313);

      if (isSpikePit) {
        // Draw spikes at row 28, empty beneath
        this.spikes.create(x * 16 + 8, height - 24, 'tile-spikes');
        this.platforms.create(x * 16 + 8, height - 8, 'tile-dirt');
        continue;
      }

      // Draw floor
      if (isCastle) {
        this.platforms.create(x * 16 + 8, height - 24, 'tile-castle');
        this.platforms.create(x * 16 + 8, height - 8, 'tile-castle');
      } else {
        this.platforms.create(x * 16 + 8, height - 24, 'tile-grass');
        this.platforms.create(x * 16 + 8, height - 8, 'tile-dirt');
      }
    }

    // Handcrafted layout mapping (adds specific brick platforms, collectibles, enemies, etc.)

    // --- TUTORIAL AREA (x: 0 to 60) ---
    // Floating platform instructions steps
    this.createStaticBlock(25, 23, 5, 2, 'tile-grass');

    this.createCoin(27, 20);
    this.createCoin(29, 20);
    
    // Safe pit for single enemy tutorial
    this.createStaticBlock(40, 24, 6, 4, 'tile-grass');
    this.createStaticBlock(46, 27, 2, 1, 'tile-grass'); // Stair out
    this.spawnEnemy(43, 22, 'garlic');

    // Secret Gift Box 1: high platform above start (lowered for easy pickup)
    this.createStaticBlock(12, 24, 3, 1, 'tile-grass');
    this.createGiftBox(13, 22, 1);
    
    // Checkpoint 1
    this.createCheckpoint(55, 26);

    // --- GRASSLAND AREA (x: 60 to 130) ---
    // Step platforms
    this.createStaticBlock(68, 24, 3, 1, 'tile-grass');
    this.createStaticBlock(74, 21, 4, 1, 'tile-grass');
    this.spawnEnemy(76, 19, 'garlic');

    // Coins on platforms
    this.createCoin(75, 18);
    this.createCoin(77, 18);

    // High bridge platforms over spike pit (x: 80-83)
    this.createStaticBlock(82, 18, 5, 1, 'tile-grass');
    this.createCoin(84, 15);

    // Added a slow safety moving platform around x=87 to make vertical traversal easy
    this.createMovingPlatform(87, 20, 6, 3, 0.5);

    // Secret Gift Box 2: on a lowered floating platform for easy pickup
    this.createStaticBlock(95, 22, 2, 1, 'tile-grass');
    this.createGiftBox(95, 20, 2);

    // Patrol platform with jumping enemy
    this.createStaticBlock(105, 22, 10, 1, 'tile-grass');
    this.spawnEnemy(108, 20, 'bean');
    this.createCoin(110, 19);
    this.createCoin(112, 19);

    // Checkpoint 2
    this.createCheckpoint(125, 26);

    // --- FOREST AREA (x: 130 to 210) ---
    // Trees using wood trunk and leaves platforms
    // Tree 1: x=148
    this.createStaticBlock(147, 18, 2, 10, 'tile-wood'); // trunk
    this.createStaticBlock(144, 18, 8, 2, 'tile-leaves'); // leaves platforms
    this.createCoin(145, 16);
    this.createCoin(151, 16);
    this.spawnEnemy(146, 16, 'bean');

    // Tree 2: x=165 (Climbing challenge)
    this.createStaticBlock(164, 12, 2, 16, 'tile-wood');
    this.createStaticBlock(160, 20, 3, 1, 'tile-leaves');
    this.createStaticBlock(167, 16, 4, 1, 'tile-leaves');
    this.createStaticBlock(159, 12, 4, 1, 'tile-leaves');
    this.createStaticBlock(167, 8, 3, 1, 'tile-leaves');

    // Intermediate safety steps at row 24 to easily climb back up from the ground
    this.createStaticBlock(157, 24, 3, 1, 'tile-leaves');
    this.createStaticBlock(163, 24, 4, 1, 'tile-leaves');
    this.createStaticBlock(168, 24, 3, 1, 'tile-leaves');

    // Moving Platform (horizontally between 132 and 138 - made 3 blocks wide and 50% slower)
    this.createMovingPlatform(131, 22, 6, 3, 0.5);

    // Moving Platform 2 (vertical link in tree canopy x=154 - made 3 blocks wide and 50% slower)
    this.createMovingPlatform(154, 16, 5, 3, 0.5);

    // Added a slow moving platform around x=171 to make tree climbing easier
    this.createMovingPlatform(171, 14, 5, 3, 0.5);

    // Hidden Secret Area (Forest Alcove): x=190, y=20
    // We cover it with a secret leaf wall trigger, player enters to reveal Box 3
    this.createStaticBlock(190, 24, 6, 4, 'tile-wood');
    // Secret Wall overlay
    const secretWallStartY = this.getRelativeY(20);
    const secretWallEndY = this.getRelativeY(24);
    for (let ty = secretWallStartY; ty < secretWallEndY; ty++) {
      for (let tx = 190; tx < 196; tx++) {
        const wall = this.secretWalls.create(tx * 16 + 8, ty * 16 + 8, 'tile-leaves');
        wall.setAlpha(1.0);
      }
    }
    this.createGiftBox(192, 22, 3);
    this.createCoin(194, 22);

    // Checkpoint 3
    this.createCheckpoint(205, 26);

    // --- CASTLE AREA (x: 210 to 280) ---
    // Grey bricks, tricky spacing over spikes
    this.createStaticBlock(218, 23, 3, 5, 'tile-castle');
    this.createStaticBlock(226, 19, 4, 1, 'tile-castle');
    this.spawnEnemy(228, 17, 'bean');

    // Spike hazards inside castle
    this.createStaticBlock(233, 24, 2, 4, 'tile-castle');
    this.spikes.create(233 * 16 + 8, 23 * 16 + 8, 'tile-spikes');
    this.spikes.create(234 * 16 + 8, 23 * 16 + 8, 'tile-spikes');

    // Added a slow moving platform around x=235 to cross internal spikes safely
    this.createMovingPlatform(235, 18, 5, 3, 0.5);

    // High platform holding Gift Box 4 (lowered for easy pickup)
    this.createStaticBlock(248, 22, 3, 1, 'tile-castle');
    this.createGiftBox(249, 20, 4);

    // Falling hazard: spikes on walls
    this.createStaticBlock(258, 20, 2, 8, 'tile-castle');
    this.spawnEnemy(256, 26, 'garlic');

    // Checkpoint 4
    this.createCheckpoint(275, 26);

    // --- CASTLE END / BOSS ROOM (x: 280 to 330) ---
    // The cage suspended high up (at center x=303, y=13)
    const cageRelY = this.getRelativeY(13);
    this.cage = this.physics.add.sprite(303 * 16 + 16, cageRelY * 16 + 16, 'cage');
    (this.cage.body as Phaser.Physics.Arcade.Body).allowGravity = false;
    
    // Spawn Hostage inside the cage
    const partnerType = this.registry.get('partner') || 'bilahi';
    this.partner = this.add.sprite(303 * 16 + 16, cageRelY * 16 + 16, `${partnerType}-hostage`);

    // Switch platforms in the castle end
    this.createStaticBlock(285, 22, 3, 6, 'tile-castle'); // Left switch platform
    this.createStaticBlock(316, 22, 3, 6, 'tile-castle'); // Right switch platform

    // Additional floating platforms in the boss room (symmetrical double-staircase layout)
    this.createStaticBlock(293, 22, 3, 1, 'tile-castle'); // Lower left floating platform
    this.createStaticBlock(308, 22, 3, 1, 'tile-castle'); // Lower right floating platform
    this.createStaticBlock(297, 18, 2, 1, 'tile-castle'); // Upper left floating platform
    this.createStaticBlock(305, 18, 2, 1, 'tile-castle'); // Upper right floating platform

    // The 3 Switches to deactivate cage
    this.createSwitch(286, 21, 0); // Switch 0
    this.createSwitch(303, 27, 1); // Switch 1 (on floor)
    this.createSwitch(317, 21, 2); // Switch 2

    // Secret Gift Box 5 (above the boss area)
    this.createStaticBlock(299, 14, 3, 1, 'tile-castle');
    this.createGiftBox(300, 12, 5);

    // Spawn Boss (Count Eggplant)
    const bossRelY = this.getRelativeY(8);
    this.boss = this.physics.add.sprite(303 * 16 + 16, bossRelY * 16, 'villain');
    (this.boss.body as Phaser.Physics.Arcade.Body).allowGravity = false;
    
    // Float boss up and down gently
    this.tweens.add({
      targets: this.boss,
      y: bossRelY * 16 + 10,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  // --- Level Helpers ---

  private getRelativeY(origY: number): number {
    const origFloorRow = 28;
    const currentFloorRow = Math.floor(this.playHeight / 16) - 2;
    return currentFloorRow - (origFloorRow - origY);
  }

  private createStaticBlock(x: number, y: number, w: number, h: number, texture: string) {
    const relY = this.getRelativeY(y);
    for (let ty = relY; ty < relY + h; ty++) {
      for (let tx = x; tx < x + w; tx++) {
        this.platforms.create(tx * 16 + 8, ty * 16 + 8, texture);
      }
    }
  }

  private createMovingPlatform(x: number, y: number, distTiles: number, sizeBlocks: number = 1, speedFactor: number = 1) {
    const relY = this.getRelativeY(y);
    const texture = sizeBlocks === 3 ? 'tile-wood-3x' : 'tile-wood';
    const xOffset = sizeBlocks * 8;
    const plat = this.movingPlatforms.create(x * 16 + xOffset, relY * 16 + 8, texture);
    const platBody = plat.body as Phaser.Physics.Arcade.Body;
    platBody.allowGravity = false;
    platBody.immovable = true;
    plat.setData('startX', x * 16);
    plat.setData('dist', distTiles * 16);
    plat.setData('speedFactor', speedFactor);
    platBody.setSize(sizeBlocks * 16, 16);
  }

  private createCoin(x: number, y: number) {
    const relY = this.getRelativeY(y);
    const coin = new Collectible(this, x * 16 + 8, relY * 16 + 8, 'coin');
    this.coins.add(coin);
  }

  private createGiftBox(x: number, y: number, id: number) {
    const relY = this.getRelativeY(y);
    const gift = new Collectible(this, x * 16 + 8, relY * 16 + 8, 'gift', id);
    this.gifts.add(gift);
  }

  private createCheckpoint(x: number, y: number) {
    const relY = this.getRelativeY(y);
    const cp = this.checkpoints.create(x * 16 + 8, relY * 16 + 4, 'checkpoint-empty');
    if (cp.body) {
      const cpBody = cp.body as Phaser.Physics.Arcade.StaticBody;
      cpBody.setSize(64, 3000); // 3000px tall vertical overlap wall
      cpBody.setOffset(-28, -1496); // Reaches 1500px above and below flag base (no matter the vertical distance)
      cp.refreshBody();
    }
  }

  private createSwitch(x: number, y: number, index: number) {
    const relY = this.getRelativeY(y);
    const sw = this.switches.create(x * 16 + 8, relY * 16 + 8, 'switch-up');
    sw.setData('index', index);
    this.activeSwitchSprites.push(sw);
  }

  private spawnEnemy(x: number, y: number, type: 'garlic' | 'bean') {
    const relY = this.getRelativeY(y);
    const enemy = new Enemy(this, x * 16 + 8, relY * 16 + 8, type);
    this.enemies.add(enemy);
  }

  // --- Boss Battle Logic ---

  private handleBossAI(time: number) {
    if (this.bossState === 'hover') {
      // Drop seed bombs every 2.4 seconds
      if (time > this.nextBombTime) {
        this.dropSeedBomb();
        this.nextBombTime = time + 2400;
      }
    } else if (this.bossState === 'angry') {
      const bossBody = this.boss.body as Phaser.Physics.Arcade.Body;
      // Sweeping dash attack toward player horizontally (slower)
      if (bossBody.velocity.x === 0) {
        this.boss.setVelocityX(80);
      }
      if (this.boss.x > 318 * 16 && bossBody.velocity.x > 0) {
        this.boss.setVelocityX(-80);
        this.boss.setFlipX(true);
      } else if (this.boss.x < 287 * 16 && bossBody.velocity.x < 0) {
        this.boss.setVelocityX(80);
        this.boss.setFlipX(false);
      }
    }
  }

  private dropSeedBomb() {
    if (!this.boss || this.bossState === 'defeated') return;
    
    // Spawn bomb at boss bottom
    const bomb = this.projectiles.create(this.boss.x, this.boss.y + 16, 'particle');
    bomb.setScale(4); // make it larger
    bomb.setTint(0x9d4edd); // Purple seeds
    (bomb.body as Phaser.Physics.Arcade.Body).setVelocity(Phaser.Math.Between(-80, 80), 200);
  }

  private triggerCageRelease() {
    this.cameras.main.shake(500, 0.015);
    AudioSynth.playCheckpoint();

    // Release dialog
    this.triggerDialogue('cage_release');

    // Move cage down to floor
    this.tweens.add({
      targets: [this.cage, this.partner],
      y: this.getRelativeY(27) * 16, // Drop cage to floor level
      duration: 2000,
      ease: 'Bounce.easeOut',
      onComplete: () => {
        // Change boss to angry state and swoops down
        this.bossState = 'angry';
        this.tweens.killTweensOf(this.boss);
        this.boss.y = this.getRelativeY(20) * 16;
        (this.boss.body as Phaser.Physics.Arcade.Body).setSize(24, 24);
        this.boss.setVelocityX(-80);
      }
    });
  }

  private damageBoss() {
    this.bossHits++;
    AudioSynth.playStomp();

    // Flash red
    this.tweens.add({
      targets: this.boss,
      alpha: 0.3,
      duration: 70,
      yoyo: true,
      repeat: 3
    });

    // Defeat boss in 1 hit!
    this.defeatBoss();
  }

  private defeatBoss() {
    this.bossState = 'defeated';
    this.boss.disableBody(false, false);
    this.boss.setVelocity(0, 0);
    
    AudioSynth.playVictoryFanfare();
    
    // Spin and fly off screen
    this.tweens.add({
      targets: this.boss,
      y: this.boss.y - 30,
      x: this.boss.x + 80,
      angle: 720,
      alpha: 0,
      duration: 1200,
      onComplete: () => {
        this.boss.destroy();
        this.triggerDialogue('defeat');
      }
    });
  }

  public completeRescue() {
    // Cage doors break open
    this.cage.destroy();

    // Disable player physics so that gravity/collisions don't override the landing/walk tweens
    this.player.disableBody(true, false);

    // Hostage changes sprite to normal (untied)
    const partnerType = this.registry.get('partner') || 'bilahi';
    this.partner.setTexture(`${partnerType}-idle`);

    this.player.celebrate();

    const groundY = this.getRelativeY(28) * 16 - 12;

    // 1. Bring both to the ground completely (where player is)
    this.tweens.add({
      targets: [this.player, this.partner],
      y: groundY,
      duration: 800,
      ease: 'Bounce.easeOut', // Cute landing bounce
      onComplete: () => {
        // 2. Meet at midpoint
        const midX = (this.player.x + this.partner.x) / 2;
        
        // Make characters face each other
        const selectedHero = this.registry.get('hero') || 'aloo';
        const playerIsAloo = selectedHero === 'aloo';
        this.player.setFlipX(playerIsAloo ? true : false); // Face right
        this.partner.setFlipX(playerIsAloo ? true : false); // Face left
        
        this.tweens.add({
          targets: this.player,
          x: midX - 12,
          duration: 1000
        });

        this.tweens.add({
          targets: this.partner,
          x: midX + 12,
          duration: 1000,
          onComplete: () => {
            // Zoom camera in closely
            this.cameras.main.zoomTo(2.2, 1200);

            this.time.delayedCall(800, () => {
              this.triggerDialogue('rescue_celebrate');
            });
          }
        });
      }
    });
  }

  private triggerDialogue(key: 'intro' | 'castle_end_reach' | 'boss_intro' | 'cage_release' | 'defeat' | 'rescue_celebrate') {
    this.scene.pause('GameScene');
    this.scene.launch('DialogueScene', { dialogKey: key, parentScene: this });
  }

  private triggerMomoFireworks() {
    const cam = this.cameras.main;
    const colors = [0xff0054, 0x9e0059, 0xff5400, 0xffbd00, 0x390099, 0x06d6a0, 0x277da1];
    
    // Spawn 5 fireworks with slight delays
    for (let i = 0; i < 5; i++) {
      this.time.delayedCall(i * 300, () => {
        const fireX = cam.scrollX + Phaser.Math.Between(100, cam.width - 100);
        const fireY = Phaser.Math.Between(100, 250); // Explode in sky viewport area, not cut off at top
        const col = Phaser.Utils.Array.GetRandom(colors);
        
        // Flash burst particle emitter (significantly larger and denser)
        const emitter = this.add.particles(fireX, fireY, 'particle', {
          speed: { min: 50, max: 180 },
          angle: { min: 0, max: 360 },
          scale: { start: 3.5, end: 0 },
          alpha: { start: 1.0, end: 0 },
          lifespan: 900,
          maxParticles: 35,
          tint: col
        });
        
        // Small pop sound
        AudioSynth.playCoin();
        
        this.time.delayedCall(950, () => emitter.destroy());
      });
    }
  }
}
export default GameScene;
