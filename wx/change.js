const file = require("./file");
const html = require("./html");
const js = require("./js");
const parse5 = require("parse5");

function getCheckData(data, setting) {
  let match = data.match(/{{[^{}]+}}/g);
  for (let i in match) {
    let m = match[i];
    m = m
      .replace(/{|}|\(|\)|!|'.?'/g, "")
      .trim()
      .replace(/[\+\-\=\&\|\?\>\<]/g, ".");
    m = m.split(".")[0];
    m = m.replace(/.+\:/g, "");
    if (m && m != "data" && setting.checkData.indexOf(m) == -1)
      setting.checkData.push(m.trim());
  }
}

exports.html = function(_path, setting) {
  let data = file.readFile(_path);
  getCheckData(data, setting);
  let dom = parse5.parseFragment(data);
  html.getTemplate(dom, _path, setting);
  html.format(dom, setting);
  let result = parse5.serialize(dom).replace(/&amp;/g, "&");
  return result;
};
exports.js = function(jspath, setting) {
  let jsdata = file.readFile(jspath);
  return js.js(jsdata, setting);
};
exports.css = function(css) {
  //rpx转rem
  css = css.replace(/([\-\d\.]+)(rpx)/g, "calc($1rem * 0.01)");
  //image标签转模拟组件class
  css = css.replace(/([\s\n\{\}]+|^|\*\/)(image)([\s\n\.\{\:]+)/g, "$1._WX_IMAGE_$3");
  //view标签转模拟组件class
  css = css.replace(/([\s\n\{\}]+|^|\*\/)(view)([\s\n\.\{\:]+)/g, "$1._WX_VIEW_$3");
  //text标签转模拟组件class
  css = css.replace(/([\s\n\{\}]+|^|\*\/)(text)([\s\n\.\{\:]+)/g, "$1._WX_TEXT_$3");
  //scroll-view标签转模拟组件class
  css = css.replace(/([\s\n\{\}]+|^|\*\/)(scroll-view)([\s\n\.\{\:]+)/g, "$1._WX_SCROLL_VIEW_$3");
  //page标签转模拟组件class
  css = css.replace(/([\s\n\{\}]+|^|\*\/)(page)([\s\n\.\{\:]+)/g, "$1._WX_PAGE_VIEW_$3");
  //navigator标签转模拟组件class
  css = css.replace(
    /([\s\n\{\}]+|^|\*\/)(navigator)([\s\n\.\{\:]+)/g,
    "$1._WX_NAVIGATOR_$3"
  );
  //cover-view标签转模拟组件class
  css = css.replace(
    /([\s\n\{\}]+|^|\*\/)(cover-view)([\s\n\.\{\:]+)/g,
    "$1._WX_COVER_VIEW_$3"
  );
  //map标签转模拟组件class
  css = css.replace(/([\s\n\{\}]+|^|\*\/)(map)([\s\n\.\{\:]+)/g, "$1._WX_MAP_$3");
  //positon:fixed调整位置
  css = css.replace(
    /(position:fixed)([^}]+top:)/g,
    "position:fixed;transform:translateY(1.16rem)$2"
  );
  css = css.replace(
    /(position:fixed)([^}]+bottom:)/g,
    "position:fixed;hasbottom:0$2"
  );
  css = css.replace(
    /position:fixed;hasbottom:0;transform:translateY\(1\.16rem\)/g,
    "position:fixed"
  );
  return css;
};
