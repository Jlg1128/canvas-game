class GameObjectBase {
  /**
   * @param {CanvasRenderingContext2D} ctx  - The shape is the same as SpecialType above
   */
  constructor(ctx, x, y, speed) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.speed = speed || 1;
    /** @type {'init' | 'destroyed'} */
    this.status = 'init';
    this.loading = true;
    this.moveMode = {
      'up': false,
      'down': false,
      'left': false,
      'right': false,
    };
  }

  init() {
    this.status = 'init';
    this.speed = 1;
  }


  load() {
    return new Promise((resolve) => {
      resolve(true);
    })
  }

  getY() {
    return this.ctx.canvas.height - this.y;
  }

  destroy() {
    this.status = 'destroyed';
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
  }

  outOfRange() {
    let {canvas} = this.ctx;
    let width = this.width || 0;
    let height = this.height || 0;
    let moreRange = canvas.width / 2;
    // ctx旋转导致提早超出范围，这里扩大范围
    if (this.x <= 0 - moreRange || (this.x + width >= canvas.width + moreRange) || this.y <= 0 - moreRange || (this.y + height >= canvas.height + moreRange)) {
      return true;
    } else {
      return false;
    }
  }

  // 碰撞检测
  hitTest(otherSprite) {
    if (otherSprite.status === 'destroyed') {
      return false;
    }
    var dis = Math.sqrt(Math.pow(this.x - otherSprite.x, 2) + Math.pow(this.getY() - otherSprite.getY(), 2));
    if (dis < this.width / 2) {
      this.hitCallback();
      otherSprite.hitCallback();
      return true;
    }
    return false;
  }

  // 碰撞之后的回调
  hitCallback() {
    
  }

  draw() {
    this.intervalFrameIndex++;
    if (this.intervalFrameIndex >= this.intervalFrameCount) {

    }
  }

  // 设置展示间隔 interval：间隔时长（分钟）
  setDrawInterval(interval = 0, isRandom = true) {
    if (isRandom) {
      this.intervalFrameCount = (Math.random() + 0.5) * interval * 10 * 1000 / 16.6;
    } else {
      this.intervalFrameCount = interval * 10 * 1000 / 16.6;
    }
    this.intervalFrameIndex = 0;
  }
  resetDrawInterval() {
    this.intervalFrameIndex = 0;
  }
}