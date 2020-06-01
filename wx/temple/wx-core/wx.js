import Vue from "vue";
import qs from "qs";
import fakePage from "./fake/Page";
import fakeComponent from "./fake/Component";
import Store from "./utls/store";
import photoswipe from "./utls/photoswipe";
import selectQuery from "./utls/selectQuery";
import axios from "axios";
import jsonData from "../json.js";
var dcopy = require("deep-copy");
import "./style.css"; //导入微信默认样式
//注册全局模拟函数
window.Page = fakePage;
window.Component = fakeComponent;
window._TEMPLATES_ = new Store(100);
//注册全局组件实现微信组件
import template from "./components/template";
import image from "./components/image";
import text from "./components/text";
import scrollView from "./components/scrollView";
import swiper from "./components/swiper";
import swiperItem from "./components/swiperItem";
import contactButton from "./components/contactButton";
import input from "./components/input";
import textarea from "./components/textarea";
import button from "./components/button";
import navigator from "./components/navigator";
import coverView from "./components/coverView";
import coverImage from "./components/coverImage";
import map from "./components/map";
Vue.component("wx-template", template);
Vue.component("wx-image", image);
Vue.component("wx-text", text);
Vue.component("scroll-view", scrollView);
Vue.component("swiper", swiper);
Vue.component("swiper-item", swiperItem);
Vue.component("contact-button", contactButton);
Vue.component("wx-input", input);
Vue.component("wx-textarea", textarea);
Vue.component("wx-button", button);
Vue.component("navigator", navigator);
Vue.component("cover-view", coverView);
Vue.component("cover-image", coverImage);
Vue.component("wx-map", map);
//注册全局依赖方法
String.prototype.myTrim = function(c) {
  return this.replace(new RegExp("^\\" + c + "|\\" + c + "$", "g"), "");
};
Vue.prototype.$copy = function(obj) {
  return dcopy(obj);
};
Vue.prototype.setData = function(dt, callback) {
  for (let k in dt) {
    let target = this;
    let key = k;
    if (k.indexOf("." > -1)) {
      let kArr = k
        .replace(/\[/g, ".")
        .replace(/\]/g, "")
        .split(".");
      for (let i = 0; i < kArr.length; i++) {
        if (i == kArr.length - 1) {
          key = kArr[i];
        } else {
          target = target[kArr[i]];
        }
      }
    }
    this.$set(target, key, dt[k]);
  }
  if (callback) {
    callback.apply(this);
  }
};
Vue.prototype._FUNC_ = function(functionName, e) {
  if (e && e.target && e.type) {
    let detail =
      e.detail || e.detail === 0 ? e.detail : { x: e.clientX, y: e.clientY };
    if (e.type == "submit") {
      let value = {};
      $(e.target)
        .find("input")
        .each((i, e) => {
          if ($(e).attr("name")) {
            value[$(e).attr("name")] = $(e).val();
          }
        });
      detail = {
        formId: "the formId is a mock one",
        target: e.target,
        value: value
      };
    }
    e = {
      changedTouches: e.changedTouches,
      currentTarget: e.currentTarget,
      detail: detail,
      target: e.target,
      touches: e.touches,
      type: e.type
    };
    if (!e.currentTarget) e.currentTarget = e.target;
    e.target = e.currentTarget;
  }
  let target = !e.currentTarget ? e.target : e.currentTarget;
  let dataset = {};
  if (target && target.dataset) {
    for (let i in target.dataset) {
      try {
        dataset[i] = JSON.parse(target.dataset[i]);
      } catch (e) {
        dataset[i] = target.dataset[i];
      }
    }
  }
  e.target = e.currentTarget = { dataset };
  let getFuncTarget = function(target) {
    if (target[functionName]) return target;
    if (target.$parent) {
      return getFuncTarget(target.$parent);
    } else return null;
  };
  let funcTarget = getFuncTarget(this);
  if (funcTarget) return funcTarget[functionName](e);
};
Vue.prototype.triggerEvent = function(name, data) {
  let event = { target: this.$el, detail: data };
  this.$emit(name.toLowerCase(), event);
};
Vue.prototype.selectComponent = function(name) {
  return this.$refs[name.replace("#", "")];
};
//模拟wxAPI
let wx = {
  canIUse: function() {
    return false;
  },
  setEnableDebug: function() {},
  /**网络 */
  request: function(option) {
    let set = {
      url: option.url,
      method: option.method
    };
    if (option.method == "POST") set.data = option.data;
    else set.params = option.data;
    if (option.dataType) set.responseType = option.dataType;
    if (option.header) set.headers = option.header;
    axios(set)
      .then(res => {
        res.header = res.headers;
        res.statusCode = res.status;
        if (option.success) option.success(res);
        if (option.complete) option.complete();
      })
      .catch(e => {
        if (option.fail) option.fail(e);
        if (option.complete) option.complete();
      });
  },
  uploadFile: function(option) {},
  downloadFile: function(option) {},
  /**媒体 */
  chooseImage: function(option) {},
  previewImage: function(option) {
    photoswipe(option);
  },
  getImageInfo: function(option) {},
  /**数据缓存 */
  setStorage: function(option) {
    localStorage.setItem(option.key, option.data);
    if (option.success) option.success();
  },
  setStorageSync: function(key, value) {
    localStorage.setItem(key, value);
  },
  getStorage: function(option) {
    let data = localStorage.getItem(option.key);
    option.success(data ? data : "");
  },
  getStorageSync: function(key) {
    return localStorage.getItem(key);
  },
  clearStorageSync: function(key) {
    localStorage.clear();
  },
  /**位置 */
  getLocation: function(option) {
    AMap.plugin("AMap.Geolocation", function() {
      var geolocation = new AMap.Geolocation({});
      geolocation.getCurrentPosition(function(status, result) {
        if (status == "complete") {
          if (option.success)
            option.success({
              latitude: result.position.lat,
              longitude: result.position.lng
            });
        }
      });
    });
  },
  chooseLocation: function(option) {},
  openLocation: function(option) {},
  getSystemInfo: function(option) {
    if (option.success) option.success(this.getSystemInfoSync());
  },
  /**设备 */
  getSystemInfoSync: function() {
    let data = {
      SDKVersion: "1.9.91",
      batteryLevel: 100,
      benchmarkLevel: 1,
      brand: "devtools",
      fontSizeSetting: 16,
      language: "zh_CN",
      model: "iPhone 7 Plus",
      pixelRatio: 3,
      platform: "devtools",
      screenHeight: screen.height,
      screenWidth: screen.width,
      statusBarHeight: 20,
      system: "iOS 10.0.1",
      version: "6.6.3",
      windowHeight: screen.availHeight,
      windowWidth: screen.availWidth
    };
    if (data.windowWidth > 500) {
      data.windowWidth = data.screenWidth = 414;
      data.windowHeight = data.screenHeight = 736;
    }
    return data;
  },
  makePhoneCall: function(option) {},
  /**界面 */
  pageScrollTo: function(option) {
    window.vueRoot.stopScrollEvent = true;
    if (option.duration)
      $("#_WX_PAGE_").animate(
        {
          scrollTop: option.scrollTop
        },
        option.duration
      );
    else $("#_WX_PAGE_").scrollTop(option.scrollTop);
    setTimeout(
      () => {
        window.vueRoot.stopScrollEvent = false;
      },
      option.duration ? option.duration + 100 : 200
    );
  },
  showLoading: function(option) {},
  hideLoading: function(option) {},
  showToast: function(option) {
    let dialog = $(`<div class="_WX_DIALOG_">${option.title}</div>`);
    dialog.appendTo("body");
    setTimeout(() => dialog.remove(), 1500);
  },
  createSelectorQuery: function() {
    return new selectQuery();
  },
  setNavigationBarTitle: function(option) {
    if (window.vueRoot.keepAlivePages.length > 0)
      window.vueRoot.keepAlivePages[
        window.vueRoot.keepAlivePages.length - 1
      ].title = option.title;
    document.title = option.title;
  },
  _getPath: function(originUrl) {
    let pathes = originUrl.split("?");
    let url = pathes.shift();
    let query = pathes.join("?");
    let queryData = qs.parse(query);
    if (url.indexOf(".") == 0) {
      let currentPath = window.vueRoot.$route.path;
      let path =
        currentPath.substring(0, currentPath.lastIndexOf("/")) + "/" + url;
      let pathArr = path.split("/");
      let parsedArr = [];
      for (let i = 0; i < pathArr.length; i++) {
        let item = pathArr[i];
        if (item == "..") {
          parsedArr.pop();
        } else {
          parsedArr.push(item);
        }
      }
      url = parsedArr.join("/");
    }
    return { url, queryData };
  },
  navigateTo: function(option) {
    let res = this._getPath(option.url);
    window.vueRoot.$router.push({ path: res.url, query: res.queryData });
  },
  redirectTo: function(option) {
    window.vueRoot.isNeedClearAll = true;
    document.body.scrollTop = 0;
    this.navigateTo(option);
  },
  switchTab: function(option) {
    this.redirectTo(option);
  },
  navigateBack: function(option) {
    window.vueRoot.$router.go(-1);
  },
  getExtConfigSync: function() {
    return jsonData.ext;
  },
  login: function(option) {},
  getUserInfo: function(option) {
    if (option.success)
      option.success({
        userInfo: {
          nickName: "模拟用户",
          avatarUrl: "",
          gender: 1,
          city: "常州",
          province: "江苏",
          country: "中国",
          language: "zh_CN"
        },
        rawData: 11111,
        signature: 22222,
        encryptedData: 33333,
        iv: 12
      });
  }
};
window.wx = wx;
export default wx;
