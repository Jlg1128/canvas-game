class Plane extends GameObjectBase {
  /**
   * @param {CanvasRenderingContext2D} ctx  - The shape is the same as SpecialType above
   */
  constructor(ctx, x, y, type, speed) {
    super(ctx, x, y);
    this.width = 24;
    this.height = 24;
    this.status = 'init';
    /**
    * @type {'fireInBurst' | '3-round' | 'strafe' | '万剑'} // 单发 三连发 扫射
    */
    this.burstMode = 'fireInBurst';
    // 子弹剩余数量
    this.bulletsCount = 100000;
    /**
    * @type {Array<Bullet>}
    */
    this.bullets = [];
    /** @type {'good'|'bad'}*/
    this.type = type || 'good';
    if (this.type === 'good') {
      this.rotateRad = 0;
    } else {
      this.rotateRad = Math.PI;
    }
  }

  init() {
    this.attackSpeed = 1; // 攻速
    this.level = 1; // 等级
    this.speed = 5; // 移速
    this.blood = 5; // 五格血
    this.status = 'init';
    this.bulletsCount = 20;
  }
  
  // 受到攻击
  beAttacked() {
    this.blood--;
    if (this.blood <= 0) {
      this.destory();
    }
  }

  levelUp() {
    this.level ++;
    if (this.level === 2 || this.level === 3) {
      this.burstMode = '3-round'
    } else if (this.level < 7) {
      this.burstMode = 'strafe';
    } else {
      this.burstMode = '万剑';
    }
    this.attackSpeed += 1;
    this.speed += 10;
  }

  // 换弹
  reloadMagazine() {
    let bulletsCount = 0;
    switch (this.burstMode) {
      case 'fireInBurst':
        bulletsCount = 1;
        break;
      case '3-round':
        bulletsCount = 3;
        break;
      case 'strafe':
        bulletsCount = 11;
        break;
      case '万剑':
        bulletsCount = 40;
        break;
      default:
        bulletsCount = 0;
        break;
    }
    if (this.burstMode !== '万剑') {
      if (this.bulletsCount <= bulletsCount) {
        bulletsCount = this.bulletsCount;
      }
      this.bulletsCount -= bulletsCount;
    }
    return this.loadBullets(bulletsCount);
  }

  // 装弹
  loadBullets(count = 1) {
    this.bullets = this.bullets.filter(item => item.status !== 'destoryed');
    let center = Math.floor(count / 2);
    console.log(center);
    for (let i = 0; i < count; i++) {
      let rad = (i - center) * 10 * Math.PI / 180 + this.rotateRad;
      this.bullets.push(new Bullet(this.ctx, this.x, this.getY(), 10, rad));
    }
    return Promise.all(this.bullets.map(item => item.load()));
  }

  load() {
    return new Promise((resolve) => {
      let promiseArr = [loadImage('ship.png')];
      Promise.all([loadImage('ship.png'), this.reloadMagazine()])
      .then(([plane]) => {
        this.image = plane;
        this.loading = false;
        resolve(true);
        setInterval(() => {
          this.reloadMagazine();
        }, 1 / this.attackSpeed * 1000);
      })
    })
  }

  move(direction) {
    let {speed, ctx: {canvas}} = this;
    switch (direction) {
      case 'left':
        this.x -= speed;
        break;
      case 'right':
        this.x += speed;
        break;
      case 'up':
        this.y += speed;
        break;
      case 'down':
        this.y -= speed;
        break;
      default:
        break;
    }
    if (this.x <= 0) this.x = 0;
    if (this.x >= canvas.width - this.width) this.x = canvas.width - this.width;
    if (this.y <= 0) this.y = 0;
    if (this.y >= canvas.height - this.height) this.y = canvas.height - this.height;
  }

  draw() {
    let planePosition = {x: this.x, y: this.y};
    let sourceX;
    if (this.type === 'bad') {
      sourceX = (this.level - 1 + 4) * 24;
    } else if (this.type === 'good') {
      sourceX = (this.level - 1) * 24;
    }
    let sourceY = 0;
    let planePositionX = planePosition.x;
    let planePositionY = this.getY();
    let plane = this.image;
    if (this.blood <= 0) {
      return;
    }
    if (!this.loading) {
      this.ctx.save();
      this.ctx.translate(planePositionX, planePositionY);
      this.ctx.rotate(this.rotateRad);
      // this.ctx.drawImage(
      //   image,
      //   -this.width / 2 + 1,
      //   -this.height / 2,
      //   this.width * this.scale,
      //   this.height * this.scale,
      // );
      this.ctx.drawImage(plane, sourceX, sourceY, this.width, this.width, -this.width / 2, -this.height / 2, this.width, this.height);
      // this.ctx.drawImage(plane, sourceX, sourceY, 24, 24, 0, 0, this.width, this.height);
      this.ctx.restore();
      this.bullets.forEach(bullet => {
        // if (bullet.status !== 'destoryed') {
          bullet.draw();
        // }
      });
    }
  }

  destory() {

  }
}

class Bullet extends GameObjectBase {
  constructor(ctx, x, y, speed, rotateRad) {
    super(...arguments);
    this.width = 70;
    this.height = 70;
    this.rotateRad = rotateRad;
    this.scale = 1;
    this.init();
  }

  init(degree) {
  }

  load() {
    return new Promise((resolve) => {
      loadImage('plasma.png').then(bullet => {
        this.image = bullet;
        this.loading = false;
        resolve(true);
      })
    })
  }

  draw() {
    let image = this.image;

    if (!this.loading) {
      this.ctx.save();
      this.ctx.translate(this.x, this.y);
      this.ctx.rotate(this.rotateRad);
      // this.ctx.drawImage(image, 40, 40, this.width, this.height, this.x, this.y, this.width * scale, this.height * scale);
      this.ctx.drawImage(
        image,
        -this.width / 2 + 1,
        -this.height / 2,
        this.width * this.scale,
        this.height * this.scale,
      );
      this.ctx.restore();
      this.move();
    }
  }

  move() {
    let offsetY = -Math.cos(this.rotateRad) * this.speed;
    let offsetX = Math.sin(this.rotateRad) * this.speed;
    this.x += offsetX;
    this.y += offsetY;
    if (this.outOfRange()) {
      this.status = 'destoryed';
    }
  }
}