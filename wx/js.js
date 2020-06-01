exports.js = function(jsdata, setting) {
  //分析js代码中的this.data的赋值操作
  let reg = /(_this\.data|this\.data|that\.data|self\.data)\.([^\.\s\(\\)\[\],]+)([\.\s\=\)\[],)/g;
  let matchCheckData = jsdata.match(reg);
  for (let i in matchCheckData) {
    let m = matchCheckData[i].replace(reg, "$2");
    if (setting.checkData.indexOf(m) == -1 && m != "data")
      setting.checkData.push(m.trim());
  }
  //分析js代码中的this.setData赋值操作
  let reg2 = /(\.setData[\s\n\t]?\([\s\n\t]?\{)([^\)]+)(\}\))/g;
  let matchCheckData2 = jsdata.match(reg2);
  for (let i in matchCheckData2) {
    let m = matchCheckData2[i]
      .replace(reg2, "$2")
      .replace(/[\s\t\n\]\[\'\"\`]/g, "");
    let mArr = m.split(",");
    for (let r in mArr) {
      let ex = mArr[r];
      if (!ex) continue;
      let name = ex.split(":")[0].split(".")[0];
      if (name && setting.checkData.indexOf(name) == -1)
        setting.checkData.push(name);
    }
  }
  //补充require路径
  jsdata = exports.fixPath(jsdata);
  jsdata = jsdata.replace(
    /[\s\t\n]*Page[\s\t\n]*\([\s\t\n]*{/,
    "\nexport default Page({\n\t__title:/*_TITLE_*/,\n\t__wxs:{/*_WXS_*/},\n\t__components:{/*_COMPONENTS_*/},\n\t__checkData:[/*_CHECKDATA_*/],\n\t__checkMethods:[/*_CHECKMETHODS_*/],\n\t__name:'" +
      setting.pagepath.replace(/\\\\|\\|\/\/|\//g, "") +
      "',\n"
  );
  jsdata = jsdata.replace(
    /[\s\t\n]*Component[\s\t\n]*\([\s\t\n]*{/,
    "\nexport default Component({\n\t__components:{/*_COMPONENTS_*/},\n\t__wxs:{/*_WXS_*/},\n\t__checkData:[/*_CHECKDATA_*/],\n\t__checkMethods:[/*_CHECKMETHODS_*/],\n\t__name:'" +
      setting.pagepath.replace(/\\\\|\\|\/\/|\//g, "") +
      "',\n"
  );
  let templateDeclare = "";
  for (let i in setting.templates) {
    templateDeclare +=
      "window._TEMPLATES_.set('" + i + "',`" + setting.templates[i] + "`);\n";
  }
  jsdata = templateDeclare + jsdata;
  if (setting.usingComponents) {
    let head = "";
    let componentsDeclare = "";
    for (let i in setting.usingComponents) {
      let name = i;
      let imName = "_IMPORTED_" + name.replace(/-/g, "_");
      let imPath = setting.usingComponents[i];
      head += `import ${imName} from '${imPath}'` + "\n";
      componentsDeclare += `'${name.toLowerCase()}':${imName},`;
    }
    jsdata = head + jsdata;
    jsdata = jsdata.replace("/*_COMPONENTS_*/", componentsDeclare);
  }
  if (setting.wxs.length > 0) {
    let head = "";
    let modules = [];
    for (let i in setting.wxs) {
      let src = setting.wxs[i].src;
      let module = setting.wxs[i].module;
      head += `import ${module} from '${src}'` + "\n";
      modules.push(module);
    }
    jsdata = head + jsdata;
    jsdata = jsdata.replace("/*_WXS_*/", modules.join(","));
  }
  jsdata = jsdata.replace(
    "/*_TITLE_*/",
    setting.navigationBarTitleText
      ? '"' + setting.navigationBarTitleText + '"'
      : "null"
  );
  for (let i = setting.checkData.length - 1; i >= 0; i--) {
    if (!setting.checkData[i] || !isNaN(setting.checkData[i])) {
      setting.checkData.splice(i, 1);
    }
  }
  jsdata = jsdata.replace(
    "/*_CHECKDATA_*/",
    setting.checkData.map(e => "`" + e + "`").join(",")
  );
  jsdata = jsdata.replace(
    "/*_CHECKMETHODS_*/",
    setting.checkMethods.map(e => "`" + e + "`").join(",")
  );
  return jsdata;
};

//补充require路径
exports.fixPath = function(jsdata) {
  let reg3 = /(\=\s?require\s?\(\s?['"])([^'"]+)(['"]\s?\)[\s\n,;])/g;
  let matchCheckPath = jsdata.match(reg3);
  for (let i in matchCheckPath) {
    let matched = matchCheckPath[i];
    let p = matched.replace(reg3, "$2");
    if (p.indexOf(".") != 0) {
      p = "./" + p;
      jsdata = jsdata.replace(matched, matched.replace(reg3, "$1" + p + "$3"));
    }
  }
  return jsdata;
};
