import Phaser from 'phaser';
import AudioSynth from '../utils/AudioSynth.ts';
import { CONFIG } from '../config.ts';

interface DialogueLine {
  speaker: 'hero' | 'partner' | 'villain' | 'system';
  text: string;
}

export class DialogueScene extends Phaser.Scene {
  private dialogQueue: DialogueLine[] = [];
  private currentLineIndex = 0;
  private typedText = '';
  private fullText = '';
  private typingTimer?: Phaser.Time.TimerEvent;
  
  // UI Elements
  private boxBg!: Phaser.GameObjects.Graphics;
  private speakerText!: Phaser.GameObjects.Text;
  private bodyText!: Phaser.GameObjects.Text;
  private promptText!: Phaser.GameObjects.Text;
  private portraitSprite!: Phaser.GameObjects.Sprite;
  
  private parentScene!: Phaser.Scene;
  private dialogKey!: string;

  constructor() {
    super('DialogueScene');
  }

  create(data: { dialogKey: string; parentScene: Phaser.Scene }) {
    this.parentScene = data.parentScene;
    this.dialogKey = data.dialogKey;
    this.currentLineIndex = 0;

    const width = this.scale.width;
    const height = this.scale.height;

    // 1. Build dialog box layout (dynamic sizing for portrait)
    const playHeight = height - 240;
    const boxW = Math.min(width - 40, 600);
    const boxH = 150;
    const boxX = (width - boxW) / 2;
    const boxY = playHeight - boxH - 10;

    this.boxBg = this.add.graphics();
    this.boxBg.fillStyle(0x1d3557, 0.95);
    this.boxBg.lineStyle(3, 0xffb703, 1);
    this.boxBg.fillRoundedRect(boxX, boxY, boxW, boxH, 10);
    this.boxBg.strokeRoundedRect(boxX, boxY, boxW, boxH, 10);

    // Portrait (Left of box)
    this.portraitSprite = this.add.sprite(boxX + 45, boxY + 75, 'aloo-idle').setScale(3);

    // Speaker Name Text
    this.speakerText = this.add.text(boxX + 100, boxY + 15, '', {
      fontFamily: CONFIG.ui.fontFamily,
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#ffb703'
    });

    // Dialogue Body Text
    this.bodyText = this.add.text(boxX + 100, boxY + 45, '', {
      fontFamily: CONFIG.ui.fontFamily,
      fontSize: '13px',
      color: '#f1faee',
      wordWrap: { width: boxW - 120 }
    });

    // Press to skip prompt (Bottom right of box)
    this.promptText = this.add.text(boxX + boxW - 165, boxY + boxH - 20, 'SPACE / CLICK to skip', {
      fontFamily: CONFIG.ui.fontFamily,
      fontSize: '10px',
      color: '#a8dadc'
    }).setAlpha(0.7);

    // Flashing skip prompt
    this.tweens.add({
      targets: this.promptText,
      alpha: 0.2,
      duration: 600,
      yoyo: true,
      repeat: -1
    });

    // 2. Fetch dialog text queue based on key
    const heroName = this.registry.get('hero') === 'aloo' ? 'Aloo' : 'Bilahi';
    const partnerName = this.registry.get('partner') === 'aloo' ? 'Aloo' : 'Bilahi';

    if (this.dialogKey === 'intro') {
      this.dialogQueue = [
        {
          speaker: 'villain',
          text: `Mwahaha! I, Count Eggplant, have kidnapped ${partnerName}! They are locked inside my high Castle tower!`
        },
        {
          speaker: 'villain',
          text: `You stand no chance, you simple ${this.registry.get('hero') === 'aloo' ? 'spud' : 'tomato'}! Go back home!`
        },
        {
          speaker: 'system',
          text: `GAME TUTORIAL: Use Left (◀) and Right (▶) buttons to move, and tap JUMP to jump.`
        },
        {
          speaker: 'system',
          text: `GAME TUTORIAL: Hold Left/Right and press Jump to cross wide gaps. Touching enemies while jumping or falling will stomp and defeat them!`
        },
        {
          speaker: 'system',
          text: `GAME TUTORIAL: Eating all 5 Momos will trigger a fireworks celebration!`
        },
        {
          speaker: 'system',
          text: `GAME TUTORIAL: Collecting all 5 secret gifts unlocks a special page at the end!`
        }
      ];
    } else if (this.dialogKey === 'castle_end_reach') {
      this.dialogQueue = [
        {
          speaker: 'partner',
          text: `Help! Count Eggplant has locked my cage high up! There are three security switches hidden around this castle end!`
        },
        {
          speaker: 'partner',
          text: `They must be hidden on the high platforms or floor. You must find and hit all three to lower my cage to the ground!`
        },
        {
          speaker: 'hero',
          text: `Hang in there! I'll find those switches and get you down!`
        }
      ];
    } else if (this.dialogKey === 'boss_intro') {
      this.dialogQueue = [
        {
          speaker: 'villain',
          text: `Mwahaha! Welcome to the castle end, spud-face! Prepare for my rain of purple seed bombs!`
        },
        {
          speaker: 'hero',
          text: `I will hit those switches and stomp you with a super punch!`
        }
      ];
    } else if (this.dialogKey === 'cage_release') {
      this.dialogQueue = [
        {
          speaker: 'partner',
          text: `You found and hit all three hidden switches! The cage is lowering to the ground!`
        },
        {
          speaker: 'villain',
          text: `CURSES! You think you have won? Prepare for my special flying eggplant swoop! Dodge this!`
        }
      ];
    } else if (this.dialogKey === 'defeat') {
      this.dialogQueue = [
        {
          speaker: 'villain',
          text: `NOOOO! Defeated by a local garden salad ingredient?! I am spinning away!`
        },
        {
          speaker: 'hero',
          text: `I did it! Now I must rescue ${partnerName}!`
        }
      ];
    } else if (this.dialogKey === 'rescue_celebrate') {
      this.dialogQueue = [
        {
          speaker: 'partner',
          text: `Thanks for rescuing me ${heroName}, now we can finally cut the cake and celebrate the birthday!!`
        }
      ];
    }

    // 3. Click / Key triggers
    this.input.on('pointerdown', () => this.advanceDialog());
    this.input.keyboard?.on('keydown-SPACE', () => this.advanceDialog());
    this.input.keyboard?.on('keydown-ENTER', () => this.advanceDialog());

    // 4. Start first line
    this.showLine();
  }

  private showLine() {
    if (this.currentLineIndex >= this.dialogQueue.length) {
      this.endDialog();
      return;
    }

    // Stop current typing timer
    if (this.typingTimer) {
      this.typingTimer.destroy();
    }

    const currentLine = this.dialogQueue[this.currentLineIndex];
    this.fullText = currentLine.text;
    this.typedText = '';
    this.bodyText.setText('');

    // Setup portrait and names
    const heroType = this.registry.get('hero');
    const partnerType = this.registry.get('partner');
    
    const width = this.scale.width;
    const boxW = Math.min(width - 40, 600);
    const boxX = (width - boxW) / 2;

    if (currentLine.speaker === 'hero') {
      this.speakerText.setText(heroType === 'aloo' ? 'ALOO' : 'BILAHI');
      this.portraitSprite.setVisible(true).setTexture(`${heroType}-idle`);
      this.speakerText.setColor('#ffb703');
      this.speakerText.setX(boxX + 100);
      this.bodyText.setX(boxX + 100);
      this.bodyText.setStyle({
        wordWrap: { width: boxW - 120 },
        lineSpacing: 4
      });
    } else if (currentLine.speaker === 'partner') {
      this.speakerText.setText(partnerType === 'aloo' ? 'ALOO' : 'BILAHI');
      this.portraitSprite.setVisible(true).setTexture(`${partnerType}-idle`);
      this.speakerText.setColor('#ff7096');
      this.speakerText.setX(boxX + 100);
      this.bodyText.setX(boxX + 100);
      this.bodyText.setStyle({
        wordWrap: { width: boxW - 120 },
        lineSpacing: 4
      });
    } else if (currentLine.speaker === 'villain') {
      this.speakerText.setText('COUNT EGGPLANT (VILLAIN)');
      this.portraitSprite.setVisible(true).setTexture('villain');
      this.speakerText.setColor('#9d4edd');
      this.speakerText.setX(boxX + 100);
      this.bodyText.setX(boxX + 100);
      this.bodyText.setStyle({
        wordWrap: { width: boxW - 120 },
        lineSpacing: 4
      });
    } else {
      this.speakerText.setText('GAME TUTORIAL / INSTRUCTIONS');
      this.portraitSprite.setVisible(false);
      this.speakerText.setColor('#a8dadc');
      this.speakerText.setX(boxX + 25);
      this.bodyText.setX(boxX + 25);
      this.bodyText.setStyle({
        wordWrap: { width: boxW - 50 },
        lineSpacing: 4
      });
    }

    // Jump portrait slightly when starting to talk if visible
    if (this.portraitSprite.visible) {
      this.tweens.add({
        targets: this.portraitSprite,
        scaleY: 3.5,
        duration: 100,
        yoyo: true
      });
    }

    // Run text typing effect
    let charIndex = 0;
    this.typingTimer = this.time.addEvent({
      delay: 30,
      loop: true,
      callback: () => {
        if (charIndex < this.fullText.length) {
          this.typedText += this.fullText[charIndex];
          this.bodyText.setText(this.typedText);
          charIndex++;
          
          // Audio blip on letters (retro typewriter feel)
          if (charIndex % 3 === 0) {
            AudioSynth.playSwitch();
          }
        } else {
          this.typingTimer?.destroy();
        }
      }
    });
  }

  private advanceDialog() {
    // If text is still typing, skip to the full text immediately
    if (this.typedText.length < this.fullText.length) {
      if (this.typingTimer) this.typingTimer.destroy();
      this.typedText = this.fullText;
      this.bodyText.setText(this.fullText);
    } else {
      // Go to next line
      this.currentLineIndex++;
      this.showLine();
    }
  }

  private endDialog() {
    // Stop Dialogue Scene and Resume Game Scene
    this.scene.stop('DialogueScene');
    this.scene.resume('GameScene');

    // Trigger gameplay reaction events
    if (this.dialogKey === 'rescue_celebrate') {
      // Transition directly to the ending scene!
      this.parentScene.scene.stop('UIScene');
      this.parentScene.scene.start('EndingScene');
    }
  }
}
export default DialogueScene;
