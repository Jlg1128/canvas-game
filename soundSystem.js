class SoundSystem {
  constructor(basePath) {
    this.basePath = basePath || '';
  }
  loadSound(assetUrl) {
    return new Promise((res, rej) => {
      let id = 'audioid' + Math.round(Math.random() * 10000);
      let audio = document.createElement('audio');
      audio.setAttribute('id', id);
      audio.src = this.basePath + assetUrl;
      document.body.appendChild(audio);
      res(audio);
    })
  }
}