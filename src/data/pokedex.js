// Curated roster. Base stats are simplified (hp, atk, def, spd only).
// Sprites are streamed at runtime from the public PokeAPI sprite mirror
// (raw.githubusercontent.com/PokeAPI/sprites) - standard practice for
// personal/non-commercial fan projects, not bundled or redistributed.
const SPRITE_BASE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

export function frontSpriteUrl(id) {
  return `${SPRITE_BASE}/${id}.png`;
}

export function backSpriteUrl(id) {
  return `${SPRITE_BASE}/back/${id}.png`;
}

export const POKEDEX = {
  lucario: {
    key: "lucario", name: "Lucario", id: 448, types: ["Fighting", "Steel"],
    baseStats: { hp: 70, atk: 110, def: 70, spd: 90 },
    moves: ["auraSphere", "closeCombat", "bulletPunch", "quickAttack"]
  },
  mimikyu: {
    key: "mimikyu", name: "Mimikyu", id: 778, types: ["Ghost", "Fairy"],
    baseStats: { hp: 55, atk: 90, def: 80, spd: 96 },
    moves: ["shadowClaw", "playRough", "shadowBall", "moonlight"]
  },
  gardevoir: {
    key: "gardevoir", name: "Gardevoir", id: 282, types: ["Psychic", "Fairy"],
    baseStats: { hp: 68, atk: 85, def: 65, spd: 100 },
    moves: ["moonblast", "psychic", "psyshock", "shadowBall"]
  },
  diancie: {
    key: "diancie", name: "Diancie", id: 719, types: ["Rock", "Fairy"],
    baseStats: { hp: 50, atk: 100, def: 150, spd: 50 },
    moves: ["diamondStorm", "moonblast", "rockSlide", "psychic"]
  },
  volcarona: {
    key: "volcarona", name: "Volcarona", id: 637, types: ["Bug", "Fire"],
    baseStats: { hp: 85, atk: 100, def: 65, spd: 100 },
    moves: ["fireBlast", "flamethrower", "xScissor", "airSlash"]
  },
  meowscarada: {
    key: "meowscarada", name: "Meowscarada", id: 908, types: ["Grass", "Dark"],
    baseStats: { hp: 76, atk: 110, def: 70, spd: 123 },
    moves: ["gigaDrain", "crunch", "darkPulse", "solarBeam"]
  },
  whimsicott: {
    key: "whimsicott", name: "Whimsicott", id: 547, types: ["Grass", "Fairy"],
    baseStats: { hp: 60, atk: 75, def: 60, spd: 116 },
    moves: ["moonblast", "playRough", "gigaDrain", "quickAttack"]
  },
  charizard: {
    key: "charizard", name: "Charizard", id: 6, types: ["Fire", "Flying"],
    baseStats: { hp: 78, atk: 84, def: 78, spd: 100 },
    moves: ["flamethrower", "fireBlast", "airSlash", "dragonClaw"]
  },
  blastoise: {
    key: "blastoise", name: "Blastoise", id: 9, types: ["Water"],
    baseStats: { hp: 79, atk: 83, def: 100, spd: 78 },
    moves: ["hydroPump", "surf", "icePunch", "bodySlam"]
  },
  venusaur: {
    key: "venusaur", name: "Venusaur", id: 3, types: ["Grass", "Poison"],
    baseStats: { hp: 80, atk: 82, def: 83, spd: 80 },
    moves: ["solarBeam", "gigaDrain", "poisonJab", "bodySlam"]
  },
  gengar: {
    key: "gengar", name: "Gengar", id: 94, types: ["Ghost", "Poison"],
    baseStats: { hp: 60, atk: 65, def: 60, spd: 110 },
    moves: ["shadowBall", "psychic", "darkPulse", "poisonJab"]
  },
  snorlax: {
    key: "snorlax", name: "Snorlax", id: 143, types: ["Normal"],
    baseStats: { hp: 160, atk: 110, def: 65, spd: 30 },
    moves: ["bodySlam", "hyperBeam", "earthquake", "crunch"]
  },
  tyranitar: {
    key: "tyranitar", name: "Tyranitar", id: 248, types: ["Rock", "Dark"],
    baseStats: { hp: 100, atk: 134, def: 110, spd: 61 },
    moves: ["rockSlide", "crunch", "earthquake", "darkPulse"]
  },
  metagross: {
    key: "metagross", name: "Metagross", id: 376, types: ["Steel", "Psychic"],
    baseStats: { hp: 80, atk: 135, def: 130, spd: 70 },
    moves: ["ironHead", "flashCannon", "psychic", "bulletPunch"]
  },
  salamence: {
    key: "salamence", name: "Salamence", id: 373, types: ["Dragon", "Flying"],
    baseStats: { hp: 95, atk: 135, def: 80, spd: 100 },
    moves: ["dragonClaw", "outrage", "airSlash", "crunch"]
  },
  garchomp: {
    key: "garchomp", name: "Garchomp", id: 445, types: ["Dragon", "Ground"],
    baseStats: { hp: 108, atk: 130, def: 95, spd: 102 },
    moves: ["earthquake", "dragonClaw", "outrage", "crunch"]
  },
  alakazam: {
    key: "alakazam", name: "Alakazam", id: 65, types: ["Psychic"],
    baseStats: { hp: 55, atk: 50, def: 45, spd: 120 },
    moves: ["psychic", "psyshock", "shadowBall", "darkPulse"]
  },
  dragonite: {
    key: "dragonite", name: "Dragonite", id: 149, types: ["Dragon", "Flying"],
    baseStats: { hp: 91, atk: 134, def: 95, spd: 80 },
    moves: ["dragonClaw", "outrage", "airSlash", "hyperBeam"]
  },
  machamp: {
    key: "machamp", name: "Machamp", id: 68, types: ["Fighting"],
    baseStats: { hp: 90, atk: 130, def: 80, spd: 55 },
    moves: ["closeCombat", "bodySlam", "rockSlide", "earthquake"]
  },
  arcanine: {
    key: "arcanine", name: "Arcanine", id: 59, types: ["Fire"],
    baseStats: { hp: 90, atk: 110, def: 80, spd: 95 },
    moves: ["flamethrower", "fireBlast", "crunch", "wingAttack"]
  },
  umbreon: {
    key: "umbreon", name: "Umbreon", id: 197, types: ["Dark"],
    baseStats: { hp: 95, atk: 65, def: 110, spd: 65 },
    moves: ["darkPulse", "crunch", "bodySlam", "shadowBall"]
  },
  togekiss: {
    key: "togekiss", name: "Togekiss", id: 468, types: ["Fairy", "Flying"],
    baseStats: { hp: 85, atk: 50, def: 95, spd: 80 },
    moves: ["airSlash", "moonblast", "playRough", "hyperVoice"]
  },
  gyarados: {
    key: "gyarados", name: "Gyarados", id: 130, types: ["Water", "Flying"],
    baseStats: { hp: 95, atk: 125, def: 79, spd: 81 },
    moves: ["hyperBeam", "crunch", "earthquake", "wingAttack"]
  },
  lapras: {
    key: "lapras", name: "Lapras", id: 131, types: ["Water", "Ice"],
    baseStats: { hp: 130, atk: 85, def: 80, spd: 60 },
    moves: ["surf", "blizzard", "icePunch", "bodySlam"]
  },
  aerodactyl: {
    key: "aerodactyl", name: "Aerodactyl", id: 142, types: ["Rock", "Flying"],
    baseStats: { hp: 80, atk: 105, def: 65, spd: 130 },
    moves: ["rockSlide", "wingAttack", "crunch", "quickAttack"]
  },
  kingdra: {
    key: "kingdra", name: "Kingdra", id: 230, types: ["Water", "Dragon"],
    baseStats: { hp: 75, atk: 95, def: 95, spd: 85 },
    moves: ["hydroPump", "surf", "dragonClaw", "icePunch"]
  },
  milotic: {
    key: "milotic", name: "Milotic", id: 350, types: ["Water"],
    baseStats: { hp: 95, atk: 100, def: 79, spd: 81 },
    moves: ["surf", "hydroPump", "psychic", "icePunch"]
  },
  excadrill: {
    key: "excadrill", name: "Excadrill", id: 530, types: ["Ground", "Steel"],
    baseStats: { hp: 110, atk: 135, def: 60, spd: 88 },
    moves: ["earthquake", "ironHead", "rockSlide", "quickAttack"]
  },
  hydreigon: {
    key: "hydreigon", name: "Hydreigon", id: 635, types: ["Dark", "Dragon"],
    baseStats: { hp: 92, atk: 105, def: 90, spd: 98 },
    moves: ["darkPulse", "dragonClaw", "outrage", "flamethrower"]
  },
  chandelure: {
    key: "chandelure", name: "Chandelure", id: 609, types: ["Ghost", "Fire"],
    baseStats: { hp: 60, atk: 130, def: 55, spd: 80 },
    moves: ["shadowBall", "fireBlast", "flamethrower", "darkPulse"]
  },
  krookodile: {
    key: "krookodile", name: "Krookodile", id: 553, types: ["Ground", "Dark"],
    baseStats: { hp: 95, atk: 117, def: 80, spd: 92 },
    moves: ["earthquake", "crunch", "darkPulse", "rockSlide"]
  },
  conkeldurr: {
    key: "conkeldurr", name: "Conkeldurr", id: 534, types: ["Fighting"],
    baseStats: { hp: 105, atk: 140, def: 95, spd: 45 },
    moves: ["closeCombat", "rockSlide", "bodySlam", "earthquake"]
  },
  serperior: {
    key: "serperior", name: "Serperior", id: 497, types: ["Grass"],
    baseStats: { hp: 75, atk: 90, def: 95, spd: 113 },
    moves: ["solarBeam", "gigaDrain", "quickAttack", "bodySlam"]
  },
  emboar: {
    key: "emboar", name: "Emboar", id: 500, types: ["Fire", "Fighting"],
    baseStats: { hp: 110, atk: 123, def: 65, spd: 65 },
    moves: ["fireBlast", "flamethrower", "closeCombat", "bodySlam"]
  },
  samurott: {
    key: "samurott", name: "Samurott", id: 503, types: ["Water"],
    baseStats: { hp: 95, atk: 100, def: 85, spd: 70 },
    moves: ["hydroPump", "surf", "icePunch", "crunch"]
  },
  sylveon: {
    key: "sylveon", name: "Sylveon", id: 700, types: ["Fairy"],
    baseStats: { hp: 95, atk: 110, def: 65, spd: 60 },
    moves: ["moonblast", "playRough", "hyperVoice", "psychic"]
  },
  espeon: {
    key: "espeon", name: "Espeon", id: 196, types: ["Psychic"],
    baseStats: { hp: 65, atk: 115, def: 60, spd: 110 },
    moves: ["psychic", "psyshock", "shadowBall", "quickAttack"]
  },
  vaporeon: {
    key: "vaporeon", name: "Vaporeon", id: 134, types: ["Water"],
    baseStats: { hp: 130, atk: 100, def: 60, spd: 65 },
    moves: ["hydroPump", "surf", "icePunch", "bodySlam"]
  },
  jolteon: {
    key: "jolteon", name: "Jolteon", id: 135, types: ["Electric"],
    baseStats: { hp: 65, atk: 100, def: 60, spd: 130 },
    moves: ["thunderbolt", "thunderPunch", "quickAttack", "shadowBall"]
  },
  flareon: {
    key: "flareon", name: "Flareon", id: 136, types: ["Fire"],
    baseStats: { hp: 65, atk: 130, def: 60, spd: 65 },
    moves: ["flamethrower", "fireBlast", "crunch", "quickAttack"]
  },
  leafeon: {
    key: "leafeon", name: "Leafeon", id: 470, types: ["Grass"],
    baseStats: { hp: 65, atk: 110, def: 130, spd: 95 },
    moves: ["gigaDrain", "solarBeam", "quickAttack", "bodySlam"]
  },
  glaceon: {
    key: "glaceon", name: "Glaceon", id: 471, types: ["Ice"],
    baseStats: { hp: 65, atk: 110, def: 110, spd: 65 },
    moves: ["blizzard", "icePunch", "shadowBall", "bodySlam"]
  },
  zoroark: {
    key: "zoroark", name: "Zoroark", id: 571, types: ["Dark"],
    baseStats: { hp: 60, atk: 105, def: 60, spd: 105 },
    moves: ["darkPulse", "crunch", "shadowBall", "flamethrower"]
  },
  bisharp: {
    key: "bisharp", name: "Bisharp", id: 625, types: ["Dark", "Steel"],
    baseStats: { hp: 65, atk: 125, def: 100, spd: 70 },
    moves: ["ironHead", "crunch", "darkPulse", "xScissor"]
  },
  aegislash: {
    key: "aegislash", name: "Aegislash", id: 681, types: ["Steel", "Ghost"],
    baseStats: { hp: 60, atk: 120, def: 140, spd: 60 },
    moves: ["ironHead", "flashCannon", "shadowBall", "psychic"]
  },
  goodra: {
    key: "goodra", name: "Goodra", id: 706, types: ["Dragon"],
    baseStats: { hp: 90, atk: 100, def: 100, spd: 80 },
    moves: ["dragonClaw", "outrage", "surf", "flashCannon"]
  },
  kommoo: {
    key: "kommoo", name: "Kommo-o", id: 784, types: ["Dragon", "Fighting"],
    baseStats: { hp: 75, atk: 110, def: 125, spd: 85 },
    moves: ["dragonClaw", "outrage", "closeCombat", "ironHead"]
  },
  toxapex: {
    key: "toxapex", name: "Toxapex", id: 748, types: ["Poison", "Water"],
    baseStats: { hp: 50, atk: 63, def: 152, spd: 35 },
    moves: ["poisonJab", "surf", "crunch", "icePunch"]
  },
  incineroar: {
    key: "incineroar", name: "Incineroar", id: 727, types: ["Fire", "Dark"],
    baseStats: { hp: 95, atk: 115, def: 90, spd: 60 },
    moves: ["flamethrower", "fireBlast", "crunch", "darkPulse"]
  },
  primarina: {
    key: "primarina", name: "Primarina", id: 730, types: ["Water", "Fairy"],
    baseStats: { hp: 80, atk: 100, def: 89, spd: 60 },
    moves: ["hydroPump", "surf", "moonblast", "playRough"]
  },
  decidueye: {
    key: "decidueye", name: "Decidueye", id: 724, types: ["Grass", "Ghost"],
    baseStats: { hp: 78, atk: 107, def: 75, spd: 70 },
    moves: ["shadowBall", "gigaDrain", "solarBeam", "xScissor"]
  },
  corviknight: {
    key: "corviknight", name: "Corviknight", id: 823, types: ["Flying", "Steel"],
    baseStats: { hp: 98, atk: 87, def: 105, spd: 67 },
    moves: ["wingAttack", "airSlash", "ironHead", "flashCannon"]
  },
  dragapult: {
    key: "dragapult", name: "Dragapult", id: 887, types: ["Dragon", "Ghost"],
    baseStats: { hp: 88, atk: 120, def: 75, spd: 142 },
    moves: ["dragonClaw", "outrage", "shadowBall", "quickAttack"]
  },
  grimmsnarl: {
    key: "grimmsnarl", name: "Grimmsnarl", id: 861, types: ["Dark", "Fairy"],
    baseStats: { hp: 95, atk: 120, def: 65, spd: 60 },
    moves: ["darkPulse", "crunch", "playRough", "moonblast"]
  },
  copperajah: {
    key: "copperajah", name: "Copperajah", id: 879, types: ["Steel"],
    baseStats: { hp: 122, atk: 130, def: 69, spd: 30 },
    moves: ["ironHead", "flashCannon", "earthquake", "bodySlam"]
  },
  hatterene: {
    key: "hatterene", name: "Hatterene", id: 858, types: ["Psychic", "Fairy"],
    baseStats: { hp: 57, atk: 127, def: 95, spd: 29 },
    moves: ["psychic", "moonblast", "psyshock", "playRough"]
  },
  cinderace: {
    key: "cinderace", name: "Cinderace", id: 815, types: ["Fire"],
    baseStats: { hp: 80, atk: 116, def: 75, spd: 119 },
    moves: ["fireBlast", "flamethrower", "quickAttack", "crunch"]
  },
  rillaboom: {
    key: "rillaboom", name: "Rillaboom", id: 812, types: ["Grass"],
    baseStats: { hp: 100, atk: 125, def: 90, spd: 85 },
    moves: ["gigaDrain", "solarBeam", "bodySlam", "quickAttack"]
  },
  toxtricity: {
    key: "toxtricity", name: "Toxtricity", id: 849, types: ["Electric", "Poison"],
    baseStats: { hp: 75, atk: 113, def: 70, spd: 97 },
    moves: ["thunderbolt", "thunderPunch", "poisonJab", "crunch"]
  }
};

export const STARTER_KEYS = ["lucario", "mimikyu", "volcarona", "meowscarada"];

// Pool the trainer areas pick 2-random-from for each area (no repeats across
// areas - see gameState.js). Every entry here is a fully-evolved, non-legendary
// species with a real base stat total well over 300 (most are 480-600+), so the
// pool doubles as a "strong pokemon only" filter without needing a live stats
// lookup. Gardevoir/Diancie/Whimsicott are excluded on purpose - they're the
// area 4 final boss's fixed team (see FINAL_BOSS_TEAM in WorldScene.js).
export const WILD_POOL_KEYS = [
  "charizard", "blastoise", "venusaur", "gengar", "snorlax", "tyranitar",
  "metagross", "salamence", "garchomp", "alakazam", "dragonite", "machamp",
  "arcanine", "umbreon", "togekiss", "gyarados", "lapras", "aerodactyl",
  "kingdra", "milotic", "excadrill", "hydreigon", "chandelure", "krookodile",
  "conkeldurr", "serperior", "emboar", "samurott", "sylveon", "espeon",
  "vaporeon", "jolteon", "flareon", "leafeon", "glaceon", "zoroark",
  "bisharp", "aegislash", "goodra", "kommoo", "toxapex", "incineroar",
  "primarina", "decidueye", "corviknight", "dragapult", "grimmsnarl",
  "copperajah", "hatterene", "cinderace", "rillaboom", "toxtricity"
];

export function pickRandomPair(excludeKeys = []) {
  const pool = WILD_POOL_KEYS.filter((k) => !excludeKeys.includes(k));
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 2);
}
