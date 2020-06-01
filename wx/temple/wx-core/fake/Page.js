import wx from "../wx";

export default function Page(pageset) {
  if (pageset.data && pageset.data.data !== undefined) {
    console.error("避免定义data为页面变量");
  }
  let page = {
    name: pageset.__name,
    data: function() {
      return this.__getData();
    },
    computed: {
      data: function() {
        return this._data;
      },
      _TEMPLATES_: function() {
        return window._TEMPLATES_.cache;
      }
    },
    components: pageset.__components,
    mounted() {
      if (this.PAGE_TITLE) wx.setNavigationBarTitle({ title: this.PAGE_TITLE });
      this.options = this.$route.query;
      if (this.onLoad) this.onLoad(this.$route.query);
      if (this.onShow) this.onShow();
    },
    activated() {
      let page = this.$root.getPage();
      if (page) page.scrollTop = this.SAVED_POSITION;
    },
    deactivated() {
      if (this.onHide) this.onHide();
    },
    beforeRouteLeave(to, from, next) {
      let page = this.$root.getPage();
      if (page) this.SAVED_POSITION = page.scrollTop;
      next();
    },
    watch: {
      $route: function(to, from) {
        if (to.path == this.ROUTE_PATH) {
          if (!this.__compareRouteParams(to.query)) {
            this.__resetData();
            if (this.onLoad) this.onLoad(this.$route.query);
            if (this.onShow) this.onShow();
          } else {
            if (this.onShow) this.onShow();
          }
        }
      }
    },
    methods: {
      __getData() {
        let res = this.$copy(pageset.data);
        res.PAGE_TITLE = pageset.__title;
        res.ROUTE_PATH = this.$route.path;
        res.ROUTE_PARAMS = this.$route.query;
        res.SAVED_POSITION = 0;
        for (let i in pageset.__checkData) {
          let d = pageset.__checkData[i];
          if (res[d] === undefined) res[d] = "";
        }
        for (let i in pageset.__wxs) {
          let d = pageset.__wxs[i];
          res[i] = d;
        }
        res.properties = undefined;
        return res;
      },
      __resetData() {
        let dt = this.__getData();
        for (let i in dt) {
          this[i] = dt[i];
        }
      },
      __compareRouteParams(toParams) {
        for (let i in this.ROUTE_PARAMS) {
          if (this.ROUTE_PARAMS[i] != toParams[i]) return false;
        }
        return true;
      }
    }
  };
  for (let i in pageset) {
    if (typeof pageset[i] === "function") {
      page.methods[i] = pageset[i];
    }
  }
  for (let i in pageset.__checkMethods) {
    if (!page.methods[i])
      page.methods[i] = function() {
        console.error("此函数占位");
      };
  }
  return page;
}
