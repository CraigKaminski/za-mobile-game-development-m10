const KILL_DIFF = 25;
const MAX_DISTANCE_SHOOT = 190;
const MAX_SPEED_SHOOT = 1000;
const SHOOT_FACTOR = 12;

interface IBlockData {
  asset: string;
  mass: number;
  x: number;
  y: number;
}

interface IEnemyData {
  asset: string;
  x: number;
  y: number;
}

interface ILevelData {
  blocks: IBlockData[];
  enemies: IEnemyData[];
}

export class Game extends Phaser.State {
  private blocks: Phaser.Group;
  private blocksCollisionGroup: Phaser.Physics.P2.CollisionGroup;
  private chicken: Phaser.Sprite;
  private chickensCollisionGroup: Phaser.Physics.P2.CollisionGroup;
  private currentLevel: string;
  private enemies: Phaser.Group;
  private enemiesCollisionGroup: Phaser.Physics.P2.CollisionGroup;
  private floor: Phaser.TileSprite;
  private isChickenReady = false;
  private isPreparingShot = false;
  private pole: Phaser.Sprite;

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

    this.enemies = this.add.group();
    this.enemies.enableBody = true;
    this.enemies.physicsBodyType = Phaser.Physics.P2JS;

    const floor = this.add.tileSprite(this.world.width / 2, this.world.height - 24, this.world.width, 48, 'floor');
    this.blocks.add(floor);
    floor.body.setCollisionGroup(this.blocksCollisionGroup);
    floor.body.collides([this.blocksCollisionGroup, this.enemiesCollisionGroup, this.chickensCollisionGroup]);
    floor.body.static = true;

    this.loadLevel();

    this.pole = this.add.sprite(180, 500, 'pole');
    this.pole.anchor.setTo(0.5, 0);

    this.input.onDown.add(this.prepareShot, this);

    this.setupChicken();
  }

  public update() {
    if (this.isPreparingShot) {
      this.chicken.x = this.input.activePointer.x;
      this.chicken.y = this.input.activePointer.y;

      const distance = Phaser.Point.distance(this.chicken.position, this.pole.position);

      if (distance > MAX_DISTANCE_SHOOT) {
        this.isChickenReady = true;
        this.isPreparingShot = false;

        this.chicken.x = this.pole.x;
        this.chicken.y = this.pole.y;
      }

      if (this.input.activePointer.isUp) {
        this.isPreparingShot = false;
        this.throwChicken();
      }
    }
  }

  private createBlock(data: IBlockData) {
    const block = new Phaser.Sprite(this.game, data.x, data.y, data.asset);
    this.blocks.add(block);
    block.body.mass = data.mass;
    block.body.setCollisionGroup(this.blocksCollisionGroup);
    block.body.collides([this.blocksCollisionGroup, this.enemiesCollisionGroup, this.chickensCollisionGroup]);
  }

  private createEnemy(data: IEnemyData) {
    const enemy = new Phaser.Sprite(this.game, data.x, data.y, data.asset);
    this.enemies.add(enemy);
    enemy.body.setCollisionGroup(this.enemiesCollisionGroup);
    enemy.body.collides([this.blocksCollisionGroup, this.enemiesCollisionGroup, this.chickensCollisionGroup]);
    enemy.body.onBeginContact.add(this.hitEnemy.bind(this, enemy));
  }

  private gameOver() {
    this.state.start('Game', true, false, this.currentLevel);
  }

  private hitEnemy(enemy: Phaser.Sprite, body: any, bodyB: any, shapeA: any, shapeB: any, equation: any) {
    const velocityDiff = Phaser.Point.distance(
      new Phaser.Point(equation[0].bodyA.velocity[0], equation[0].bodyA.velocity[1]),
      new Phaser.Point(equation[0].bodyB.velocity[0], equation[0].bodyB.velocity[1]),
    );

    if (velocityDiff > KILL_DIFF) {
      enemy.kill();
    }
  }

  private loadLevel() {
    const levelData: ILevelData = JSON.parse(this.game.cache.getText(this.currentLevel));

    levelData.blocks.forEach((block: IBlockData) => {
      this.createBlock(block);
    });

    levelData.enemies.forEach((enemy: IEnemyData) => {
      this.createEnemy(enemy);
    });
  }

  private prepareShot(event: Phaser.Events) {
    if (this.isChickenReady) {
      this.isChickenReady = false;
      this.isPreparingShot = true;
    }
  }

  private setupChicken() {
    this.chicken = this.add.sprite(this.pole.x, this.pole.y, 'chicken');
    this.chicken.anchor.setTo(0.5);

    this.isChickenReady = true;
  }

  private throwChicken() {
    this.physics.p2.enable(this.chicken);
    this.chicken.body.setCollisionGroup(this.chickensCollisionGroup);
    this.chicken.body.collides([this.blocksCollisionGroup, this.enemiesCollisionGroup, this.chickensCollisionGroup]);
    const diff = Phaser.Point.subtract(this.pole.position, this.chicken.position);
    this.chicken.body.velocity.x = (Math.abs(diff.x) / diff.x) *
      Math.min(Math.abs(diff.x * SHOOT_FACTOR), MAX_SPEED_SHOOT);
    this.chicken.body.velocity.y = (Math.abs(diff.y) / diff.y) *
      Math.min(Math.abs(diff.y * SHOOT_FACTOR), MAX_SPEED_SHOOT);
  }
}
