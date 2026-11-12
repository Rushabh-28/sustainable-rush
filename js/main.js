/* Sustainable Rush - entry point */
window.addEventListener('load', () => {
  Save.load();

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game-container',
    width: GAME_W,
    height: GAME_H,
    backgroundColor: '#0b3d2e',
    scale: {
      mode: Phaser.Scale.FIT,            // scales to any screen, keeps the aspect ratio
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    audio: { noAudio: true },            // sounds are synthesised in audio.js
    render: { antialias: true },
    scene: [BootScene, MenuScene, GameScene, ResultScene]
  });

  window.__game = game;                  // handy for debugging in the browser console
});
