import Phaser from "phaser";

const FONT = "\"Press Start 2P\"";

export default class BadgePopup {
  constructor(scene) {
    this.scene = scene;
    this._ensureStarTexture();
  }

  _ensureStarTexture() {
    if (this.scene.textures.exists("medal-star")) return;
    const g = this.scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xfff6c8, 1);
    const cx = 8, cy = 8, spikes = 5, outerR = 8, innerR = 3.2;
    let rot = (Math.PI / 2) * 3;
    const step = Math.PI / spikes;
    g.beginPath();
    g.moveTo(cx, cy - outerR);
    for (let i = 0; i < spikes; i++) {
      let x = cx + Math.cos(rot) * outerR;
      let y = cy + Math.sin(rot) * outerR;
      g.lineTo(x, y);
      rot += step;
      x = cx + Math.cos(rot) * innerR;
      y = cy + Math.sin(rot) * innerR;
      g.lineTo(x, y);
      rot += step;
    }
    g.closePath();
    g.fillPath();
    g.generateTexture("medal-star", 16, 16);
    g.destroy();
  }

  play(onComplete, badgeTextureKey = null) {
    const scene = this.scene;
    const w = scene.scale.width, h = scene.scale.height;
    const cx = w / 2, cy = h / 2;

    const container = scene.add.container(cx, cy).setDepth(2000).setScrollFactor(0);

    const dim = scene.add.rectangle(0, 0, w, h, 0x000000, 0.55).setOrigin(0.5);
    container.add(dim);

    const burst = scene.add.container(0, 0);
    for (let i = 0; i < 8; i++) {
      const ray = scene.add.rectangle(0, 0, 16, 260, 0xfff2a8, 0.35).setOrigin(0.5, 0.5);
      ray.setAngle((360 / 8) * i);
      burst.add(ray);
    }
    container.add(burst);
    scene.tweens.add({ targets: burst, angle: 360, duration: 4000, repeat: -1, ease: "Linear" });

    const emitter = scene.add.particles(0, 0, "medal-star", {
      speed: { min: 60, max: 190 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.5, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 850,
      quantity: 2,
      frequency: 35,
      blendMode: "ADD"
    });
    container.add(emitter);

    const badge = scene.add.container(0, 0).setScale(0.01);
    if (badgeTextureKey) {
      const BOX_W = 500, BOX_H = 540;
      const portrait = scene.add.image(0, 0, badgeTextureKey);
      // Contain-fit: scale down uniformly so the whole photo fits inside the
      // box with no cropping and no stretching.
      const fitScale = Math.min(BOX_W / portrait.width, BOX_H / portrait.height);
      portrait.setScale(fitScale);
      badge.add(portrait);
    } else {
      const ring = scene.add.circle(0, 0, 60, 0xd4af37, 1).setStrokeStyle(6, 0x7a5c15);
      const inner = scene.add.circle(0, 0, 46, 0xf4d873, 1).setStrokeStyle(3, 0xd4af37);
      const star = scene.add.text(0, -8, "★", {
        fontFamily: FONT, fontSize: "40px", color: "#7a5c15"
      }).setOrigin(0.5);
      badge.add([ring, inner, star]);
    }
    container.add(badge);

    const hint = scene.add.text(0, 278, "Haz clic o presiona Espacio para continuar", {
      fontFamily: FONT, fontSize: "9px", color: "#ffffffcc"
    }).setOrigin(0.5).setAlpha(0);
    container.add(hint);

    scene.tweens.add({
      targets: badge, scale: 1, duration: 500, ease: "Back.Out",
      onComplete: () => {
        scene.tweens.add({ targets: hint, alpha: 1, duration: 200 });
      }
    });

    let dismissed = false;
    const dismiss = () => {
      if (dismissed) return;
      dismissed = true;
      emitter.stop();
      scene.tweens.add({
        targets: container,
        alpha: 0,
        duration: 300,
        onComplete: () => {
          container.destroy();
          if (onComplete) onComplete();
        }
      });
    };

    scene.input.once("pointerdown", dismiss);
    scene.input.keyboard.addKey("SPACE").once("down", dismiss);
  }
}
