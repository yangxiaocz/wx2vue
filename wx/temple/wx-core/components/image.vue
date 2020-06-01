<template>
<div class="_WX_IMAGE_">
  <img :src="imgSrc" v-show='imgSrc' @click="onclick" @load="onload" @mousedown="mousedown"/>
</div>
</template>
<script>
export default {
  props: ["src", "pagepath"],
  computed: {
    imgSrc: function() {
      return this.trueSrc ? this.trueSrc : this.src;
    }
  },
  data: function() {
    return {
      trueSrc: ""
    };
  },
  watch: {
    src: {
      handler: function(newVal) {
        if (newVal === undefined) return;
        if (newVal.indexOf("http") !== 0) {
          let path =
            this.pagepath.substring(0, this.pagepath.lastIndexOf("/")) +
            "/" +
            this.src.myTrim("/");
          let pathArr = path.split("/");
          let parsedArr = [];
          for (let i = 0; i < pathArr.length; i++) {
            let item = pathArr[i];
            if (item == "..") {
              parsedArr.pop();
            } else if (item && item != ".") {
              parsedArr.push(item);
            }
          }
          let url = "./" + parsedArr.join("/");
          let trueSrc = $(`#_IMG_PLACEHOLDER_ img[hiddensrc='${url}']`).attr(
            "src"
          );
          if (trueSrc) this.trueSrc = trueSrc;
          else {
            this.$nextTick(() => {
              trueSrc = $(`#_IMG_PLACEHOLDER_ img[hiddensrc='${url}']`).attr(
                "src"
              );
              if (trueSrc) this.trueSrc = trueSrc;
            });
          }
        } else {
          this.trueSrc = "";
          return newVal;
        }
      },
      immediate: true
    }
  },
  methods: {
    onload($event) {
      let event = {
        target: this.$el,
        currentTarget: this.$el,
        detail: {
          width: $event.target.naturalWidth,
          height: $event.target.naturalHeight
        },
        changedTouches: $event.changedTouches,
        touches: $event.touches,
        type: "load"
      };
      this.$emit("load", event);
    },
    onclick($event) {
      let event = {
        target: this.$el,
        currentTarget: this.$el,
        detail: $event.detail,
        changedTouches: $event.changedTouches,
        touches: $event.touches,
        type: "click"
      };
      this.$emit("click", event);
    },
    mousedown(e) {
      e.preventDefault();
    }
  }
};
</script>
<style>
._WX_IMAGE_{
  overflow:hidden;
}
._WX_IMAGE_ img {
  width: 100%;
  height: 100%;
}
</style>