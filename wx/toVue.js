var file = require("./file");
var path = require("path");
var js = require("./js");
var change = require("./change");

let templePath = path.join(__dirname, "temple");
//首先拷贝文件夹
var args = process.argv.splice(2);
let fromPath = path.join(__dirname, "../" + args[0]);
let toPath = path.join(__dirname, "../src");
file.clearDir(toPath);
file.readDir(fromPath).forEach(function(f) {
  if (f.indexOf(".") != 0) {
    let _path = path.join(fromPath, f);
    if (file.isDir(_path)) {
      file.copyDir(_path, path.join(toPath, f));
    } else if (
      file.getFileExt(_path) == "js" &&
      file.getFileBaseName(_path) != "app"
    ) {
      file.writeFile(path.join(toPath, f), file.readFile(_path));
    }
  }
});
//读取项目配置
let appJson = JSON.parse(file.readFile(path.join(fromPath, "app.json")));
let extJson = file.exist(path.join(fromPath, "ext.json"))
  ? JSON.parse(file.readFile(path.join(fromPath, "ext.json")))
  : {};
let temple_json = file.readFile(path.join(templePath, "json.js"));
let jsonData = JSON.stringify(Object.assign(appJson, extJson));
file.writeFile(
  path.join(toPath, "json.js"),
  temple_json.replace("{{1}}", jsonData)
);
//拷贝wx转换库
file.copyDir(path.join(templePath, "wx-core"), path.join(toPath, "wx-core"));
file.writeFile(
  path.join(toPath, "main.js"),
  file.readFile(path.join(templePath, "main.js"))
);
//转化
let temple_page = file.readFile(path.join(templePath, "Page.vue"));
let temple_router = file.readFile(path.join(templePath, "router.js"));
let temple_router_2 = "";
let temple_router_3 = "";
function transform(pagepath) {
  let jspath = pagepath + ".js";
  if (!file.exist(jspath)) return;
  let wxmlpath = pagepath + ".wxml";
  let jsonpath = pagepath + ".json";
  let stylepath = pagepath + ".wxss";
  let setting = {};
  if (file.exist(jsonpath)) {
    let jsonfiledata = file.readFile(jsonpath);
    if (jsonfiledata) setting = JSON.parse(jsonfiledata);
  }
  if (setting.usingComponents) {
    setting.componentsName = [];
    for (let c in setting.usingComponents) {
      setting.componentsName.push(c);
      let cpath = path.join(pagepath + "/..", setting.usingComponents[c]);
      if (cpath == pagepath) continue;
      transform(cpath, false);
    }
  }
  setting.pagepath = path.relative(toPath, pagepath);
  setting.templates = {};
  setting.checkData = [];
  setting.checkMethods = [];
  setting.wxs = [];
  let temple_vue_1 = change.html(wxmlpath, setting);
  let temple_vue_2 = change.js(jspath, setting);
  let temple_vue_3 = file.exist(stylepath)
    ? change.css(file.readFile(stylepath))
    : "";
  let pageData = temple_page
    .replace("{{1}}", temple_vue_1)
    .replace("{{2}}", temple_vue_2)
    .replace("{{3}}", temple_vue_3);
  file.writeFile(pagepath + ".vue", pageData);
  file.deletFile(jspath);
  file.deletFile(wxmlpath);
  file.deletFile(jsonpath);
  file.deletFile(stylepath);
}
appJson.pages.forEach(function(f) {
  let f_name = path.basename(f).replace(/-/g, "_");
  //加入路由
  if (!temple_router_2)
    temple_router_2 = `{
          path: '',
          redirect: '/${f}'
      },`;
  temple_router_3 += `{
      path: '/${f}',
      component:() => import('../${f}')
  },`;
  //进行转化
  let pagepath = path.join(toPath, f);
  transform(pagepath);
});
//处理路由
let routerData = temple_router
  .replace("{{2}}", temple_router_2)
  .replace("{{3}}", temple_router_3);
file.writeFile(path.join(toPath, "router/router.js"), routerData);
//导入总样式
let globalCss = change.css(file.readFile(path.join(fromPath, "app.wxss")));
file.writeFile(path.join(toPath, "app.wxss"), globalCss);
//收集本地图片资源
let locaclPics = file.getImageFiles(toPath, []);
//处理入口app
let appData = file.readFile(path.join(templePath, "App.vue"));
let appImgPlaceHolder = '<div id="_IMG_PLACEHOLDER_" style="display:none">';
for (let i in locaclPics) {
  let imgpath = file.formatPath(path.relative(toPath, locaclPics[i]));
  appImgPlaceHolder += `<img src="${imgpath}" hiddensrc="${imgpath}"/>`;
}
appImgPlaceHolder += "</div>";
let appJsData = file.readFile(path.join(fromPath, "app.js"));
appJsData = appJsData.replace(
  /[\s\t\n]*App[\s\t\n]*\([\s\t\n]*{/,
  "\nexport default App({"
);
appData = appData.replace("--0--", appImgPlaceHolder);
appData = appData.replace("--1--", js.fixPath(appJsData));
file.writeFile(path.join(toPath, "App.vue"), appData);
