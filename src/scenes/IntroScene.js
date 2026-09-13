import Phaser from "phaser";
import SpeechBubble from "../ui/SpeechBubble.js";
import DialogueBox from "../ui/DialogueBox.js";
import { playMusic } from "../audio/musicManager.js";
import introLines from "../content/bubbles/intro.json";
import introText from "../content/bubbles/intro-text.json";

export default class IntroScene extends Phaser.Scene {
  constructor() {
    super("IntroScene");
  }

  preload() {
    if (!this.textures.exists("koyo-player")) {
      this.load.image("koyo-player", "/assets/seyo/4-KoyoSprite.png");
    }
    if (!this.cache.audio.exists("music-memories")) {
      this.load.audio("music-memories", "/assets/music/Memories.mp3");
    }
  }

  create() {
    const w = this.scale.width, h = this.scale.height;
    this.cameras.main.fadeIn(400, 0, 0, 0);
    playMusic(this, "music-memories"); // already playing from StartScene - this is a no-op continuation

    this.add.rectangle(0, 0, w, h, 0x101014).setOrigin(0, 0);
    this.add.image(w / 2, h / 2 + 20, "koyo-player").setDisplaySize(150, 150);

    this.bubble = new SpeechBubble(this);
    this.dialogue = new DialogueBox(this);

    this.bubble.show(w / 2, h / 2 - 70, introLines, () => {
      this.dialogue.showLines(introText, () => {
        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
          this.scene.start("WorldScene");
        });
      });
    });
  }

  update() {
    this.bubble.update();
    this.dialogue.update();
  }
}
