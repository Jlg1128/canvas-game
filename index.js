let soundSystem = new SoundSystem('./mp3/');
class PlaneGame {
  /**
   * @param {HTMLCanvasElement}  canvas - A string param.
   * @param {string=} p2 - An optional param (Google Closure syntax)
   */
  constructor(canvas, screenWidth, screenHeight) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    
    this.loading = true;
    this.backGroundMoveSpeed = 3;
    this.backGroundBeginPostionY = 0;
    this.sound = {};
    this.images = {};
    this.level = 1;
    this.init();
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
  beforeStart() {
    return new Promise((res) => {
      this.loadAssetsBeforeStart().then(() => {
        this.loading = false;
        res('Ok');
      })
    })
  }

  update() {

  }

  draw() {
    this.backGroundBeginPostionY -= this.backGroundMoveSpeed;
    let {backGroundBeginPostionY, images: {backGroundImg}, ctx} = this;
    let {height: canvasHeight, width: canvasWidth} = this.canvas;
    if (backGroundBeginPostionY  < -canvasHeight) {
      this.backGroundBeginPostionY = 0;
    }
    // first
    ctx.drawImage(backGroundImg, 0, 0, backGroundImg.width, canvasHeight + backGroundBeginPostionY, 0, -backGroundBeginPostionY, canvasWidth, canvasHeight + backGroundBeginPostionY);
    // second
    ctx.drawImage(backGroundImg, 0, canvasHeight + backGroundBeginPostionY, backGroundImg.width, - backGroundBeginPostionY, 0, 0, canvasWidth, - backGroundBeginPostionY);
    this.drawPlane(1, {x: 100, y: 50});
    this.drawPlane(3, {x: 200, y: 50});
    this.drawPlane(5, {x: 300, y: 50});
    requestAnimationFrame(this.draw.bind(this));
  }

  drawPlane(level = 1, planePosition) {
    planePosition = planePosition || {x: 100, y: 30}
    let sourceX = (level - 1) * 24;
    let sourceY = 0;
    let planeWidth = 24;
    let planeHeight = 24;
    let planePositionX = planePosition.x;
    let planePositionY = this.canvas.height - planePosition.y - planeHeight;
    let {plane} = this.images;
    this.ctx.drawImage(plane, sourceX, sourceY, planeWidth, planeHeight, planePositionX, planePositionY, planeWidth, planeHeight);
  }
  loadAssetsBeforeStart() {
    return new Promise(async (res, rej) => {
      let p1 = soundSystem.loadSound('bgm.mp3');
      let p2 = this.loadImage('bg_1_1.jpg');
      let p3 = this.loadImage('ship.png');
      Promise.all([p1, p2, p3]).then(([audio, backGroundImg, plane]) => {
        this.sound['bgm'] = audio;
        audio.setAttribute('autoplay', true);
        audio.setAttribute('loop', true);
        audio.setAttribute('muted', true);
        this.images.backGroundImg = backGroundImg;
        this.images.plane = plane;
        res(true)
      }).catch((err) => {
        console.log('资源加载失败', err || '');
        rej(err)
      })
    })
  }
  loadImage(imageName) {
    let imageBase = './image/';
    return new Promise((res, rej) => {
      let img = document.createElement('img');
      img.src = imageBase + imageName;;
      img.onload = function(e) {
        res(img)
      }
    })
  }
  hitTest() {

  }
}