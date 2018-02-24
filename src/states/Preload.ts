export class Preload extends Phaser.State {
  public preload() {
    const preloadBar = this.add.sprite(this.world.centerX, this.world.centerY, 'bar');
    preloadBar.anchor.setTo(0.5);
    preloadBar.scale.setTo(100, 1);

    this.load.setPreloadSprite(preloadBar);

    this.load.image('box', 'images/box.png');
    this.load.image('pig', 'images/pig.png');
    this.load.image('pole', 'images/pole.png');
    this.load.image('chicken', 'images/bird.png');
    this.load.image('floor', 'images/floor.png');
    this.load.image('concreteBox', 'images/concrete-box.png');
    this.load.image('sky', 'images/sky.png');

    this.load.text('level1', 'levels/level1.json');
  }

  public create() {
    this.state.start('Game');
  }
}
