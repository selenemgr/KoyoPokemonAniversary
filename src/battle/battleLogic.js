import { POKEDEX } from "../data/pokedex.js";
import { MOVES } from "../data/movepool.js";

// Standard type effectiveness chart (attacker type -> defender type -> multiplier).
// Omitted entries default to 1 (neutral).
const TYPE_CHART = {
  Normal: { Rock: 0.5, Ghost: 0, Steel: 0.5 },
  Fire: { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 2, Bug: 2, Rock: 0.5, Dragon: 0.5, Steel: 2 },
  Water: { Fire: 2, Water: 0.5, Grass: 0.5, Ground: 2, Rock: 2, Dragon: 0.5 },
  Electric: { Water: 2, Electric: 0.5, Grass: 0.5, Ground: 0, Flying: 2, Dragon: 0.5 },
  Grass: { Fire: 0.5, Water: 2, Grass: 0.5, Poison: 0.5, Ground: 2, Flying: 0.5, Bug: 0.5, Rock: 2, Dragon: 0.5, Steel: 0.5 },
  Ice: { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 0.5, Ground: 2, Flying: 2, Dragon: 2, Steel: 0.5 },
  Fighting: { Normal: 2, Ice: 2, Poison: 0.5, Flying: 0.5, Psychic: 0.5, Bug: 0.5, Rock: 2, Ghost: 0, Dark: 2, Steel: 2, Fairy: 0.5 },
  Poison: { Grass: 2, Poison: 0.5, Ground: 0.5, Rock: 0.5, Ghost: 0.5, Steel: 0, Fairy: 2 },
  Ground: { Fire: 2, Electric: 2, Grass: 0.5, Poison: 2, Flying: 0, Bug: 0.5, Rock: 2, Steel: 2 },
  Flying: { Electric: 0.5, Grass: 2, Fighting: 2, Bug: 2, Rock: 0.5, Steel: 0.5 },
  Psychic: { Fighting: 2, Poison: 2, Psychic: 0.5, Dark: 0, Steel: 0.5 },
  Bug: { Fire: 0.5, Grass: 2, Fighting: 0.5, Poison: 0.5, Flying: 0.5, Psychic: 2, Ghost: 0.5, Dark: 2, Steel: 0.5, Fairy: 0.5 },
  Rock: { Fire: 2, Ice: 2, Flying: 2, Bug: 2, Fighting: 0.5, Ground: 0.5, Steel: 0.5 },
  Ghost: { Normal: 0, Psychic: 2, Ghost: 2, Dark: 0.5 },
  Dragon: { Dragon: 2, Steel: 0.5, Fairy: 0 },
  Dark: { Fighting: 0.5, Psychic: 2, Ghost: 2, Dark: 0.5, Fairy: 0.5 },
  Steel: { Fire: 0.5, Water: 0.5, Electric: 0.5, Ice: 2, Rock: 2, Steel: 0.5, Fairy: 2 },
  Fairy: { Fighting: 2, Poison: 0.5, Bug: 0.5, Dragon: 2, Dark: 2, Steel: 0.5 }
};

export function typeEffectiveness(moveType, defenderTypes) {
  let mult = 1;
  for (const defType of defenderTypes) {
    const row = TYPE_CHART[moveType];
    if (row && defType in row) mult *= row[defType];
  }
  return mult;
}

const LEVEL = 40; // flat level used for every combatant, keeps stat math simple

export function statAt(base) {
  // simplified flat scaling, not the real Pokemon stat formula
  return Math.floor(base * (LEVEL / 40) + LEVEL / 2);
}

export function createBattler(speciesKey, level = LEVEL) {
  const species = POKEDEX[speciesKey];
  const maxHp = statAt(species.baseStats.hp) + 40;
  return {
    key: speciesKey,
    name: species.name,
    types: species.types,
    id: species.id,
    level,
    atk: statAt(species.baseStats.atk),
    def: statAt(species.baseStats.def),
    spd: statAt(species.baseStats.spd),
    maxHp,
    hp: maxHp,
    moves: species.moves.map((m) => MOVES[m])
  };
}

export function computeDamage(attacker, defender, move) {
  if (!move.power) return 0;
  const stab = attacker.types.includes(move.type) ? 1.5 : 1;
  const eff = typeEffectiveness(move.type, defender.types);
  if (eff === 0) return { damage: 0, effectiveness: eff };
  const variance = 0.85 + Math.random() * 0.15;
  const base = ((2 * attacker.level / 5 + 2) * move.power * (attacker.atk / defender.def)) / 50 + 2;
  const damage = Math.max(1, Math.floor(base * stab * eff * variance));
  return { damage, effectiveness: eff };
}

export function applyMove(attacker, defender, moveKeyOrMove) {
  const move = typeof moveKeyOrMove === "string" ? MOVES[moveKeyOrMove] : moveKeyOrMove;
  if (move.heal) {
    const healed = Math.min(defender.maxHp, attacker.hp + Math.floor(attacker.maxHp * 0.5));
    attacker.hp = healed;
    return { move, damage: 0, effectiveness: 1, healed: true };
  }
  const { damage, effectiveness } = computeDamage(attacker, defender, move);
  defender.hp = Math.max(0, defender.hp - damage);
  return { move, damage, effectiveness, healed: false };
}

export function pickAiMove(battler) {
  const moves = battler.moves;
  return moves[Math.floor(Math.random() * moves.length)];
}

export function isFainted(battler) {
  return battler.hp <= 0;
}
