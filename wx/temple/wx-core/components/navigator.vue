<template>
<div class="_WX_NAVIGATOR_" @click="onclick">
  <slot></slot>
</div>
</template>
<script>
export default {
  props:['url','openType'],
  methods:{
    onclick(){
      let openType = this.openType?this.openType:'navigate';
      switch(openType) {
        case 'navigate':
          wx.navigateTo({url:this.url});
          break;
        case 'redirect':
          wx.redirectTo({url:this.url});
          break;
        case 'switchTab':
          wx.switchTab({url:this.url});
          break;
        case 'reLaunch':
          location.reload();
          break;
        case 'navigateBack':
          wx.navigateBack();
          break;
        default:
          break;
      }
    }
  }
}
</script>