import Phaser from "phaser";
import { STARTER_KEYS, pickRandomPair } from "../data/pokedex.js";
import { createBattler } from "../battle/battleLogic.js";

export const events = new Phaser.Events.EventEmitter();

export const AREA_COUNT = 4;

function freshState() {
  const usedKeys = [];
  const areas = [1, 2, 3, 4].map((areaId) => {
    const team = pickRandomPair(usedKeys);
    usedKeys.push(...team);
    return { areaId, defeated: false, team };
  });
  return {
    party: STARTER_KEYS.map((k) => createBattler(k)),
    currentArea: 1,
    areas
  };
}

export let state = freshState();

export function resetGame() {
  state = freshState();
  events.emit("state-reset");
}

export function healParty() {
  state.party.forEach((p) => { p.hp = p.maxHp; });
}

export function isPartyWiped() {
  return state.party.every((p) => p.hp <= 0);
}

export function getArea(areaId) {
  return state.areas.find((a) => a.areaId === areaId);
}

export function defeatArea(areaId) {
  const area = getArea(areaId);
  if (area && !area.defeated) {
    area.defeated = true;
    events.emit("area-defeated", areaId);
  }
}
