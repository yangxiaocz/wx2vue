<template>
<textarea @input="oninput" @focus="onfocus" @blur="onblur" @keydown="onkeydown"></textarea>
</template>
<script>
export default {
  name:'wx-textarea',
  methods:{
    oninput(e){
      let event = {
        target:this.$el,
        currentTarget:this.$el,
        detail:{value:e.target.value}
      }
      this.$emit('input',event);
    },
    onkeydown(e){
      let event = {
        target:this.$el,
        currentTarget:this.$el,
        detail:{value:e.target.value}
      }
      if(e.keycode == 13)
        this.$emit('confirm',event);
    },
    onfocus(e){
      let event = {
        target:this.$el,
        currentTarget:this.$el,
        detail:{value:e.target.value}
      }
      this.$emit('focus',event);
    },
    onblur(e){
      let event = {
        target:this.$el,
        currentTarget:this.$el,
        detail:{value:e.target.value}
      }
      this.$emit('blur',event);
    }
  }
}
</script>