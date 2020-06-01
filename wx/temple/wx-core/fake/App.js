export default function App(pageset) {
  let app = {
    data: function() {
      let dt = { wx_time: "" };
      for (let i in pageset) {
        if (typeof pageset[i] !== "function") {
          dt[i] = pageset[i];
        }
      }
      return dt;
    },
    created: function() {
      let _this = this;
      window.getApp = function() {
        return _this;
      };
      if (this.onLaunch) this.onLaunch();
      let t = new Date();
      let fixNum = function(v) {
        if (v < 10) return "0" + v;
        return v;
      };
      this.wx_time = fixNum(t.getHours()) + ":" + fixNum(t.getMinutes());
      setInterval(() => {
        let t = new Date();
        this.wx_time = fixNum(t.getHours()) + ":" + fixNum(t.getMinutes());
      }, 60000);
    },
    computed: {
      wx_title_style: function() {
        let backgroundColor = this.$root.jsonData.window
          .navigationBarBackgroundColor
          ? this.$root.jsonData.window.navigationBarBackgroundColor
          : "#000";
        if (backgroundColor.indexOf("#") == -1)
          backgroundColor = "#" + backgroundColor;
        if (
          backgroundColor == "#fff" ||
          backgroundColor == "#ffffff" ||
          backgroundColor == "#FFF" ||
          backgroundColor == "#FFFFFF"
        )
          return {
            color: "black",
            background: backgroundColor
          };
        else
          return {
            color: "white",
            background: backgroundColor
          };
      },
      isShowTab: function() {
        if (!this.$root.jsonData.tabBar || !this.$root.jsonData.tabBar.list)
          return false;
        for (let i in this.$root.jsonData.tabBar.list) {
          if (
            this.$root.jsonData.tabBar.list[i].pagePath ==
            this.$route.path.myTrim("/")
          )
            return true;
        }
        return false;
      }
    },
    mounted: function() {
      if (this.onShow) this.onShow();
    },
    activate() {
      if (this.onShow) this.onShow();
    },
    deactivated() {
      if (this.onHide) this.onHide();
    },
    methods: {}
  };
  for (let i in pageset) {
    if (typeof pageset[i] === "function") {
      app.methods[i] = pageset[i];
    }
  }
  return app;
}
