const Stop = function () {
  return {
    behaviour: 'Stop',
    execute: function () {
      return {
        w: 0,
        v: 0
      };
    }
  }
};

module.exports = Stop;