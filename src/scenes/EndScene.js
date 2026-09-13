import Phaser from "phaser";
import { resetGame } from "../state/gameState.js";

const FONT = "\"Press Start 2P\"";

export default class EndScene extends Phaser.Scene {
  constructor() {
    super("EndScene");
  }

  preload() {
    this.load.image("final-bg", "assets/final-image/1.jpeg");
  }

  create() {
    const w = this.scale.width, h = this.scale.height;
    this.cameras.main.fadeIn(500, 0, 0, 0);

    this.add.image(0, 0, "final-bg")
      .setOrigin(0, 0)
      .setCrop(153, 0, 1741, 1152)
      .setDisplaySize(w, h)
      .setDepth(-10);
    this.add.rectangle(0, 0, w, h, 0x000000, 0.35).setOrigin(0, 0).setDepth(-9);

    this.add.text(w / 2, h / 2 - 40, "FIN", {
      fontFamily: FONT, fontSize: "40px", color: "#f8d800", stroke: "#000000", strokeThickness: 6
    }).setOrigin(0.5);

    this.add.text(w / 2, h / 2 + 20, "Te amo hermoso mio.", {
      fontFamily: FONT, fontSize: "12px", color: "#ffffff", stroke: "#000000", strokeThickness: 4
    }).setOrigin(0.5);

    const restart = this.add.text(w / 2, h / 2 + 80, "[ Reiniciar ]", {
      fontFamily: FONT, fontSize: "16px", color: "#88ff88", stroke: "#000000", strokeThickness: 4
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    restart.on("pointerdown", () => {
      resetGame();
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene.start("StartScene");
      });
    });
  }
}
