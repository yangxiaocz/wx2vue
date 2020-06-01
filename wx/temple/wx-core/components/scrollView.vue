<template>
<div class="_WX_SCROLL_VIEW_"  ref="container" :class="{'scroll-fix-y':scrollY!==undefined,'scroll-fix-x':scrollX!==undefined}"  @scroll.stop="onscroll" @click.capture="click" @mousedown.stop="touchstart" @mousemove.stop="touchmove" @mouseup.stop="touchend" @mouseleave.stop="touchend">
  <slot>
  </slot>
  <div ref="bottom"></div>
</div>
</template>
<script>
export default {
  name: "scroll-view",
  props: [
    "scrollX",
    "scrollY",
    "lowerThreshold",
    "scrollTop",
    "scrollLeft",
    "scrollIntoView",
    "scrollWithAnimation"
  ],
  data() {
    return {
      pos: 0,
      lastCheckTime: 0,
      currentPath: this.$route.path,
      firstTouchTime: null,
      firstTouchPos: {},
      lastTouchPos: {},
      ismoving: false
    };
  },
  mounted() {
    this.$root.eventHub.$on("beforeEnter", this.beforeEnter);
    this.$root.eventHub.$on("beforeLeave", this.beforeLeave);
  },
  destroyed() {
    this.$root.eventHub.$off("beforeEnter", this.beforeEnter);
    this.$root.eventHub.$off("beforeLeave", this.beforeLeave);
  },
  watch: {
    $route: function(to, from) {
      if (to.path == this.currentPath) this.scrollTo(this.pos);
    },
    scrollTop: {
      handler: function(newval) {
        if (newval !== undefined) this.scrollTo(newval);
      },
      immediate: true
    },
    scrollLeft: {
      handler: function(newval) {
        if (newval !== undefined) this.scrollTo(newval);
      },
      immediate: true
    },
    scrollIntoView: {
      handler: function(newval) {
        if (newval !== undefined)
          this.$nextTick(() => {
            this.scrollToElement(newval);
          });
      },
      immediate: true
    }
  },
  methods: {
    beforeLeave() {
      if (this.$route.path != this.currentPath)
        this.pos =
          this.scrollY !== undefined
            ? this.$refs.container.scrollTop
            : this.$refs.container.scrollLeft;
    },
    beforeEnter() {
      if (this.$route.path == this.currentPath) this.scrollTo(this.pos);
    },
    scrollTo(pos) {
      this.$nextTick(() => {
        if (this.$refs.container) {
          //微信浏览器不兼容
          //this.$refs.container.scrollTo(0,pos);
          if (this.scrollY !== undefined) this.$refs.container.scrollTop = pos;
          else this.$refs.container.scrollLeft = pos;
        }
      });
    },
    scrollToElement(domSelector) {
      let dom = $("#" + domSelector)[0];
      if (!dom) return;
      let pos = this.scrollY !== undefined ? dom.offsetTop : dom.offsetLeft;
      this.scrollTo(pos);
    },
    onscroll(e) {
      if (this.$route.path != this.currentPath) return;
      if (performance.now() > this.lastCheckTime + 800) {
        let lowerThreshold = this.lowerThreshold ? this.lowerThreshold : 10;
        let distance =
          this.$refs.bottom.getBoundingClientRect().bottom -
          this.$el.getBoundingClientRect().bottom;
        if (distance < 10) {
          this.triggerEvent("scrolltolower", "");
          this.lastCheckTime = performance.now();
        }
      }
      this.$emit("scroll", e);
    },
    getScrollPosition() {
      return this.scrollY !== undefined
        ? this.$refs.container.scrollTop
        : this.$refs.container.scrollLeft;
    },
    click(e) {
      if (this.ismoving) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    touchstart(e) {
      this.firstTouchPos = { x: e.clientX, y: e.clientY };
      this.lastTouchPos = { x: e.clientX, y: e.clientY };
      this.firstTouchTime = performance.now();
    },
    touchmove(e) {
      if (!this.firstTouchTime) return;
      let touch = { x: e.clientX, y: e.clientY };
      let move = {
        x: touch.x - this.lastTouchPos.x,
        y: touch.y - this.lastTouchPos.y
      };
      if (move.x == 0 && move.y == 0) return;
      this.ismoving = true;
      this.lastTouchPos = touch;
      if (this.scrollY !== undefined) {
        this.$refs.container.scrollTop -= move.y;
      } else {
        this.$refs.container.scrollLeft -= move.x;
      }
    },
    touchend(e) {
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
          if (this.scrollY !== undefined) {
            this.$refs.container.scrollTop -=
              speed.y * (1 - s) * (performance.now() - lastTime);
          } else {
            this.$refs.container.scrollLeft -=
              speed.x * (1 - s) * (performance.now() - lastTime);
          }
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
};
</script>
