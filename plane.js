class Plane extends GameObjectBase {
  /**
   * @param {CanvasRenderingContext2D} ctx  - The shape is the same as SpecialType above
   */
  constructor(ctx, x, y, type, speed) {
    super(ctx, x, y, speed);
    this.width = 24;
    this.height = 24;
    /**
    * @type {'init' | 'destroyed'}
    */
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
    this.init();
  }

  init(x, y) {
    this.level = 1; // 等级
    this.status = 'init';
    if (this.type === 'bad') {
      this.speed = 3;
      this.blood = 1;
      this.rotateRad = Math.PI;
      this.attackSpeed = 6; // 攻速
    } else {
      this.speed = 3;
      this.blood = 1;
      this.rotateRad = 0;
      this.attackSpeed = 20; // 攻速
    }
    if (x) {
      this.x = x;
    }
    if (y) {
      this.y = y;
    }
    this.bulletsCount = 20;
    this.boomAnimate = {
      boomFrameCount: 14,
      boomFrameIndex: 1,
      width: 64,
      height: 64,
      position: {
        x: 0,
        y: 0
      },
      intervalFrameIndex: 1,
      intervalFrameCount: 2, // 每两帧执行一次 500ms / 14 / 16.6
    }
    this.burstMode = 'fireInBurst';
    this.bulletsCount = 100000;
  }
  
  // 受到攻击
  beAttacked(destroyedCb) {
    this.blood--;
    if (this.blood <= 0) {
      destroyedCb && destroyedCb();
      this.destroy(true);
    }
  }

  levelUp() {
    this.level ++;
    if (this.type === 'good') {
      if (this.level < 3) {
        this.burstMode = 'fireInBurst'
      }
      else if (this.level >= 3 && this.level <= 6) {
        this.burstMode = '3-round'
      } else if (this.level <= 9) {
        this.burstMode = 'strafe';
      } else {
        this.burstMode = '万剑';
      }
    }
    this.attackSpeed += 1;
    this.speed += 1;
  }

  // 换弹
  reloadMagazine() {
    if (this.status === 'destroyed') {
      return;
    }
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
    this.bullets = this.bullets.filter(item => item.status !== 'destroyed');
    let center = Math.floor(count / 2);
    for (let i = 0; i < count; i++) {
      let rad = (i - center) * 10 * Math.PI / 180 + this.rotateRad;
      this.bullets.push(new Bullet(this.ctx, this.x, this.y, this.attackSpeed, rad, this.type));
    }
    return Promise.all(this.bullets.map(item => item.load()));
  }

  load() {
    return new Promise((resolve) => {
      Promise.all([loadImage('ship.png'), loadImage('explosion.png'), this.reloadMagazine()])
      .then(([plane, explosionImage]) => {
        this.image = plane;
        this.explosionImage = explosionImage;
        this.loading = false;
        resolve(true);
        setInterval(() => {
          this.reloadMagazine();
        }, 1 / this.attackSpeed * 5000);
      })
    })
  }

  setBadPlaneMoveMode() {
    let y = this.getY();
    let x = this.x;
    let canvas = this.ctx.canvas;
    this.moveMode['down'] = true;
    if (x + this.width / 2 >= canvas.width ) {
      this.moveMode.left = true;
      this.moveMode.right = false;
    } else if (x - this.width / 2 < 0) {
      this.moveMode.right = true;
      this.moveMode.left = false;
    } else if (!this.moveMode.right && !this.moveMode.left) {
      let flag = Math.round(Math.random()) === 1;
      this.moveMode.right = flag;
      this.moveMode.left = !flag;
    }
  }

  move(direction, hasLimit) {
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
    if (hasLimit) {
      if (this.x <= this.width / 2) this.x = this.width / 2;
      if (this.x >= canvas.width - this.width / 2) this.x = canvas.width - this.width / 2;
      if (this.y <= this.height / 2) this.y = this.height / 2;
      if (this.y >= canvas.height - this.height / 2) this.y = canvas.height - this.height / 2;
    }
    if (this.outOfRange()) {
      this.destroy();
    }
  }

  draw() {
    if (!this.loading) {
      if (this.status === 'destroyed') {
        this.boom(this.x, this.getY());
      } else {
        let sourceX;
        if (this.type === 'bad') {
          sourceX = Math.min((this.level - 1 + 4) * 24, 144) ;
          this.setBadPlaneMoveMode();
        } else if (this.type === 'good') {
          sourceX = Math.min((this.level - 1) * 24, 144) ;
        }
        Object.keys(this.moveMode).forEach(direction => {
          this.moveMode[direction] && this.move(direction, this.type === 'good');
        })
        let sourceY = 0;
        let plane = this.image;
        this.ctx.save();
        this.ctx.translate(this.x, this.getY());
        this.ctx.rotate(this.rotateRad);
        if (window.ed) {
          this.ctx.fillStyle = 'red';
          this.ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height)
        }
        this.ctx.drawImage(plane, sourceX, sourceY, this.width, this.height, -this.width / 2, -this.height / 2, this.width, this.height);
        this.ctx.restore();
      }
      this.bullets.forEach(bullet => {
        bullet.draw();
      });
    }
  }

  boom(x, y, firstEnter) {
    if (firstEnter) {
      let p1 = soundSystem.loadSound('boom.mp3');
      p1.then(audio => {
        audio.play();
      });
    }
    let {
      boomFrameCount,
      boomFrameIndex,
      width: imageWidth,
      height: imageHeight,
      intervalFrameIndex,
      intervalFrameCount,
    } = this.boomAnimate;

    let {explosionImage} = this;
    if (boomFrameIndex > boomFrameCount) {
      return;
    }
    if (intervalFrameIndex !== 1 && intervalFrameIndex < intervalFrameCount) {
      this.boomAnimate.intervalFrameIndex += 1;
      return;
    } else if (intervalFrameIndex >= intervalFrameCount) {
      this.boomAnimate.intervalFrameIndex = 1;
    }
    this.boomAnimate.boomFrameIndex ++;
    this.boomAnimate.intervalFrameIndex += 1;
    let sourceX = (boomFrameIndex - 1) * imageWidth;

    let sourceY = 0;
    this.ctx.drawImage(explosionImage, sourceX, sourceY, imageWidth, imageHeight, x - imageWidth / 2, y -imageHeight / 2, imageWidth, imageHeight);
  }
  destroy(beAttacked) {
    this.status = 'destroyed';
    if (beAttacked) {
      this.boom(this.x, this.getY(), true);
    }
    setTimeout(() => {
      if (this.type === 'good') {
        this.init(); // reburn
      } else {
        this.init(Math.random() * this.ctx.canvas.width, (this.ctx.canvas.height - 200) + 200 * Math.random());
      }
    }, 1000);
  }
}

class Bullet extends GameObjectBase {
  constructor(ctx, x, y, speed, rotateRad, source) {
    super(...arguments);
    this.width = 70;
    this.height = 70;
    this.rotateRad = rotateRad;
    this.scale = 1;
    this.type = source;
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

    if (!this.loading && this.status !== 'destroyed') {
      this.ctx.save();
      this.ctx.translate(this.x, this.getY());
      this.ctx.rotate(this.rotateRad);
      if (window.ed) {
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(-this.width / 2 + 1, -this.height / 2, this.width * this.scale, this.height * this.scale)
      }
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
    this.y -= offsetY;
    if (this.outOfRange()) {
      this.status = 'destroyed';
    }
  }

  hitCallback() {
    this.destroy();
  }
}