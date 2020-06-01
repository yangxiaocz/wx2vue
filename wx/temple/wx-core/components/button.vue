<template>
  <div @click="onclick" class="WX_BTN">
    <slot></slot>
  </div>
</template>
<script>
export default {
  name: "wx-button",
  props: ["openType"],
  methods: {
    onclick(e) {
      let event = {
        target: this.$el,
        currentTarget: this.$el,
        detail: {}
      };
      if (this.openType == "getUserInfo") {
        wx.getUserInfo({
          success: res => {
            event.detail = res;
            this.$emit("getuserinfo", event);
          }
        });
      } else {
        this.$emit("tap", event);
      }
    }
  }
};
</script>
<style lang="scss">
.WX_BTN {
  text-align: center;
  border-radius: 5px;
}
</style>
