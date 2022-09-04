class LevelUp extends GameObjectBase {
  constructor(ctx, x, y, speed) {
    super(ctx, x, y, speed);
    this.moveMode = {
      'up': false,
      'down': true,
      'left': false,
      'right': false,
    };
    this.init(x, y);
    this.width = 50;
  }

  init(x, y) {
    this.status = 'init';
    x = x || Math.random() * this.ctx.canvas.width;
    if (x < this.width) {
      x = this.width;
    } else if (x > this.ctx.canvas.width - this.width) {
      x = this.ctx.canvas.width - this.width
    }
    this.x = x;
    this.y = y || this.ctx.canvas.height;
    this.setDrawInterval(0.1, true)
  }

  draw() {
    if (this.intervalFrameIndex >= this.intervalFrameCount) {
      this.ctx.save();
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.font = '12px serif';
      this.ctx.strokeText('LevelUp', this.x - this.width / 2, this.getY(), this.width);
      this.ctx.restore()
      Object.keys(this.moveMode).forEach(direction => {
        this.moveMode[direction] && this.move(direction);
      })
    } else {
      this.intervalFrameIndex ++;
    }

    if (this.outOfRange()) {
      this.destroy();
    }
  }

  hitCallback() {
    this.destroy();
  }

  destroy() {
    super.destroy();
    this.init();
  }
}
