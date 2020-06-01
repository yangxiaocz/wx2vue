function exec() {
  this.exec = function() {};
}

function nodeRef(jq, isAll = true) {
  this.jq = jq;
  this.isAll = isAll;
  this.boundingClientRect = function(callback) {
    let result = [];
    for (let i = 0; i < this.jq.length; i++) {
      let dom = this.jq[i];
      result.push(dom.getBoundingClientRect());
    }
    if (!callback) return;
    if (!this.isAll) callback(result[0]);
    else callback(result);
  };
  this.scrollOffset = function(callback) {
    let dom = this.jq[0];
    if (callback) {
      if (!this.isAll) callback(dom);
      else callback(this.jq);
    }
    return new exec();
  };
  this.fields = function(setting, callback) {
    setTimeout(() => {
      let final = [];
      for (let i = 0; i < this.jq.length; i++) {
        let dom = this.jq[i];
        let jq = $(dom);
        let position = jq.position();
        let width = jq.outerWidth();
        let height = jq.outerHeight();
        let result = {};
        if (setting.dataset) result.dataset = dom.dataset;
        if (setting.rect) {
          result.left = position.left;
          result.right = screen.availWidth - position.left - width;
          result.top = position.top;
          result.bottom = screen.availWidth - position.top - height;
        }
        if (setting.size) {
          result.width = width;
          result.height = height;
        }
        if (setting.scrollOffset) {
          result.scrollLeft = dom.scrollLeft;
          result.scrollTop = dom.scrollTop;
        }
        if (setting.properties && setting.properties.length > 0) {
          for (let a in setting.properties) {
            let aname = setting.properties[a];
            result[aname] = dom.attributes.find(
              e => e.nodeName == aname
            ).nodeValue;
          }
        }
        if (setting.computedStyle && setting.computedStyle.length > 0) {
          let style = getComputedStyle(dom);
          for (let a in setting.computedStyle) {
            let sname = setting.computedStyle[a];
            result[sname] = style[sname];
          }
        }
        final.push(result);
      }
      if (!callback) return;
      if (!this.isAll) callback(final[0]);
      else callback(final);
    }, 100);
    return new exec();
  };
}

export default function selectQuery() {
  this.jq = $(window.vueRoot.$el);

  this.in = function(parent) {
    this.jq = $(parent);
  };
  this.select = function(selector) {
    return new nodeRef(this.jq.find(selector), false);
  };
  this.selectAll = function(selector) {
    return new nodeRef(this.jq.find(selector));
  };
  this.selectViewport = function() {
    return new nodeRef(
      $(window.vueRoot.$route.matched[0].instances.default.$el),
      false
    );
  };
}
