<template>
<div class="_WX_SWIPER_ swiper-box">
  <div class="swiper-wrapper" :class="'wx_swiper_'+_uid">
    <slot></slot>
  </div>
  <div class="wx-swiper-dots wx-swiper-dots-horizontal" v-if="indicatorDots&&swiper">
    <span class="wx-swiper-dot" v-for="(i,index) in new Array(totalCount)" :key="index" :class="{'wx-swiper-dot-active':currentIndex==index}"></span>
  </div>
</div>
</template>
<script>
export default {
  name: "swiper",
  props: [
    "indicatorDots",
    "indicatorColor",
    "indicatorActiveColor",
    "autoplay",
    "current",
    "interval",
    "duration",
    "circular",
    "vertical",
    "displayMultipleItems"
  ],
  data: function() {
    return {
      swiper: null,
      options: null,
      currentIndex: this.current ? parseInt(this.current) : 0,
      totalCount: 0,
      currentPath: this.$route.path
    };
  },
  mounted() {
    this.$root.eventHub.$on("beforeEnter", this.beforeEnter);
    this.$root.eventHub.$on("beforeLeave", this.beforeLeave);
  },
  destroyed() {
    this.$root.eventHub.$off("beforeEnter", this.beforeEnter);
    this.$root.eventHub.$off("beforeLeave", this.beforeLeave);
    try {
      if (this.swiper) this.swiper.destroy(true, true);
      this.swiper = null;
      this.options = null;
    } catch (e) {}
  },
  mounted() {
    if (this.indicatorColor)
      this.addStyle(
        `.wx-swiper-dot{opacity: 1;background:${this.indicatorColor}}`
      );
    if (this.indicatorActiveColor)
      this.addStyle(
        `.wx-swiper-dot-active{background:${this.indicatorActiveColor}}`
      );
    this.totalCount = $(this.$el).find("._WX_SWIPER_ITEM_").length;
    this.init();
  },
  methods: {
    addStyle(css) {
      $("<style> .wx_swiper_${this._uid}{" + css + "}</style>").appendTo(
        $("head")
      );
    },
    init() {
      let that = this;
      this.options = {
        autoplay: this.autoplay
          ? this.interval
            ? parseInt(this.interval)
            : 5000
          : 0,
        speed: this.duration ? parseInt(this.duration) : 500,
        direction: this.vertical ? "vertical" : "horizontal",
        initialSlide: this.current ? parseInt(this.current) : 0,
        slidesPerView: this.displayMultipleItems
          ? parseInt(this.displayMultipleItems)
          : 1,
        loop: true,
        observer: true,
        observeParents: true,
        autoplayDisableOnInteraction: false,
        onSlideChangeStart: function(swiper) {
          that.currentIndex = parseInt(swiper.realIndex);
          that.$emit("change", { detail: { current: that.currentIndex } });
        }
      };
      this.swiper = new Swiper(this.$el, this.options);
    },
    beforeLeave() {
      if (this.$route.path != this.currentPath) {
        try {
          if (this.swiper && this.options.autoplay > 0)
            this.swiper.stopAutoplay();
        } catch (e) {}
      }
    },
    beforeEnter() {
      if (!this.swiper || this.$route.path != this.currentPath) return;
      try {
        if (this.options.autoplay > 0) this.swiper.startAutoplay();
      } catch (e) {}
      this.swiper.updatePagination();
    }
  }
};
</script>
<style>
._WX_SWIPER_ {
  overflow: hidden;
  position: relative;
}
.swiper-wrapper {
  z-index: 0;
}
</style>