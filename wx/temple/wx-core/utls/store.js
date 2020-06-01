function Store(limit = 9999) {
  //全局缓存
  this.cache = {};
  this.hasCached = [];
  this.limit = limit;
  this.get = function(key) {
    return this.cache[key];
  };
  this.set = function(key, value) {
    this.cache[key] = value;
    this.hasCached.push(key);
    if (this.hasCached.length > this.limit) {
      let todel = this.hasCached.shift();
      delete this.cache[todel];
    }
  };
}
module.exports = Store;
