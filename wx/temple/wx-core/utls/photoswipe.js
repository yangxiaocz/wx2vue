const PhotoSwipe = require("photoswipe");
const PhotoSwipeUIDefault = require("photoswipe/dist/photoswipe-ui-default");
require("photoswipe/dist/default-skin/default-skin.css");
require("photoswipe/dist/photoswipe.css");

//预读图片获取图片高度
function preload(pics) {
  let i = 0;
  return new Promise((resolve, reject) => {
    if (pics.length == 0) {
      resolve();
      return;
    }
    pics.forEach(function(e) {
      let loadpic = $("<img/>");
      loadpic.attr("src", e.src);
      loadpic[0].onload = function() {
        let width = this.width;
        let height = this.height;
        e.h = (height * screen.availWidth) / width;
        i++;
        if (i == pics.length) resolve();
      };
      loadpic[0].onerror = function() {
        i++;
        if (i == pics.length) resolve();
      };
    });
  });
}

let gallery = null;

export default async function(option) {
  let { current, urls } = option;
  let index = 0;
  if (current) index = urls.indexOf(current);
  if (gallery) {
    gallery.close();
  }
  let screenWidth = screen.availWidth;
  let pics = urls.map(e => {
    return { src: e, w: screenWidth, h: screenWidth };
  });
  await preload(pics);
  var pswpElement = $("#photoswipe-container")[0];
  gallery = new PhotoSwipe(pswpElement, PhotoSwipeUIDefault, pics, {
    index: index,
    history: true,
    fullscreenEl: false,
    shareEl: false
  });
  gallery.init();
}
