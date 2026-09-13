import Phaser from "phaser";
import StartScene from "./scenes/StartScene.js";
import IntroScene from "./scenes/IntroScene.js";
import WorldScene from "./scenes/WorldScene.js";
import BattleScene from "./scenes/BattleScene.js";
import EndScene from "./scenes/EndScene.js";

const config = {
  type: Phaser.AUTO,
  parent: "game-container",
  width: 800,
  height: 600,
  pixelArt: false,
  backgroundColor: "#101014",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [StartScene, IntroScene, WorldScene, BattleScene, EndScene]
};

new Phaser.Game(config);
