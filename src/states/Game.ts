const MAX_DISTANCE_SHOOT = 190;
const MAX_SPEED_SHOOT = 1000;
const SHOOT_FACTOR = 12;

interface IBlock {
  asset: string;
  mass: number;
  x: number;
  y: number;
}

interface IEnemy {
  asset: string;
  x: number;
  y: number;
}

interface ILevelData {
  blocks: IBlock[];
  enemies: IEnemy[];
}

export class Game extends Phaser.State {
  private blocks: Phaser.Group;
  private blocksCollisionGroup: Phaser.Physics.P2.CollisionGroup;
  private chickensCollisionGroup: Phaser.Physics.P2.CollisionGroup;
  private currentLevel: string;
  private enemiesCollisionGroup: Phaser.Physics.P2.CollisionGroup;
  private floor: Phaser.TileSprite;

  public init(currentLevel: string) {
    this.currentLevel = currentLevel ? currentLevel : 'level1';

    this.physics.p2.gravity.y = 1000;

    this.blocksCollisionGroup = this.physics.p2.createCollisionGroup();
    this.enemiesCollisionGroup = this.physics.p2.createCollisionGroup();
    this.chickensCollisionGroup = this.physics.p2.createCollisionGroup();
  }

  public create() {
    const sky = this.add.tileSprite(0, 0, this.world.width, this.world.height, 'sky');
    this.game.world.sendToBack(sky);

    this.blocks = this.add.group();
    this.blocks.enableBody = true;
    this.blocks.physicsBodyType = Phaser.Physics.P2JS;

    const floor = this.add.tileSprite(this.world.width / 2, this.world.height - 24, this.world.width, 48, 'floor');
    this.blocks.add(floor);
    floor.body.setCollisionGroup(this.blocksCollisionGroup);
    floor.body.collides([this.blocksCollisionGroup, this.enemiesCollisionGroup, this.chickensCollisionGroup]);
    floor.body.static = true;

    this.loadLevel();
  }

  private createBlock(data: IBlock) {
    const block = new Phaser.Sprite(this.game, data.x, data.y, data.asset);
    this.blocks.add(block);
    block.body.mass = data.mass;
    block.body.setCollisionGroup(this.blocksCollisionGroup);
    block.body.collides([this.blocksCollisionGroup, this.enemiesCollisionGroup, this.chickensCollisionGroup]);
  }

  private gameOver() {
    this.state.start('Game', true, false, this.currentLevel);
  }

  private loadLevel() {
    const levelData: ILevelData = JSON.parse(this.game.cache.getText(this.currentLevel));

    levelData.blocks.forEach((block: IBlock) => {
      this.createBlock(block);
    });
  }
}
