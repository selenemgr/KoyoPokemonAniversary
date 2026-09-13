// Phaser's sound manager is global to the game (shared across all scenes), so
// a track started in one scene keeps playing seamlessly when another scene
// takes over - this module just tracks which one is "current" so switching
// scenes doesn't restart a track that's already playing.
let current = null; // { key, sound }

export function playMusic(scene, key, volume = 0.02) {
  if (current && current.key === key && current.sound.isPlaying) return;

  if (current && current.key !== key) {
    current.sound.stop();
  }

  let sound = scene.sound.get(key);
  if (!sound) {
    sound = scene.sound.add(key, { loop: true, volume });
  }
  sound.play();
  current = { key, sound };
}

export function stopMusic() {
  if (current) {
    current.sound.stop();
    current = null;
  }
}
