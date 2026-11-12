/* BootScene - builds every icon texture from SVG, then opens the menu. */
class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  create() {
    this.cameras.main.setBackgroundColor('#0b3d2e');
    const label = addText(this, GAME_W / 2, GAME_H / 2, 'Planting trees...', 22, '#C8E6C9', { ox: 0.5, oy: 0.5 });
    this.tweens.add({ targets: label, alpha: 0.4, duration: 500, yoyo: true, repeat: -1 });

    buildAllTextures(this.textures).then(() => {
      const loader = document.getElementById('loading');
      if (loader) loader.remove();
      this.scene.start('Menu');
    });
  }
}
