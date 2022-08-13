const assetCache = {
}
function loadImage(imageName) {
  let imageBase = './image/';
  if (assetCache[imageName]) {
    return Promise.resolve(assetCache[imageName]);
  }
  return new Promise((res, rej) => {
    let img = document.createElement('img');
    img.src = imageBase + imageName;;
    img.onload = function(e) {
      res(img)
    }
  })
}