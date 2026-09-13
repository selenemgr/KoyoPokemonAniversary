import Phaser from "phaser";
import { playMusic } from "../audio/musicManager.js";

const FONT = "\"Press Start 2P\"";

export default class StartScene extends Phaser.Scene {
  constructor() {
    super("StartScene");
  }

  preload() {
    this.load.image("start-bg", "assets/start-image/1.jpeg");
    if (!this.cache.audio.exists("music-memories")) {
      this.load.audio("music-memories", "assets/music/Memories.mp3");
    }
  }

  create() {
    const w = this.scale.width, h = this.scale.height;
    playMusic(this, "music-memories");

    const bg = this.add.image(0, 0, "start-bg")
      .setOrigin(0, 0)
      .setCrop(0, 130, 1742, 1481)
      .setDisplaySize(w, h)
      .setAlpha(0.4);
    try {
      bg.postFX?.addBlur(0, 2, 2, 2);
    } catch (e) {
      // FX pipeline unavailable in this environment - low opacity alone still reads fine.
    }

    this.add.rectangle(0, 0, w, h, 0x000000, 0.2).setOrigin(0, 0);

    this.add.text(w / 2, h / 2 - 80, "Memories", {
      fontFamily: FONT, fontSize: "44px", color: "#ffffff", stroke: "#000000", strokeThickness: 6
    }).setOrigin(0.5);

    const startBtn = this.add.text(w / 2, h / 2 + 60, "[ EMPEZAR ]", {
      fontFamily: FONT, fontSize: "20px", color: "#88ff88", stroke: "#000000", strokeThickness: 4
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    startBtn.on("pointerover", () => startBtn.setColor("#c8ffc8"));
    startBtn.on("pointerout", () => startBtn.setColor("#88ff88"));
    startBtn.on("pointerdown", () => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene.start("IntroScene");
      });
    });
  }
}
