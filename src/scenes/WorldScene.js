import Phaser from "phaser";
import Player from "../entities/Player.js";
import DialogueBox from "../ui/DialogueBox.js";
import BadgePopup from "../ui/BadgePopup.js";
import LetterPopup from "../ui/LetterPopup.js";
import { state, events, AREA_COUNT, getArea, defeatArea, healParty } from "../state/gameState.js";
import { createBattler } from "../battle/battleLogic.js";
import { playMusic } from "../audio/musicManager.js";

import area1PreBattle from "../content/bubbles/area1-prebattle.json";
import area2PreBattle from "../content/bubbles/area2-prebattle.json";
import area3PreBattle from "../content/bubbles/area3-prebattle.json";
import area4PreBattle from "../content/bubbles/area4-prebattle.json";
import area1Victory from "../content/bubbles/area1-victory.json";
import area2Victory from "../content/bubbles/area2-victory.json";
import area3Victory from "../content/bubbles/area3-victory.json";
import area4Victory from "../content/bubbles/area4-victory.json";
import area4Letter from "../content/bubbles/area4-letter.json";

const PRE_BATTLE_TEXTS = { 1: area1PreBattle, 2: area2PreBattle, 3: area3PreBattle, 4: area4PreBattle };
const VICTORY_TEXTS = { 1: area1Victory, 2: area2Victory, 3: area3Victory, 4: area4Victory };
const BADGE_FILES = { 1: "1.jpeg", 2: "2.jpeg", 3: "3.jpeg" }; // area 4 doesn't use a badge (final boss goes straight to the letter)

// Per-area trainer sprite layout. `spread` is the horizontal half-distance
// between the two portraits (ignored when only one sprite is shown);
// `centerOffsetX`/`yOffset` nudge the whole pair away from screen-center;
// `sprites` picks which of koyo/selu actually appear for that area.
const AREA_CONFIG = {
  1: { yOffset: 25, centerOffsetX: 0, spread: 60, sizeW: 90, sizeH: 180, sprites: ["koyo", "selu"] },
  2: { yOffset: 80, centerOffsetX: -100, spread: 35, sizeW: 120, sizeH: 140, sprites: ["koyo", "selu"] },
  3: { yOffset: 30, centerOffsetX: -150, spread: 35, sizeW: 120, sizeH: 140, sprites: ["koyo", "selu"] },
  4: { yOffset: 150, centerOffsetX: 10, spread: 0, sizeW: 120, sizeH: 120, sprites: ["selu"] }
};

// Area 4's lone trainer is the final boss - a fixed team instead of the usual random pair.
const FINAL_BOSS_TEAM = ["gardevoir", "diancie", "whimsicott"];

const PLAYER_NAME = "Koyo";

export default class WorldScene extends Phaser.Scene {
  constructor() {
    super("WorldScene");
  }

  preload() {
    const n = state.currentArea;
    const cfg = AREA_CONFIG[n];
    this.load.image(`area-bg-${n}`, `/assets/area-backgrounds/${n}-bg.png`);
    if (cfg.sprites.includes("koyo")) this.load.image(`koyo-${n}`, `/assets/seyo/${n}-KoyoSprite.png`);
    if (cfg.sprites.includes("selu")) this.load.image(`selu-${n}`, `/assets/seyo/${n}-SeluSprite.png`);
    if (!this.textures.exists("koyo-player")) {
      this.load.image("koyo-player", "/assets/seyo/4-KoyoSprite.png");
    }
    const badgeFile = BADGE_FILES[n];
    if (badgeFile && !this.textures.exists(`badge-${n}`)) {
      this.load.image(`badge-${n}`, `/assets/badges/${badgeFile}`);
    }
    if (!this.cache.audio.exists("music-normal")) {
      this.load.audio("music-normal", "/assets/music/Normal.mp3");
    }
    if (!this.cache.audio.exists("music-letterend")) {
      this.load.audio("music-letterend", "/assets/music/LetterEnd.mp3");
    }
  }

  create() {
    const n = state.currentArea;
    const cfg = AREA_CONFIG[n];
    const w = this.scale.width, h = this.scale.height;

    this.battleActive = false;
    this.areaCleared = false;

    this.cameras.main.fadeIn(400, 0, 0, 0);
    this.physics.world.setBounds(0, 0, w, h);
    playMusic(this, "music-normal");

    // Crop keeps 85% of the square source's height (vs. the exact-4:3 75%),
    // so less of the photo is lost - the leftover ~13% aspect gap becomes a
    // small, largely unnoticeable horizontal stretch instead of visible bars.
    this.add.image(0, 0, `area-bg-${n}`)
      .setOrigin(0, 0)
      .setCrop(0, 77, 1024, 870)
      .setDisplaySize(w, h)
      .setDepth(-10);
    this.add.rectangle(0, 0, w, h, 0x000000, 0.15).setOrigin(0, 0).setDepth(-9);

    const pairX = w / 2 + cfg.centerOffsetX, pairY = 190 + cfg.yOffset;
    const single = cfg.sprites.length === 1;

    this.koyoTrainer = null;
    this.seluTrainer = null;
    if (cfg.sprites.includes("koyo")) {
      const x = single ? pairX : pairX - cfg.spread;
      this.koyoTrainer = this.add.image(x, pairY, `koyo-${n}`).setDisplaySize(cfg.sizeW, cfg.sizeH).setDepth(10);
    }
    if (cfg.sprites.includes("selu")) {
      const x = single ? pairX : pairX + cfg.spread;
      this.seluTrainer = this.add.image(x, pairY, `selu-${n}`).setDisplaySize(cfg.sizeW, cfg.sizeH).setDepth(10);
    }

    // Single invisible overlap trigger covering whichever portrait(s) are
    // shown - only one battle happens for the pair, regardless of which side
    // the player approaches from.
    const zoneWidth = single ? cfg.sizeW + 60 : cfg.spread * 2 + cfg.sizeW + 40;
    const zoneHeight = cfg.sizeH + 60;
    this.triggerZone = this.add.zone(pairX, pairY, zoneWidth, zoneHeight);
    this.physics.add.existing(this.triggerZone);
    this.triggerZone.body.setAllowGravity(false);
    this.triggerZone.body.moves = false;

    this.player = new Player(this, w / 2, h - 100, "koyo-player", 120);
    this.physics.add.overlap(this.player, this.triggerZone, () => this.tryStartBattle());

    this.playerNameplate = this.add.text(this.player.x, this.player.y - 74, PLAYER_NAME, {
      fontFamily: "\"Press Start 2P\"", fontSize: "9px", color: "#ffffff",
      stroke: "#000000", strokeThickness: 3
    }).setOrigin(0.5).setDepth(11);

    this.dialogue = new DialogueBox(this);
    this.badgePopup = new BadgePopup(this);
    this.letterPopup = new LetterPopup(this);

    // gameState's event emitter is a module-level singleton that outlives any
    // single WorldScene instance (this scene restarts once per area), so drop
    // any listener from a previous instance before adding this one's.
    events.off("battle-won");
    events.off("battle-lost");
    events.on("battle-won", ({ areaId }) => this.onAreaCleared(areaId));
    events.on("battle-lost", () => this.onAreaLost());
  }

  tryStartBattle() {
    if (this.battleActive || this.areaCleared) return;
    this.battleActive = true;
    this.player.setLocked(true);

    const areaId = state.currentArea;
    this.dialogue.showLines(PRE_BATTLE_TEXTS[areaId], () => {
      const teamKeys = areaId === AREA_COUNT ? FINAL_BOSS_TEAM : getArea(areaId).team;
      const enemyTeam = teamKeys.map((k) => createBattler(k));
      healParty();

      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene.pause("WorldScene");
        this.scene.launch("BattleScene", {
          enemyTeam,
          trainerName: PLAYER_NAME,
          areaId
        });
      });
    });
  }

  onAreaCleared(areaId) {
    this.scene.stop("BattleScene");
    this.scene.resume("WorldScene");
    this.cameras.main.fadeIn(300, 0, 0, 0);
    this.areaCleared = true;

    defeatArea(areaId);
    if (this.koyoTrainer) this.koyoTrainer.setTint(0x888888);
    if (this.seluTrainer) this.seluTrainer.setTint(0x888888);

    const isLastArea = areaId >= AREA_COUNT;
    if (isLastArea) {
      playMusic(this, "music-letterend"); // plays from here through the end screen
    } else {
      playMusic(this, "music-normal");
    }

    const afterBadge = () => {
      this.dialogue.showLines(VICTORY_TEXTS[areaId], () => {
        if (isLastArea) {
          this.letterPopup.play(area4Letter, () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
              this.scene.start("EndScene");
            });
          });
        } else {
          this.cameras.main.fadeOut(400, 0, 0, 0);
          this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            state.currentArea = areaId + 1;
            this.scene.restart();
          });
        }
      });
    };

    if (isLastArea) {
      afterBadge();
    } else {
      const badgeKey = this.textures.exists(`badge-${areaId}`) ? `badge-${areaId}` : null;
      this.badgePopup.play(afterBadge, badgeKey);
    }
  }

  onAreaLost() {
    this.scene.stop("BattleScene");
    healParty();
    this.scene.resume("WorldScene");
    this.cameras.main.fadeIn(300, 0, 0, 0);
    playMusic(this, "music-normal");
    this.player.y -= 80;
    this.battleActive = false;
    this.player.setLocked(false);
  }

  update() {
    this.player.update();
    this.playerNameplate.setPosition(this.player.x, this.player.y - 74);
    this.dialogue.update();
    this.letterPopup.update();
  }
}
