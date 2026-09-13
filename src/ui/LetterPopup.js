import Phaser from "phaser";

const FONT = "\"Press Start 2P\"";

export default class LetterPopup {
  constructor(scene) {
    this.scene = scene;
    const w = scene.scale.width, h = scene.scale.height;

    this.container = scene.add.container(0, 0).setDepth(2500);
    this.container.setVisible(false);

    const boxW = 520, boxH = 380;
    const boxX = (w - boxW) / 2, boxY = (h - boxH) / 2;

    this.maxTextWidth = boxW - 56;
    this.maxTextHeight = boxH - 78; // leaves room for top padding + the continue prompt

    const dim = scene.add.rectangle(0, 0, w, h, 0x000000, 0.6).setOrigin(0, 0);
    const paper = scene.add.rectangle(boxX, boxY, boxW, boxH, 0xf5edd8, 1).setOrigin(0, 0).setStrokeStyle(4, 0x7a5c3a);

    this.text = scene.add.text(boxX + 28, boxY + 28, "", {
      fontFamily: FONT, fontSize: "11px", color: "#3a2f1e",
      wordWrap: { width: this.maxTextWidth }, lineSpacing: 8
    });
    this.prompt = scene.add.text(boxX + boxW - 30, boxY + boxH - 26, "▼", {
      fontFamily: FONT, fontSize: "10px", color: "#3a2f1e"
    });

    this.container.add([dim, paper, this.text, this.prompt]);

    this.queue = [];
    this.onDone = null;
    this.typing = false;
    this.currentLine = "";
    this.charIndex = 0;

    this._suppressNextClick = false;
    scene.input.on("pointerdown", () => {
      // play() can be called synchronously from inside another UI element's
      // own pointerdown handler on this same scene (e.g. the victory dialogue
      // dismissing itself and immediately opening the letter) - Phaser still
      // delivers that same click to this already-registered listener within
      // the same dispatch, which would otherwise skip page 1's typewriter.
      if (this._suppressNextClick) { this._suppressNextClick = false; return; }
      this.advance();
    });
    this.advanceKey = scene.input.keyboard.addKey("SPACE");
  }

  isVisible() {
    return this.container.visible;
  }

  play(lines, onDone = null) {
    this.queue = Array.isArray(lines) ? [...lines] : [lines];
    this.onDone = onDone;
    this.container.setVisible(true);
    this._suppressNextClick = true;
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
    this.typing = true;
    this.prompt.setVisible(false);

    // Shrink the font until the full page fits the letter's fixed size,
    // rather than letting long placeholder/real text spill past the paper.
    let fontSize = 11;
    const minFontSize = 6;
    this.text.setText(this.currentLine);
    while (fontSize > minFontSize) {
      this.text.setFontSize(fontSize);
      if (this.text.height <= this.maxTextHeight) break;
      fontSize -= 1;
    }
    this.text.setText("");

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
