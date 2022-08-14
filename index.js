let soundSystem = new SoundSystem('./mp3/');
class PlaneGame {
  /**
   * @param {HTMLCanvasElement}  canvas - A string param.
   * @param {string=} p2 - An optional param (Google Closure syntax)
   */
  constructor(canvas, screenWidth, screenHeight) {
    this.ctx = canvas.getContext('2d');

    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    
    this.loading = true;
    this.backGroundMoveSpeed = 3;
    this.backGroundBeginPostionY = 0;
    this.sound = {};
    this.images = {};
    /** @type {Plane} */
    this.mainPlane = null;
    /** @type {Array<Plane>} */
    this.badPlanes = [];
    this.level = 1;
    this.init();
  }

  beforeStart() {
    return new Promise((res) => {
      this.loadAssetsBeforeStart().then(() => {
        this.loading = false;
        res('Ok');
      })
    })
  }

  init() {
    this.beforeStart().then(res => {
      let controller = new AbortController();
      const signal = controller.signal;
      // bgm 必须要在user interact之后
      window.addEventListener('mousemove', () => {
        this.sound.bgm.play();
        controller.abort();
      }, {signal})
      // 开始游戏
      this.draw();
    })
  }

  update() {

  }

  drawBloodBar(blood) {
    let {ctx} = this;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(1,1,10,10);
    ctx.strokeStyle = '#ffffff';
    ctx.font = '20px serif';
    ctx.strokeText('生命值：' + blood, 20, 50, 100);
  }
  drawRemainingBullets(count) {
    let {ctx} = this;
    ctx.strokeStyle = '#ffffff';
    ctx.font = '12px serif';
    ctx.strokeText('子弹数：' + count, 20, 70, 100);
  }

  draw() {
    this.drawGameBackGround();
    let {ctx, mainPlane, badPlanes} = this;
    mainPlane.draw();
    badPlanes.forEach((badPlane) => {
      if (badPlane.status !== 'destroyed') {
        mainPlane.bullets.forEach(bullet => {
          let testRes = badPlane.hitTest(bullet);
          if (testRes) {
            bullet.destroy();
            badPlane.beAttacked();
            console.log('坏飞机碰撞了', testRes);
          }
        })
      }
      if (mainPlane.status !== 'destroyed') {
        let hitBadPlaneRes = mainPlane.hitTest(badPlane);
        if (hitBadPlaneRes) {
          mainPlane.beAttacked();
          badPlane.beAttacked();
        }
        badPlane.bullets.forEach((bullet) => {
          let testRes = mainPlane.hitTest(bullet);
          if (testRes) {
            bullet.destroy();
            mainPlane.beAttacked();
            console.log('碰撞了', testRes);
          }
        })
      }
      badPlane.draw();
    });
    this.drawBloodBar(mainPlane.blood);
    this.drawRemainingBullets(mainPlane.bulletsCount);
    requestAnimationFrame(this.draw.bind(this));
  }

  drawGameBackGround() {
    this.backGroundBeginPostionY -= this.backGroundMoveSpeed;
    let {backGroundBeginPostionY, images: {backGroundImg}, ctx} = this;
    let {height: canvasHeight, width: canvasWidth} = this.ctx.canvas;
    if (backGroundBeginPostionY  < -canvasHeight) {
      this.backGroundBeginPostionY = 0;
    }
    // first
    ctx.drawImage(backGroundImg, 0, 0, backGroundImg.width, canvasHeight + backGroundBeginPostionY, 0, -backGroundBeginPostionY, canvasWidth, canvasHeight + backGroundBeginPostionY);
    // second
    ctx.drawImage(backGroundImg, 0, canvasHeight + backGroundBeginPostionY, backGroundImg.width, - backGroundBeginPostionY, 0, 0, canvasWidth, - backGroundBeginPostionY);
  }

  handleMoveKeydown(e) {
    let key = e.key.toLowerCase();
    let {mainPlane} = this;
    if (mainPlane.status !== 'destroyed') {
      if (key === 'a') {
        mainPlane.moveMode['left'] = true;
      } else if (key === 'd') {
        mainPlane.moveMode['right'] = true;
      } else if (key === 'w') {
        mainPlane.moveMode['up'] = true;
      } else if (key === 's') {
        mainPlane.moveMode['down'] = true;
      }
    }
  }

  handleMoveKeyup(e) {
    let key = e.key.toLowerCase();
    let {mainPlane} = this;
    if (key === 'a') {
      mainPlane.moveMode['left'] = false;
    } else if (key === 'd') {
      mainPlane.moveMode['right'] = false;
    } else if (key === 'w') {
      mainPlane.moveMode['up'] = false;
    } else if (key === 's') {
      mainPlane.moveMode['down'] = false;
    }
  }
  addMoveEvent() {
    window.addEventListener('keydown', this.handleMoveKeydown.bind(this))
    window.addEventListener('keyup', this.handleMoveKeyup.bind(this))
  }

  loadAssetsBeforeStart() {
    return new Promise(async (res, rej) => {
      let p1 = soundSystem.loadSound('bgm.mp3');
      let p2 = loadImage('bg_1_1.jpg');
      this.mainPlane = new Plane(this.ctx, 100, 100, 'good', 3);
      let loadPlane = this.mainPlane.load();
      this.badPlanes = [];
      for (let i = 0; i < 5; i++) {
        let badPlane = new Plane(this.ctx, Math.random() * this.ctx.canvas.width, (this.ctx.canvas.height - 200) + 200 * Math.random(), 'bad', 0.01)
        this.badPlanes.push(badPlane);
      }
      let loadBadPlanes = this.badPlanes.map(badPlane => badPlane.load());
      Promise.all([p1, p2, loadPlane, loadBadPlanes]).then(([audio, backGroundImg, plane]) => {
        this.sound['bgm'] = audio;  
        audio.setAttribute('autoplay', true);
        audio.setAttribute('loop', true);
        audio.setAttribute('muted', true);
        this.images.backGroundImg = backGroundImg;
        this.addMoveEvent();
        res(true)
      }).catch((err) => {
        console.log('资源加载失败', err || '');
        rej(err)
      })
    })
  }
}