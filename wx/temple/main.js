import "./wx-core/wx";
import Vue from "vue";
import VueRouter from "vue-router";
import routes from "./router/router";
import jsonData from "./json.js";
import App from "./App.vue";

window.getCurrentPages = function() {
  return [window.vueRoot.$route.matched[0].instances.default];
};

Vue.use(VueRouter);
const router = new VueRouter({
  routes
});

function setRem() {
  // return new Promise(resolve => {
  //   $(function() {
  //     var irate = 625;
  //     var iw = 750;
  //     var win = window;
  //     var w = document.documentElement.clientWidth;
  //     var doc = document;
  //     var irate = 625 / (iw / w);
  //     irate = Math.min(irate, 625);
  //     doc.documentElement.style.fontSize = irate * 0.16 + "px";
  //     //华为手机修正
  //     var root = window.document.documentElement;
  //     var fontSize = parseFloat(root.style.fontSize);
  //     var finalFontSize = parseFloat(
  //       window.getComputedStyle(root).getPropertyValue("font-size")
  //     );
  //     if (finalFontSize !== fontSize) {
  //       root.style.fontSize = fontSize + (fontSize - finalFontSize) + "px";
  //     }
  //     resolve();
  //   });
  // });
  return new Promise(resolve => {
    $(function() {
      var irate = 625;
      var iw = 750;
      var win = window;
      var w =
        document.documentElement.clientWidth > 100
          ? document.documentElement.clientWidth
          : 414;
      var doc = document;
      var irate = 625 / (iw / w);
      irate = Math.min(irate, 625);
      doc.documentElement.style.fontSize = irate * 0.16 + "px";
      resolve();
    });
  });
}

Promise.all([setRem()]).then(values => {
  window.vueRoot = new Vue({
    el: "#app",
    router,
    components: { App },
    template: "<App/>",
    data: function() {
      return {
        to_delete_page: "",
        isNeedClearAll: false,
        keepAlivePages: [], //保留在内存里的页面,只保留5个页面
        routerEventHanlders: [],
        jsonData: jsonData,
        lastReachBottomTime: 0,
        eventHub: new Vue(),
        stopScrollEvent: false,
        firstTouchTime: null,
        firstTouchPos: {},
        lastTouchPos: {},
        ismoving: false
      };
    },
    watch: {
      $route: function(to, from) {
        let toPath = to.path;
        let index = this.keepAlivePages.findIndex(item => item.path == toPath);
        if (index > -1) {
          this.to_delete_page = this.keepAlivePages
            .splice(index + 1, this.keepAlivePages.length - index - 1)
            .map(item => item.path)
            .join(",")
            .replace(/\\\\|\\|\/\/|\//g, "");
        } else {
          if (this.isNeedClearAll) {
            this.to_delete_page = this.keepAlivePages
              .map(item => item.path)
              .join(",")
              .replace(/\\\\|\\|\/\/|\//g, "");
            this.isNeedClearAll = false;
            this.keepAlivePages = [];
          } else {
            if (this.keepAlivePages.length >= 5)
              this.to_delete_page = this.keepAlivePages
                .shift()
                .path.replace(/\\\\|\\|\/\/|\//g, "");
            else this.to_delete_page = "";
          }
          this.keepAlivePages.push({
            path: toPath,
            title: "",
            query: this.$route.query
          });
        }
      }
    },
    methods: {
      onscroll(e) {
        if (this.stopScrollEvent) return;
        this.eventHub.$emit("onscroll");
        try {
          let currentPage = this.$router.currentRoute.matched[0].instances
            .default;
          if (currentPage.onPageScroll)
            currentPage.onPageScroll({ scrollTop: this.getPage().scrollTop });
          let distance =
            e.target.scrollHeight - e.target.scrollTop - e.target.clientHeight;
          if (
            distance < 10 &&
            performance.now() > this.lastReachBottomTime + 1000
          ) {
            this.lastReachBottomTime = performance.now();
            if (currentPage.onReachBottom) currentPage.onReachBottom();
          }
        } catch (e) {
          console.warn(e);
        }
      },
      beforeEnter() {
        this.eventHub.$emit("beforeEnter");
      },
      beforeLeave() {
        this.eventHub.$emit("beforeLeave");
      },
      getPage: function() {
        return $("#_WX_PAGE_")[0];
      },
      click(e) {
        if (this.ismoving) {
          e.preventDefault();
          e.stopPropagation();
        }
      },
      touchstart(e) {
        if (e.preventedByNestedSwiper) return;
        this.firstTouchPos = { x: e.clientX, y: e.clientY };
        this.lastTouchPos = { x: e.clientX, y: e.clientY };
        this.firstTouchTime = performance.now();
      },
      touchmove(e) {
        if (!this.firstTouchTime) return;
        let target = e.currentTarget;
        let touch = { x: e.clientX, y: e.clientY };
        let move = {
          x: touch.x - this.lastTouchPos.x,
          y: touch.y - this.lastTouchPos.y
        };
        if (move.x == 0 && move.y == 0) return;
        this.ismoving = true;
        this.lastTouchPos = touch;
        target.scrollTop -= move.y;
      },
      touchend(e) {
        let target = e.currentTarget;
        if (this.ismoving) {
          let touch = { x: e.clientX, y: e.clientY };
          let now = performance.now();
          let space = now - this.firstTouchTime;
          let move = {
            x: touch.x - this.firstTouchPos.x,
            y: touch.y - this.firstTouchPos.y
          };
          let speed = { x: move.x / space, y: move.y / space };
          let lastTime = now;
          let interval = setInterval(() => {
            let t = performance.now() - now;
            let s = t / 500;
            target.scrollTop -=
              speed.y * (1 - s) * (performance.now() - lastTime);
            lastTime = performance.now();
          }, 5);
          setTimeout(() => {
            clearInterval(interval);
          }, 500);
        }
        this.firstTouchTime = null;
        setTimeout(() => {
          this.ismoving = false;
        }, 20);
      }
    }
  });
});
