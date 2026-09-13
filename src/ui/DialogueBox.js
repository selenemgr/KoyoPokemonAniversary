import Phaser from "phaser";

const FONT = "\"Press Start 2P\"";

export default class DialogueBox {
  constructor(scene, { width = null, height = 110 } = {}) {
    this.scene = scene;
    const cam = scene.cameras.main;
    this.width = width || cam.width - 32;
    this.height = height;
    this.x = 16;
    this.y = cam.height - height - 16;

    this.container = scene.add.container(0, 0).setScrollFactor(0).setDepth(1000);

    this.bg = scene.add.rectangle(this.x, this.y, this.width, this.height, 0xf8f8f0, 1)
      .setOrigin(0, 0)
      .setStrokeStyle(4, 0x303848);

    this.text = scene.add.text(this.x + 20, this.y + 18, "", {
      fontFamily: FONT,
      fontSize: "14px",
      color: "#202028",
      wordWrap: { width: this.width - 40 },
      lineSpacing: 10
    });

    this.prompt = scene.add.text(this.x + this.width - 26, this.y + this.height - 24, "▼", {
      fontFamily: FONT,
      fontSize: "14px",
      color: "#202028"
    });

    this.container.add([this.bg, this.text, this.prompt]);
    this.container.setVisible(false);
    this.queue = [];
    this.onDone = null;
    this.typing = false;
    this.currentLine = "";
    this.charIndex = 0;

    this.scene.input.on("pointerdown", () => this.advance());
    this.advanceKey = scene.input.keyboard?.addKey("SPACE");
  }

  isVisible() {
    return this.container.visible;
  }

  showLines(lines, onDone = null) {
    this.queue = Array.isArray(lines) ? [...lines] : [lines];
    this.onDone = onDone;
    this.container.setVisible(true);
    this._nextLine();
  }

  _nextLine() {
    if (this.queue.length === 0) {
      this.container.setVisible(false);
      const cb = this.onDone;
      this.onDone = null;
      if (cb) cb();
      return;
    }
    this.currentLine = this.queue.shift();
    this.charIndex = 0;
    this.text.setText("");
    this.typing = true;
    this.prompt.setVisible(false);
    if (this._timer) this._timer.remove();
    this._timer = this.scene.time.addEvent({
      delay: 18,
      loop: true,
      callback: () => {
        this.charIndex++;
        this.text.setText(this.currentLine.slice(0, this.charIndex));
        if (this.charIndex >= this.currentLine.length) {
          this.typing = false;
          this.prompt.setVisible(true);
          this._timer.remove();
        }
      }
    });
  }

  advance() {
    if (!this.container.visible) return;
    if (this.typing) {
      this._timer?.remove();
      this.text.setText(this.currentLine);
      this.typing = false;
      this.prompt.setVisible(true);
      return;
    }
    this._nextLine();
  }

  update() {
    if (!this.container.visible) return;
    if (this.advanceKey && Phaser.Input.Keyboard.JustDown(this.advanceKey)) {
      this.advance();
    }
  }

  destroy() {
    this._timer?.remove();
    this.container.destroy();
  }
}
