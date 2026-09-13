import Phaser from "phaser";

const FONT = "\"Press Start 2P\"";
const WIDTH = 280;
const MIN_HEIGHT = 90;
const PADDING = 40; // top+bottom padding around the wrapped text block

export default class SpeechBubble {
  constructor(scene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0).setDepth(1500);
    this.container.setVisible(false);

    this.bg = scene.add.graphics();
    this.text = scene.add.text(0, 0, "", {
      fontFamily: FONT, fontSize: "10px", color: "#202028",
      wordWrap: { width: WIDTH - 28 }, lineSpacing: 6
    });
    this.prompt = scene.add.text(0, 0, "▼", {
      fontFamily: FONT, fontSize: "10px", color: "#202028"
    });
    this.container.add([this.bg, this.text, this.prompt]);

    this.queue = [];
    this.onDone = null;
    this.typing = false;
    this.currentLine = "";
    this.charIndex = 0;
    this.anchorX = 0;
    this.anchorY = 0;

    scene.input.on("pointerdown", () => this.advance());
    this.advanceKey = scene.input.keyboard.addKey("SPACE");
  }

  isVisible() {
    return this.container.visible;
  }

  show(x, y, lines, onDone = null) {
    this.anchorX = x;
    this.anchorY = y;
    this.queue = Array.isArray(lines) ? [...lines] : [lines];
    this.onDone = onDone;
    this.container.setVisible(true);
    this._nextLine();
  }

  _drawBubble(h) {
    const w = WIDTH;
    this.bg.clear();
    this.bg.fillStyle(0xfaf8f0, 0.97);
    this.bg.lineStyle(3, 0x202028, 1);
    this.bg.fillRoundedRect(-w / 2, -h, w, h, 12);
    this.bg.strokeRoundedRect(-w / 2, -h, w, h, 12);
    this.bg.fillStyle(0xfaf8f0, 0.97);
    this.bg.fillTriangle(-12, 0, 12, 0, 0, 16);
    this.bg.lineStyle(3, 0x202028, 1);
    this.bg.lineBetween(-12, 0, 0, 16);
    this.bg.lineBetween(12, 0, 0, 16);
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
    this.typing = true;
    this.prompt.setVisible(false);

    // Measure the full line wrapped at this width first, so the box is sized
    // to fit before the typewriter reveal starts (wrapping depends on full
    // content, not the partially-revealed text).
    this.text.setText(this.currentLine);
    const boxHeight = Math.max(MIN_HEIGHT, this.text.height + PADDING);
    this.text.setText("");

    this.container.setPosition(this.anchorX, this.anchorY);
    this._drawBubble(boxHeight);
    this.text.setPosition(-WIDTH / 2 + 14, -boxHeight + 14);
    this.prompt.setPosition(WIDTH / 2 - 22, -20);

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
