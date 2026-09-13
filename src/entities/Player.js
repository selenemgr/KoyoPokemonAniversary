import Phaser from "phaser";

const SPEED = 200;

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, textureKey, displaySize = 56) {
    super(scene, x, y, textureKey);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDisplaySize(displaySize, displaySize);
    // Arcade bodies are specified in the sprite's native (pre-scale) pixel
    // space; Phaser multiplies by the current scale (set above) each step,
    // so this ends up matching the display size regardless of native res.
    this.body.setCircle(this.width / 2, 0, 0);
    this.body.setCollideWorldBounds(true);

    this.locked = false;
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });
  }

  setLocked(locked) {
    this.locked = locked;
    if (locked) this.body.setVelocity(0, 0);
  }

  update() {
    if (this.locked) return;

    const left = this.cursors.left.isDown || this.wasd.left.isDown;
    const right = this.cursors.right.isDown || this.wasd.right.isDown;
    const up = this.cursors.up.isDown || this.wasd.up.isDown;
    const down = this.cursors.down.isDown || this.wasd.down.isDown;

    let vx = 0, vy = 0;
    if (left) vx = -1;
    else if (right) vx = 1;
    if (up) vy = -1;
    else if (down) vy = 1;

    if (vx !== 0 && vy !== 0) {
      const norm = Math.SQRT1_2;
      vx *= norm; vy *= norm;
    }

    this.body.setVelocity(vx * SPEED, vy * SPEED);

    if (vx < 0) this.setFlipX(true);
    else if (vx > 0) this.setFlipX(false);
  }
}
