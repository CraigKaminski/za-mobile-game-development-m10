export class Game extends Phaser.State {
  private blocks: Phaser.Group;
  private currentLevel: string;
  private readonly MAX_DISTANCE_SHOOT = 190;
  private readonly MAX_SPEED_SHOOT = 1000;
  private readonly SHOOT_FACTOR = 12;

  public init(currentLevel: string) {
    this.currentLevel = currentLevel ? currentLevel : 'level1';

    this.physics.p2.gravity.y = 1000;
  }

  public create() {
    const sky = this.add.tileSprite(0, 0, this.world.width, this.world.height, 'sky');
    this.game.world.sendToBack(sky);

    this.blocks = this.add.group();
    this.blocks.enableBody = true;
    this.blocks.physicsBodyType = Phaser.Physics.P2JS;
  }

  private gameOver() {
    this.state.start('Game', true, false, this.currentLevel);
  }
}
