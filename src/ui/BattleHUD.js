import Phaser from "phaser";

const FONT = "\"Press Start 2P\"";

export default class BattleHUD {
  constructor(scene, x, y, { width = 220, showHpNumbers = false } = {}) {
    this.scene = scene;
    this.width = width;
    this.showHpNumbers = showHpNumbers;
    const height = 62;

    this.container = scene.add.container(x, y).setDepth(900);

    const panel = scene.add.rectangle(0, 0, width, height, 0xf0f0e0, 0.95)
      .setOrigin(0, 0)
      .setStrokeStyle(3, 0x303848);

    this.nameText = scene.add.text(10, 6, "", {
      fontFamily: FONT, fontSize: "13px", color: "#202028"
    });

    this.lvText = scene.add.text(width - 46, 6, "", {
      fontFamily: FONT, fontSize: "11px", color: "#202028"
    });

    this.hpBarBg = scene.add.rectangle(10, 32, width - 20, 12, 0xa0a0a0).setOrigin(0, 0);
    this.hpBar = scene.add.rectangle(11, 33, width - 22, 10, 0x48d848).setOrigin(0, 0);

    this.hpText = scene.add.text(10, 46, "", {
      fontFamily: FONT, fontSize: "9px", color: "#202028"
    });

    this.container.add([panel, this.nameText, this.lvText, this.hpBarBg, this.hpBar, this.hpText]);
  }

  update(battler) {
    this.nameText.setText(battler.name);
    this.lvText.setText(`Nv${battler.level}`);
    const frac = Phaser.Math.Clamp(battler.hp / battler.maxHp, 0, 1);
    const maxWidth = this.width - 22;
    this.hpBar.width = Math.max(0, maxWidth * frac);
    this.hpBar.fillColor = frac > 0.5 ? 0x48d848 : frac > 0.2 ? 0xf8d800 : 0xf83800;
    this.hpText.setText(this.showHpNumbers ? `${battler.hp}/${battler.maxHp}` : "");
  }

  destroy() {
    this.container.destroy();
  }
}
