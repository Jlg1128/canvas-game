class SoundSystem {
  constructor(basePath) {
    this.basePath = basePath || '';
    this.cache = {};
  }
  loadSound(assetUrl) {
    if (this.cache[assetUrl] && !this.cache[assetUrl].ended) {
      this.cache[assetUrl].currentTime = 0
      return Promise.resolve(this.cache[assetUrl]);
    }
    return new Promise((res, rej) => {
      let id = 'audioid' + Math.round(Math.random() * 10000);
      let audio = document.createElement('audio');
      audio.setAttribute('id', id);
      audio.src = this.basePath + assetUrl;
      document.body.appendChild(audio);
      this.cache[assetUrl] = audio;
      res(audio);
    })
  }
}