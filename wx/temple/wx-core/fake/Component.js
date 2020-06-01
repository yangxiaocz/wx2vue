export default function Component(pageset) {
  if (pageset.data && pageset.data.data !== undefined) {
    console.error("避免定义data为页面变量");
  }
  let watcher = {};
  let props = {};
  if (pageset.properties) {
    for (let p in pageset.properties) {
      if (pageset.properties[p].value !== undefined)
        pageset.properties[p].default = pageset.properties[p].value;
      if (pageset.properties[p].type) delete pageset.properties[p].type;
      props[p] = pageset.properties[p];
      if (pageset.properties[p].observer)
        watcher[p] = {
          handler: function(newValue, oldValue) {
            if (
              oldValue == undefined &&
              newValue == pageset.properties[p].default
            )
              return;
            setTimeout(() => {
              pageset.properties[p].observer.apply(this, [newValue, oldValue]);
            }, 1);
          },
          immediate: true,
          deep: true
        };
    }
  }
  let page = {
    name: pageset.__name,
    data: function() {
      let res = this.$copy(pageset.data);
      if (!res) res = {};
      for (let i in pageset.__checkData) {
        let d = pageset.__checkData[i];
        if (res[d] === undefined && props[d] === undefined) res[d] = "";
      }
      for (let i in pageset.__wxs) {
        let d = pageset.__wxs[i];
        res[d] = eval(d);
      }
      return res;
    },
    computed: {
      data: function() {
        let res = {};
        let that = this;
        for (let i in this._data) {
          Object.defineProperty(res, i, {
            get: function() {
              return that._data[i];
            },
            set: function(value) {
              that._data[i] = value;
            }
          });
        }
        for (let i in this._props) {
          res[i] = this._props[i];
        }
        return res;
      },
      properties: function() {
        return this._props;
      },
      _TEMPLATES_: function() {
        return window._TEMPLATES_.cache;
      }
    },
    components: pageset.__components,
    created: function() {
      if (this.created) this.created();
    },
    beforeMount: function() {
      if (this.attached) this.attached();
    },
    mounted: function() {
      if (this.ready) this.ready();
    },
    destroyed: function() {
      if (this.detached) this.detached();
    },
    props: props,
    watch: watcher,
    methods: pageset.methods
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
