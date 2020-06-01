export default {
  props: ["_TID_", "_DATA_"],
  data: function() {
    return this.$copy(this._DATA_);
  },
  watch: {
    _DATA_: {
      handler: function(newval) {
        for (let i in newval) {
          this.$set(this, i, newval[i]);
        }
      },
      deep: true
    }
  },
  created() {
    this.$options.template =
      "<div>" + window._TEMPLATES_.get(this._TID_) + "</div>";
  },
  template: "<div></div>"
};
