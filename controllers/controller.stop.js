const stop = function () {
  return {
    execute: function () {
      return {
        w: 0,
        v: 0
      };
    }
  }
}();

module.exports = stop;