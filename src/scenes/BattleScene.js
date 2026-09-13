import Phaser from "phaser";
import DialogueBox from "../ui/DialogueBox.js";
import BattleHUD from "../ui/BattleHUD.js";
import { state, events, isPartyWiped } from "../state/gameState.js";
import { frontSpriteUrl, backSpriteUrl } from "../data/pokedex.js";
import { applyMove, pickAiMove, isFainted } from "../battle/battleLogic.js";
import { playMusic } from "../audio/musicManager.js";

const FONT = "\"Press Start 2P\"";

const TYPE_COLORS = {
  Normal: 0xa8a878,
  Fire: 0xf08030,
  Water: 0x6890f0,
  Electric: 0xf8d030,
  Grass: 0x78c850,
  Ice: 0x98d8d8,
  Fighting: 0xe08830,
  Poison: 0xa040a0,
  Ground: 0xe0c068,
  Flying: 0xa890f0,
  Psychic: 0xf85888,
  Bug: 0xa8b820,
  Rock: 0xb8a038,
  Ghost: 0x705898,
  Dragon: 0x7038f8,
  Dark: 0x705848,
  Steel: 0xb8b8d0,
  Fairy: 0xee99ee
};

function nextAliveIndex(team, fromIndex) {
  for (let i = fromIndex; i < team.length; i++) {
    if (!isFainted(team[i])) return i;
  }
  return -1;
}

export default class BattleScene extends Phaser.Scene {
  constructor() {
    super("BattleScene");
  }

  init(data) {
    this.enemyTeam = data.enemyTeam;
    this.trainerName = data.trainerName;
    this.areaId = data.areaId;
    this.playerTeam = state.party;
    this.playerIndex = nextAliveIndex(this.playerTeam, 0);
    this.enemyIndex = nextAliveIndex(this.enemyTeam, 0);
    this.locked = false;
  }

  preload() {
    const ids = new Set();
    this.enemyTeam.forEach((m) => ids.add(m.id));
    this.playerTeam.forEach((m) => ids.add(m.id));
    ids.forEach((id) => {
      const fk = `mon-front-${id}`;
      const bk = `mon-back-${id}`;
      if (!this.textures.exists(fk)) this.load.image(fk, frontSpriteUrl(id));
      if (!this.textures.exists(bk)) this.load.image(bk, backSpriteUrl(id));
    });
    if (!this.cache.audio.exists("music-battle")) {
      this.load.audio("music-battle", "assets/music/Battle.mp3");
    }
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;
    playMusic(this, "music-battle");

    // Battle backdrop is a blurred, dimmed version of the area you're standing
    // in - that texture was already loaded by WorldScene and Phaser's texture
    // cache is global across scenes, so it's available here with no reload.
    const areaBgKey = `area-bg-${this.areaId}`;
    if (this.textures.exists(areaBgKey)) {
      const bg = this.add.image(0, 0, areaBgKey)
        .setOrigin(0, 0)
        .setCrop(0, 77, 1024, 870)
        .setDisplaySize(w, h)
        .setDepth(-20);
      try {
        bg.postFX?.addBlur(0, 2, 2, 2);
      } catch (e) {
        // FX pipeline unavailable - the dim overlay below still reads fine alone.
      }
      this.add.rectangle(0, 0, w, h, 0x000000, 0.4).setOrigin(0, 0).setDepth(-19);
      this.add.ellipse(600, 240, 220, 90, 0xffffff, 0.18).setDepth(-10);
      this.add.ellipse(190, 250, 260, 100, 0xffffff, 0.18).setDepth(-10);
    } else {
      this.add.rectangle(0, 0, w, h, 0xdfead0).setOrigin(0, 0).setDepth(-20);
      this.add.ellipse(600, 240, 220, 90, 0xbfd6a5).setDepth(-10);
      this.add.ellipse(190, 250, 260, 100, 0xa8c890).setDepth(-10);
    }

    this.enemySprite = this.add.image(600, 190, `mon-front-${this.enemyTeam[this.enemyIndex].id}`).setScale(2.2);
    this.playerSprite = this.add.image(190, 200, `mon-back-${this.playerTeam[this.playerIndex].id}`).setScale(2.4);

    this.enemyHud = new BattleHUD(this, w - 300, 30, { width: 260 });
    this.playerHud = new BattleHUD(this, 40, h - 250, { width: 260, showHpNumbers: true });
    this.refreshHuds();

    this.dialogue = new DialogueBox(this, { height: 110 });

    this.buildCommandMenu();
    this.buildMoveMenu();
    this.buildPartyMenu();
    this.hideMoveMenu();
    this.hidePartyMenu();

    this.commandCursor = 0;
    this.moveCursor = 0;
    this.partyCursor = 0;
    this.forcedSwitch = false;
    this.pendingSwitchDone = null;
    this.navKeys = this.input.keyboard.createCursorKeys();
    this.confirmKey = this.input.keyboard.addKey("SPACE");
    this.backKey = this.input.keyboard.addKey("BACKSPACE");

    this.dialogue.showLines([`¡${this.trainerName} envía a ${this.enemyTeam[this.enemyIndex].name}!`, `¡Adelante, ${this.playerTeam[this.playerIndex].name}!`], () => {
      this.showCommandMenu();
    });
  }

  refreshHuds() {
    this.enemyHud.update(this.enemyTeam[this.enemyIndex]);
    this.playerHud.update(this.playerTeam[this.playerIndex]);
  }

  buildCommandMenu() {
    const w = this.scale.width, h = this.scale.height;
    const labels = ["LUCHAR", "POKÉMON"];
    const panelX = w - 260, panelY = h - 118, bw = 228, bh = 44;
    this.commandContainer = this.add.container(0, 0).setDepth(1001);
    const bg = this.add.rectangle(panelX - 16, panelY - 8, 260, 110, 0xf0f0e0, 1).setOrigin(0, 0).setStrokeStyle(4, 0x303848);
    this.commandContainer.add(bg);
    this.commandEntries = [];
    labels.forEach((label, i) => {
      const bx = panelX;
      const by = panelY + i * (bh + 8);
      const box = this.add.rectangle(bx, by, bw, bh, 0xffffff, 0).setOrigin(0, 0)
        .setStrokeStyle(2, 0x606870).setInteractive({ useHandCursor: true });
      const txt = this.add.text(bx + 14, by + 14, label, {
        fontFamily: FONT, fontSize: "13px", color: "#202028"
      });
      box.on("pointerdown", () => { this.commandCursor = i; this.onCommand(label); });
      this.commandContainer.add([box, txt]);
      this.commandEntries.push({ box, label });
    });
  }

  buildMoveMenu() {
    const w = this.scale.width, h = this.scale.height;
    const panelX = w - 260, panelY = h - 198;
    this.moveContainer = this.add.container(0, 0).setDepth(1001);
    const bg = this.add.rectangle(panelX - 16, panelY - 8, 260, 166, 0xf0f0e0, 1).setOrigin(0, 0).setStrokeStyle(4, 0x303848);
    this.moveContainer.add(bg);
    this.moveSlots = [];
    for (let i = 0; i < 4; i++) {
      const col = i % 2, row = Math.floor(i / 2);
      const bx = panelX + col * 128;
      const by = panelY + row * 54;
      const box = this.add.rectangle(bx, by, 118, 46, 0xa8a878, 1).setOrigin(0, 0)
        .setStrokeStyle(2, 0x202028).setInteractive({ useHandCursor: true });
      const nameTxt = this.add.text(bx + 6, by + 4, "", {
        fontFamily: FONT, fontSize: "8px", color: "#ffffff", stroke: "#202028", strokeThickness: 3,
        wordWrap: { width: 106 }, lineSpacing: 2
      });
      const powTxt = this.add.text(bx + 6, by + 34, "", {
        fontFamily: FONT, fontSize: "7px", color: "#ffffff", stroke: "#202028", strokeThickness: 3
      });
      box.on("pointerdown", () => { this.moveCursor = i; this.onMoveChosen(i); });
      this.moveContainer.add([box, nameTxt, powTxt]);
      this.moveSlots.push({ box, nameTxt, powTxt });
    }
    const backY = panelY + 116;
    const backBox = this.add.rectangle(panelX, backY, 228, 34, 0xffffff, 0).setOrigin(0, 0)
      .setStrokeStyle(2, 0x606870).setInteractive({ useHandCursor: true });
    const backTxt = this.add.text(panelX + 14, backY + 9, "ATRÁS", {
      fontFamily: FONT, fontSize: "11px", color: "#202028"
    });
    backBox.on("pointerdown", () => { this.hideMoveMenu(); this.showCommandMenu(); });
    this.moveContainer.add([backBox, backTxt]);
    this.moveBackBox = backBox;
  }

  buildPartyMenu() {
    const w = this.scale.width, h = this.scale.height;
    const panelW = 420, panelH = 260;
    const panelX = (w - panelW) / 2, panelY = (h - panelH) / 2;
    this.partyContainer = this.add.container(0, 0).setDepth(1002);
    const bg = this.add.rectangle(panelX, panelY, panelW, panelH, 0xf0f0e0, 1).setOrigin(0, 0).setStrokeStyle(4, 0x303848);
    this.partyTitleTxt = this.add.text(panelX + 16, panelY + 10, "Elige un Pokémon", {
      fontFamily: FONT, fontSize: "10px", color: "#202028",
      wordWrap: { width: panelW - 100 }, lineSpacing: 4
    });
    this.partyContainer.add([bg, this.partyTitleTxt]);

    this.partySlots = [];
    const rowH = 44;
    for (let i = 0; i < 6; i++) {
      const by = panelY + 52 + i * (rowH + 4);
      const mon = this.playerTeam[i];
      const box = this.add.rectangle(panelX + 16, by, panelW - 32, rowH, 0xffffff, 0.6).setOrigin(0, 0)
        .setStrokeStyle(2, 0x606870).setInteractive({ useHandCursor: true });
      let icon = null;
      if (mon) {
        icon = this.add.image(panelX + 40, by + rowH / 2, `mon-front-${mon.id}`).setDisplaySize(32, 32);
      }
      const nameTxt = this.add.text(panelX + 64, by + 8, "", {
        fontFamily: FONT, fontSize: "9px", color: "#202028",
        wordWrap: { width: panelW - 220 }
      });
      const hpTxt = this.add.text(panelX + panelW - 150, by + 8, "", {
        fontFamily: FONT, fontSize: "9px", color: "#202028"
      });
      box.on("pointerdown", () => { this.partyCursor = i; this.onPartySelect(i); });
      box.setVisible(false); nameTxt.setVisible(false); hpTxt.setVisible(false);
      if (icon) icon.setVisible(false);
      const members = [box, nameTxt, hpTxt];
      if (icon) members.push(icon);
      this.partyContainer.add(members);
      this.partySlots.push({ box, nameTxt, hpTxt, icon });
    }
    this.partyBackBox = this.add.text(panelX + panelW - 70, panelY + 10, "< atrás", {
      fontFamily: FONT, fontSize: "9px", color: "#202028"
    }).setInteractive({ useHandCursor: true });
    this.partyBackBox.on("pointerdown", () => {
      if (this.forcedSwitch) return;
      this.hidePartyMenu(); this.showCommandMenu();
    });
    this.partyContainer.add(this.partyBackBox);
  }

  showCommandMenu() {
    if (this.locked) return;
    this.commandContainer.setVisible(true);
    this.moveContainer.setVisible(false);
    this.partyContainer.setVisible(false);
    this.commandCursor = 0;
    this.refreshCommandHighlight();
  }
  hideCommandMenu() { this.commandContainer.setVisible(false); }
  hideMoveMenu() { this.moveContainer.setVisible(false); }
  hidePartyMenu() { this.partyContainer.setVisible(false); }

  showMoveMenu() {
    const moves = this.playerTeam[this.playerIndex].moves;
    this.moveSlots.forEach((slot, i) => {
      const move = moves[i];
      if (move) {
        slot.nameTxt.setText(move.name);
        slot.powTxt.setText(move.power ? `POD ${move.power}` : "ESTADO");
        slot.box.setFillStyle(TYPE_COLORS[move.type] || 0xa8a878, 1);
        slot.box.setInteractive({ useHandCursor: true });
      } else {
        slot.nameTxt.setText("-");
        slot.powTxt.setText("");
        slot.box.setFillStyle(0xcccccc, 1);
        slot.box.disableInteractive();
      }
    });
    this.hideCommandMenu();
    this.partyContainer.setVisible(false);
    this.moveContainer.setVisible(true);
    this.moveCursor = 0;
    this.refreshMoveHighlight();
  }

  showPartyMenu() {
    this.partySlots.forEach((slot, i) => {
      const mon = this.playerTeam[i];
      if (!mon) {
        slot.box.setVisible(false); slot.nameTxt.setVisible(false); slot.hpTxt.setVisible(false);
        if (slot.icon) slot.icon.setVisible(false);
        return;
      }
      slot.box.setVisible(true); slot.nameTxt.setVisible(true); slot.hpTxt.setVisible(true);
      if (slot.icon) slot.icon.setVisible(true);
      const tag = i === this.playerIndex ? " (activo)" : isFainted(mon) ? " (debilitado)" : "";
      slot.nameTxt.setText(`${mon.name}${tag}`);
      slot.hpTxt.setText(`PS ${mon.hp}/${mon.maxHp}`);
      const selectable = i !== this.playerIndex && !isFainted(mon);
      slot.box.setFillStyle(selectable ? 0xffffff : 0xaaaaaa, selectable ? 0.6 : 0.4);
      if (selectable) slot.box.setInteractive({ useHandCursor: true });
      else slot.box.disableInteractive();
    });
    this.hideCommandMenu();
    this.moveContainer.setVisible(false);
    this.partyContainer.setVisible(true);

    this.partyTitleTxt.setText(this.forcedSwitch ? "¡Tu Pokémon se debilitó! Elige el siguiente:" : "Elige un Pokémon");
    this.partyBackBox.setVisible(!this.forcedSwitch);
    if (this.forcedSwitch) this.partyBackBox.disableInteractive();
    else this.partyBackBox.setInteractive({ useHandCursor: true });

    const firstSelectable = this.playerTeam.findIndex((mon, i) => i !== this.playerIndex && !isFainted(mon));
    this.partyCursor = firstSelectable !== -1 ? firstSelectable : 0;
    this.refreshPartyHighlight();
  }

  refreshCommandHighlight() {
    this.commandEntries.forEach((entry, i) => {
      const focused = i === this.commandCursor;
      entry.box.setStrokeStyle(focused ? 4 : 2, focused ? 0xf8d800 : 0x606870);
    });
  }

  refreshMoveHighlight() {
    this.moveSlots.forEach((slot, i) => {
      const focused = i === this.moveCursor;
      slot.box.setStrokeStyle(focused ? 4 : 2, focused ? 0xf8d800 : 0x202028);
    });
    const backFocused = this.moveCursor === 4;
    this.moveBackBox.setStrokeStyle(backFocused ? 4 : 2, backFocused ? 0xf8d800 : 0x606870);
  }

  refreshPartyHighlight() {
    this.partySlots.forEach((slot, i) => {
      if (!this.playerTeam[i]) return;
      const focused = i === this.partyCursor;
      slot.box.setStrokeStyle(focused ? 4 : 2, focused ? 0xf8d800 : 0x606870);
    });
  }

  onCommand(label) {
    if (this.locked) return;
    if (label === "LUCHAR") {
      this.showMoveMenu();
    } else if (label === "POKÉMON") {
      this.showPartyMenu();
    }
  }

  onMoveChosen(moveIdx) {
    const move = this.playerTeam[this.playerIndex].moves[moveIdx];
    if (!move) return;
    this.hideMoveMenu();
    this.locked = true;
    this.runTurn(move);
  }

  onPartySelect(idx) {
    const target = this.playerTeam[idx];
    if (!target || idx === this.playerIndex || isFainted(target)) return;
    this.hidePartyMenu();
    this.playerIndex = idx;
    this.playerSprite.setTexture(`mon-back-${target.id}`);
    this.refreshHuds();

    if (this.forcedSwitch) {
      this.forcedSwitch = false;
      const done = this.pendingSwitchDone;
      this.pendingSwitchDone = null;
      this.dialogue.showLines([`¡Adelante, ${target.name}!`], done);
      return;
    }

    this.locked = true;
    this.dialogue.showLines([`¡Adelante, ${target.name}!`], () => {
      const enemy = this.enemyTeam[this.enemyIndex];
      const enemyMove = pickAiMove(enemy);
      this.executeStep([{ side: "enemy", atk: enemy, def: this.playerTeam[this.playerIndex], move: enemyMove }], 0);
    });
  }

  runTurn(playerMove) {
    const player = this.playerTeam[this.playerIndex];
    const enemy = this.enemyTeam[this.enemyIndex];
    const enemyMove = pickAiMove(enemy);

    const playerFirst = player.spd === enemy.spd ? Math.random() < 0.5 : player.spd > enemy.spd;
    const order = playerFirst
      ? [{ side: "player", atk: player, def: enemy, move: playerMove }, { side: "enemy", atk: enemy, def: player, move: enemyMove }]
      : [{ side: "enemy", atk: enemy, def: player, move: enemyMove }, { side: "player", atk: player, def: enemy, move: playerMove }];

    this.executeStep(order, 0);
  }

  executeStep(order, i) {
    if (i >= order.length) {
      this.afterTurn();
      return;
    }
    const step = order[i];
    if (isFainted(step.atk)) { this.executeStep(order, i + 1); return; }

    const result = applyMove(step.atk, step.def, step.move);
    this.refreshHuds();

    const lines = [`¡${step.atk.name} usó ${step.move.name}!`];
    if (result.healed) {
      lines.push(`¡${step.atk.name} recuperó algo de PS!`);
    } else if (result.effectiveness === 0) {
      lines.push("No tuvo efecto...");
    } else if (result.effectiveness > 1) {
      lines.push("¡Es muy eficaz!");
    } else if (result.effectiveness < 1) {
      lines.push("No es muy eficaz...");
    }

    this.dialogue.showLines(lines, () => {
      if (isFainted(step.def)) {
        this.handleFaint(step.def === this.playerTeam[this.playerIndex] ? "player" : "enemy", () => {
          this.checkBattleEnd(() => this.executeStep(order, i + 1));
        });
      } else {
        this.executeStep(order, i + 1);
      }
    });
  }

  handleFaint(side, onDone) {
    if (side === "player") {
      const p = this.playerTeam[this.playerIndex];
      this.dialogue.showLines([`¡${p.name} se debilitó!`], () => {
        const anyAlive = this.playerTeam.some((m) => !isFainted(m));
        if (!anyAlive) { onDone(); return; }
        this.forcedSwitch = true;
        this.pendingSwitchDone = onDone;
        this.dialogue.showLines(["¡Elige tu próximo Pokémon!"], () => {
          this.showPartyMenu();
        });
      });
    } else {
      const e = this.enemyTeam[this.enemyIndex];
      this.dialogue.showLines([`¡${e.name} se debilitó!`], () => {
        const next = nextAliveIndex(this.enemyTeam, 0);
        if (next === -1) { onDone(); return; }
        this.enemyIndex = next;
        this.enemySprite.setTexture(`mon-front-${this.enemyTeam[this.enemyIndex].id}`);
        this.refreshHuds();
        this.dialogue.showLines([`¡${this.trainerName} envía a ${this.enemyTeam[this.enemyIndex].name}!`], onDone);
      });
    }
  }

  checkBattleEnd(continueFn) {
    if (isPartyWiped()) {
      this.locked = true;
      this.dialogue.showLines(["¡No te quedan más Pokémon!"], () => {
        events.emit("battle-lost", { trainerName: this.trainerName });
      });
      return;
    }
    if (nextAliveIndex(this.enemyTeam, 0) === -1) {
      this.locked = true;
      this.dialogue.showLines([`¡${this.trainerName} no tiene más Pokémon!`, "¡Ganaste!"], () => {
        events.emit("battle-won", { areaId: this.areaId });
      });
      return;
    }
    continueFn();
  }

  afterTurn() {
    this.locked = false;
    this.showCommandMenu();
  }

  handleMenuInput() {
    const forcedPartyOpen = this.partyContainer.visible && this.forcedSwitch;
    if (this.locked && !forcedPartyOpen) return;
    const K = Phaser.Input.Keyboard;

    if (this.commandContainer.visible) {
      if (K.JustDown(this.navKeys.up) || K.JustDown(this.navKeys.left)) {
        this.commandCursor = (this.commandCursor - 1 + this.commandEntries.length) % this.commandEntries.length;
        this.refreshCommandHighlight();
      } else if (K.JustDown(this.navKeys.down) || K.JustDown(this.navKeys.right)) {
        this.commandCursor = (this.commandCursor + 1) % this.commandEntries.length;
        this.refreshCommandHighlight();
      } else if (K.JustDown(this.confirmKey)) {
        this.onCommand(this.commandEntries[this.commandCursor].label);
      }
    } else if (this.moveContainer.visible) {
      // moveCursor: 0-3 = move grid (col = i%2, row = floor(i/2)), 4 = BACK
      if (K.JustDown(this.navKeys.left) || K.JustDown(this.navKeys.right)) {
        if (this.moveCursor < 4) {
          this.moveCursor = this.moveCursor % 2 === 0 ? this.moveCursor + 1 : this.moveCursor - 1;
          this.refreshMoveHighlight();
        }
      } else if (K.JustDown(this.navKeys.down)) {
        this.moveCursor = this.moveCursor === 4 ? 0 : this.moveCursor < 2 ? this.moveCursor + 2 : 4;
        this.refreshMoveHighlight();
      } else if (K.JustDown(this.navKeys.up)) {
        this.moveCursor = this.moveCursor === 4 ? 2 : this.moveCursor >= 2 ? this.moveCursor - 2 : 4;
        this.refreshMoveHighlight();
      } else if (K.JustDown(this.confirmKey)) {
        if (this.moveCursor === 4) { this.hideMoveMenu(); this.showCommandMenu(); }
        else { this.onMoveChosen(this.moveCursor); }
      } else if (K.JustDown(this.backKey)) {
        this.hideMoveMenu(); this.showCommandMenu();
      }
    } else if (this.partyContainer.visible) {
      const n = this.playerTeam.length;
      if (K.JustDown(this.navKeys.up) || K.JustDown(this.navKeys.left)) {
        this.partyCursor = (this.partyCursor - 1 + n) % n;
        this.refreshPartyHighlight();
      } else if (K.JustDown(this.navKeys.down) || K.JustDown(this.navKeys.right)) {
        this.partyCursor = (this.partyCursor + 1) % n;
        this.refreshPartyHighlight();
      } else if (K.JustDown(this.confirmKey)) {
        this.onPartySelect(this.partyCursor);
      } else if (K.JustDown(this.backKey) && !this.forcedSwitch) {
        this.hidePartyMenu(); this.showCommandMenu();
      }
    }
  }

  update() {
    this.dialogue.update();
    this.handleMenuInput();
  }
}
