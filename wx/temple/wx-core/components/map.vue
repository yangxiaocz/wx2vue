<template>
<div class="_WX_MAP_">
  <div id='wxmap-container'>
  </div>
  <div class="map-slot">
    <slot></slot>
  </div>
</div>

</template>
<script>
export default {
  name: "wx-map",
  props: ["longitude", "latitude", "scale"],
  data: function() {
    return {
      map: null
    };
  },
  watch: {
    longitude: function() {
      this.init();
    },
    latitude: function() {
      this.init();
    },
    scale: function() {
      this.init();
    }
  },
  mounted() {
    this.init();
  },
  destroyed() {
    if (this.map) this.map.destroy();
  },
  methods: {
    init() {
      this.$nextTick(() => {
        if (!this.longitude || !this.latitude) {
          return;
        }
        if (!this.map)
          this.map = new AMap.Map("wxmap-container", {
            center: [parseFloat(this.longitude), parseFloat(this.latitude)],
            zoom: this.zoom ? parseInt(this.zoom) : 12,
            resizeEnable: true
          });
        else
          this.map.setZoomAndCenter(this.zoom ? parseInt(this.zoom) : 12, [
            parseFloat(this.longitude),
            parseFloat(this.latitude)
          ]);
      });
    }
  }
};
</script>
<style scoped>
._WX_MAP_ {
  position: relative;
}
#wxmap-container {
  width: 100%;
  height: 100%;
}
.map-slot {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
}
</style>
