var file = require("./file");
var path = require("path");
const parse5 = require("parse5");
const change = require("./change");
function changeTag(node, setting) {
  let tagmap = {
    block: "div",
    input: "wx-input",
    textarea: "wx-textarea",
    button: "wx-button",
    img: "wx-image",
    text: "wx-text",
    map: "wx-map"
  };
  if (tagmap[node.nodeName]) {
    node.tagName = tagmap[node.nodeName];
  }
  if (node.tagName == "view") {
    node.tagName = "div";
    let class_attr = node.attrs.find(el => el.name == "class");
    if (class_attr) class_attr.value += " _WX_VIEW_";
    else node.attrs.push({ name: "class", value: "_WX_VIEW_" });
  } else if (node.tagName == "template") {
    let is = node.attrs.find(a => a.name == "is");
    if (is) {
      let data = node.attrs.find(a => a.name == "data");
      if (!data) data = { value: "" };
      node.tagName = "wx-template";
      let tdata = data.value.replace(/{{|}}/g, "");
      node.attrs = [{ name: "_TID_", value: is.value }];
      if (tdata) {
        if (tdata.indexOf("...") == -1) tdata = "{" + tdata + "}";
        else tdata = tdata.replace("...", "");
        node.attrs.push(
          {
            name: ":_DATA_",
            value: tdata
          },
          { name: "v-if", value: tdata }
        );
      }
    }
  } else if (node.tagName == "wxs") {
    let src = node.attrs.find(a => a.name == "src");
    let module = node.attrs.find(a => a.name == "module");
    node.tagName = "div";
    if (src && module)
      setting.wxs.push({ src: src.value, module: module.value });
  }
  //webpack会读取img的src来打包图片，image则不行，所以手动加入隐藏的图片
  if (node.tagName == "wx-image") {
    node.attrs.push({ name: "pagepath", value: setting.pagepath });
  }
  if (
    setting.componentsName &&
    setting.componentsName.indexOf(node.tagName) > -1
  ) {
    let id = node.attrs.find(el => el.name == "id");
    if (id) node.attrs.push({ name: "ref", value: id.value });
    else node.attrs.push({ name: "ref", value: node.tagName });
  }
}

function changeAttrs(node, setting) {
  if (!node.attrs) return;
  let attrmap = {
    "wx:if": "v-if",
    "wx:elif": "v-else-if",
    "wx:else": "v-else"
  };
  for (let i = node.attrs.length - 1; i >= 0; i--) {
    let name = node.attrs[i].name;
    let value = node.attrs[i].value;
    //可以直接替换的属性
    if (attrmap[name]) {
      node.attrs[i].name = attrmap[name];
      node.attrs[i].value = value.replace(/{{|}}/g, "");
    }
    //替换事件
    else if (name.indexOf("catch") == 0) {
      let newname = name.replace(/catch:|catch/, "");
      if (newname == "tap") newname = "click";
      node.attrs[i].name = "@" + newname + ".stop";
      node.attrs[i].value = "_FUNC_('" + value + "',$event)";
      if (setting.checkMethods.indexOf(value) == -1)
        setting.checkMethods.push(value);
    } else if (name.indexOf("bind") == 0) {
      let newname = name.replace(/bind:|bind/, "");
      if (newname == "tap") newname = "click";
      node.attrs[i].name = "@" + newname;
      node.attrs[i].value = "_FUNC_('" + node.attrs[i].value + "',$event)";
      if (setting.checkMethods.indexOf(value) == -1)
        setting.checkMethods.push(value);
    }
    //替换style
    else if (name == "style") {
      value = change.css(value);
      if (value.indexOf("{{") > -1) {
        name = ":" + name;
        value = value.replace(/([\-\d\.]+)(rpx)/g, "calc($1rem * 0.01)");
        value = value.replace(/({{)([^{}]+)(}})(rpx)/g, "{{($2) * 0.01}}rem");
        value = "'" + value.replace(/{{/g, "'+(").replace(/}}/g, ")+'") + "'";
      }
      node.attrs[i].name = name;
      node.attrs[i].value = value;
    }
    //替换class
    else if (name == "class") {
      if (value.indexOf("{{") > -1) {
        name = ":" + name;
        value = "'" + value.replace(/{{/g, "'+(").replace(/}}/g, ")+'") + "'";
      }
      node.attrs[i].name = name;
      node.attrs[i].value = value;
    }
    //替换wx:for
    else if (name == "wx:for") {
      node.attrs[i].name = "v-for";
      let value = node.attrs[i].value.replace(/{{|}}/g, "");
      let wxindex = node.attrs.find(el => el.name == "wx:for-index");
      let wxitem = node.attrs.find(el => el.name == "wx:for-item");
      let wxkey = node.attrs.find(el => el.name == "wx:key");
      let index = wxindex ? wxindex.value : "index";
      let item = wxitem ? wxitem.value : "item";
      node.attrs[i].value = `(${item},${index}) in ${value}`;
      let key = wxkey && wxkey.value ? item + "." + wxkey.value : index;
      if (key == item + ".*this") key = item;
      else if (key == item + ".*index") key = index;
      node.attrs.push({ name: ":key", value: key });
    }
    //替换hidden
    else if (name == "hidden") {
      node.attrs[i].name = "v-show";
      node.attrs[i].value = "!" + node.attrs[i].value.replace(/{{|}}/g, "");
      if (node.attrs[i].value == "!") node.attrs[i].value = "false";
    }
    //通用属性替换
    else {
      if (value.indexOf("{{") > -1) {
        let isCommon = /^{{[^{}]+}}$/.test(value.trim());
        node.attrs[i].name = ":" + node.attrs[i].name;
        if (isCommon) {
          node.attrs[i].value = value.replace(/{{|}}/g, "");
        } else {
          let isObject = /^{{\s?{[^{}]+}\s?}}$/.test(value.trim());
          if (isObject)
            node.attrs[i].value = node.attrs[i].value.replace(/{{|}}/g, "");
          else
            node.attrs[i].value =
              "'" +
              node.attrs[i].value.replace(/{{/g, "'+(").replace(/}}/g, ")+'") +
              "'";
        }
        if (node.attrs[i].name.indexOf(":data-") == 0) {
          node.attrs[i].value = `JSON.stringify(${node.attrs[i].value})`;
        }
      }
    }
    if (node.attrs[i].name == "@submit") node.attrs[i].name += ".prevent";
  }
}

function clearNode(node) {
  node.tagName = "div";
  node.childNodes = [];
  node.content = "";
}

function getTemplateContent(node, setting) {
  if (!node) return "";
  node.tagName = "div";
  node.attrs = [];
  exports.format(node.content, setting);
  return parse5.serialize(node.content).replace(/&amp;/g, "&");
}

exports.getTemplate = function(node, curentPath, setting, useImport = true) {
  if (
    !node ||
    node.nodeName.indexOf("#text") > -1 ||
    node.nodeName.indexOf("#comment") > -1
  )
    return;
  if (node.nodeName == "import" && useImport) {
    let path =
      curentPath + "/../" + node.attrs.find(a => a.name == "src").value;
    let importedFile = file.readFile(path);
    let importedDom = parse5.parseFragment(importedFile);
    exports.getTemplate(importedDom, path, setting, false);
    clearNode(node);
  } else if (node.nodeName == "template") {
    let name = node.attrs.find(a => a.name == "name");
    if (name) {
      setting.templates[name.value] = getTemplateContent(node, setting);
      clearNode(node);
    }
  }
  for (var i in node.childNodes) {
    exports.getTemplate(node.childNodes[i], curentPath, setting);
  }
};

exports.format = function(node, setting) {
  if (
    !node ||
    node.nodeName.indexOf("#text") > -1 ||
    node.nodeName.indexOf("#comment") > -1
  )
    return;
  changeTag(node, setting);
  changeAttrs(node, setting);
  for (var i in node.childNodes) {
    exports.format(node.childNodes[i], setting);
  }
};
