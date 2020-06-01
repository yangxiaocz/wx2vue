<template>
	<div>		
		--0--
    <div class="page-container" :class="{'page-tabbar':isShowTab}" @scroll="$root.onscroll" @click.capture="$root.click" @mousedown="$root.touchstart" @mousemove="$root.touchmove" @mouseup="$root.touchend" @mouseleave="$root.touchend">
      <transition  name="router-fade" mode="out-in" v-on:before-enter="$root.beforeEnter" v-on:before-leave="$root.beforeLeave" >
        <keep-alive :exclude="$root.to_delete_page">
          <router-view id="_WX_PAGE_" ></router-view>
        </keep-alive>
      </transition>	
    </div>	
		<div class="page-title">
			<div class="content" :style="wx_title_style">
				<div class="time">{{wx_time}}</div>
				<div class="title">{{$root.keepAlivePages.length>0?$root.keepAlivePages[$root.keepAlivePages.length-1].title:''}}</div>
				<img class="return" @click="$router.go(-1)" v-if="$root.keepAlivePages.length>1&&wx_title_style.color=='white'" src="./wx-core/assets/back.png">
        <img class="return" @click="$router.go(-1)" v-if="$root.keepAlivePages.length>1&&wx_title_style.color=='black'" src="./wx-core/assets/back2.png">
			</div>
			<img class="background" v-if="wx_title_style.color=='white'" src="./wx-core/assets/white.png">
      <img class="background" v-if="wx_title_style.color=='black'" src="./wx-core/assets/black.png">
		</div>
		<div class="tab-bar" v-if="isShowTab">
			<navigator class="tab-item" v-for="item in $root.jsonData.tabBar.list" :key="item.pagePath" open-type='switchTab' :url="'/' + item.pagePath">
				<wx-image v-show="$route.path == '/' + item.pagePath && item.selectedIconPath" :src="item.selectedIconPath.myTrim('.').myTrim('/')" pagepath=""></wx-image>
				<wx-image v-show="($route.path != '/' + item.pagePath || !item.selectedIconPath) && item.iconPath" :src="item.iconPath.myTrim('.').myTrim('/')" pagepath=""></wx-image>
				<p :style="$route.path == '/' + item.pagePath && item.selectedIconPath &&$root.jsonData.tabBar.selectedColor?'color:'+$root.jsonData.tabBar.selectedColor:''">{{item.text}}</p>
			</navigator>
		</div>
  </div>
</template>

<script>
import App from "./wx-core/fake/App";
--1--
</script>

<style lang="scss">
@import "./app.wxss";
.router-fade-enter-active,
.router-fade-leave-active {
  transition: opacity 0.3s;
}
.router-fade-enter,
.router-fade-leave-active {
  opacity: 0;
}
</style>
<style scoped>
.page-title {
  position: fixed;
  top: 0;
  height: 1.16rem;
  width: 7.5rem;
  z-index: 11;
}
.page-title .background {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  z-index: 99;
  pointer-events: none;
}
.page-title .content {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  font-size: 0.25rem;
}
.page-title .content .time {
  text-align: center;
  padding-top: 2px;
}
.page-title .content .title {
  text-align: center;
  margin-top: 0.2rem;
}
.page-title .content .return {
  position: absolute;
  left: 0.17rem;
  top: 0.6rem;
  width: 0.26rem;
  height: 0.32rem;
}
.page-container {
  position: absolute;
  height: auto;
  top: 1.16rem;
  bottom: 0;
  left: 0;
  right: 0;
  overflow-y: scroll;
  overflow-x: hidden;
  user-select: none;
}
.page-container::-webkit-scrollbar {
  display: none;
}
.page-container.page-tabbar {
  bottom: 0.87rem !important;
  height: auto !important;
}
.tab-bar {
  user-select: none;
  position: fixed;
  display: flex;
  width: 100%;
  height: 0.87rem;
  bottom: 0;
  padding-top: 3px;
  border-top: 1px solid #c3c3c5;
  background: #f7f7fa;
  z-index: 999999;
}
.tab-bar .tab-item {
  text-align: center;
  width: 100%;
}
.tab-bar .tab-item ._WX_IMAGE_ {
  width: 0.5rem;
  height: 0.5rem;
  display: block;
  margin: auto;
}
.tab-bar .tab-item p {
  color: #a6a6a5;
  margin: 0;
  font-size: 1px;
}
._WX_PAGE_VIEW_{
  min-height: 100%;
}
</style>
