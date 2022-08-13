class GameObjectBase {
  /**
   * @param {CanvasRenderingContext2D} ctx  - The shape is the same as SpecialType above
   * @param {{x: number, y: number}} imageOffset   - The shape is the same as SpecialType above
   */
  constructor(ctx, x, y, speed, imageOffset) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.speed = speed || 5;
    /** @type {'init' | 'destoryed'} */
    this.status = 'init';
    this.imageOffset = imageOffset || {x: 0, y: 0};
    this.loading = true;
    this.init();
  }

  init() {

  }


  load() {
    return new Promise((resolve) => {
      resolve(true);
    })
  }

  getY() {
    return this.ctx.canvas.height - this.y ;
  }

  destory() {
    
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

  draw() {

  }
}