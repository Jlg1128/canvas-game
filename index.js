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
    this.backGroundImg = null;
    this.backGroundMoveSpeed = 3;
    this.backGroundBeginPostionY = 0;
    this.init();
  }
  init() {
    this.beforeStart().then(res => {
      this.draw();
      // 开始游戏
    }).catch(err => {
      console.log(err);
    });
  }
  beforeStart() {
    return new Promise((res, rej) => {
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
    let {backGroundBeginPostionY, backGroundImg, ctx} = this;
    let {height: canvasHeight, width: canvasWidth} = this.canvas;
    if (backGroundBeginPostionY  < -canvasHeight) {
      this.backGroundBeginPostionY = 0;
    }
    // first
    ctx.drawImage(backGroundImg, 0, 0, backGroundImg.width, canvasHeight + backGroundBeginPostionY, 0, -backGroundBeginPostionY, canvasWidth, canvasHeight + backGroundBeginPostionY);
    // second
    ctx.drawImage(backGroundImg, 0, canvasHeight + backGroundBeginPostionY, backGroundImg.width, - backGroundBeginPostionY, 0, 0, canvasWidth, - backGroundBeginPostionY);
    requestAnimationFrame(this.draw.bind(this));
  }
  loadAssetsBeforeStart() {
    return new Promise((res, rej) => {
      this.loadBackGround().then((img) => {
        this.backGroundImg = img;
        res(img);
      })
    })
  }
  loadBackGround() {
    return new Promise((res, rej) => {
      let img = document.createElement('img');
      img.src = './image/bg_1_1.jpg';
      img.onload = function(e) {
        res(img)
      }
    })
  }
  hitTest() {

  }
}