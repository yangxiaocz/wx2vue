var fs = require("fs");
var image = require("imageinfo"); //引用imageinfo模块
var path = require("path");

exports.readFile = _path => {
  console.log(_path);
  let data = fs.readFileSync(_path, "utf8");
  if (exports.getFileExt(_path) == "wxml") {
    //解析工具的缺陷，不能解析不闭合的自定义标签，因此补上
    data = data.replace(/(<import[^<>]+)(\/>)/g, "$1" + "></import>");
    data = data.replace(/(<template[^<>]+)(\/>)/g, "$1" + "></template>");
    data = data.replace(/(<wxs[^<>]+)(\/>)/g, "$1" + "></wxs>");
  }
  return data;
};
exports.writeFile = (_path, data) => {
  let baseUrl = path.dirname(_path);
  if (!fs.existsSync(baseUrl)) {
    fs.mkdirSync(baseUrl);
  }
  fs.writeFileSync(_path, data, "utf8");
};
exports.deletFile = _path => {
  if (exports.exist(_path)) fs.unlinkSync(_path);
};
exports.readDir = _path => {
  return fs.readdirSync(_path, "utf8");
};
exports.isDir = _path => {
  return fs.statSync(_path).isDirectory();
};
exports.exist = _path => {
  return fs.existsSync(_path);
};
exports.getFileName = _path => {
  return path.basename(_path);
};
exports.getFileExt = _path => {
  return path.extname(_path).replace(".", "");
};
exports.getDirPath = _path => {
  return path.dirname(_path);
};
exports.getFileBaseName = _path => {
  return path.basename(_path).replace(path.extname(_path), "");
};

exports.copyDir = (fromPath, toPath) => {
  if (!fs.existsSync(toPath)) {
    fs.mkdirSync(toPath);
  }
  let files = exports.readDir(fromPath);
  files.forEach(function(f) {
    let _fromPath = path.join(fromPath, f);
    let _toPath = path.join(toPath, f);
    if (exports.isDir(_fromPath)) {
      exports.copyDir(_fromPath, _toPath);
    } else {
      let data = fs.readFileSync(_fromPath);
      fs.writeFileSync(_toPath, data);
    }
  });
};

exports.clearDir = function(path) {
  var files = [];
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path);
    files.forEach(function(file, index) {
      var curPath = path + "/" + file;
      if (fs.statSync(curPath).isDirectory()) {
        // recurse
        exports.clearDir(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
  }
};

exports.getImageFiles = (_path, imageList = []) => {
  let files = exports.readDir(_path);
  files.forEach(function(f) {
    if (f.indexOf(".") != 0) {
      let filepath = path.join(_path, f);
      if (exports.isDir(filepath)) {
        exports.getImageFiles(filepath, imageList);
      } else {
        var ms = image(fs.readFileSync(filepath));
        ms.mimeType && imageList.push(filepath);
      }
    }
  });
  return imageList;
};

exports.formatPath = _path => {
  return "./" + _path.replace(/\\|\/|\\\\|\/\//g, "/");
};
