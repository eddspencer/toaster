const AvoidObstacle = function () {
  return {
    behaviour: 'AvoidObstacle',
    execute: function () {
      return {
        w: 0,
        v: 0
      };
    }
  }
};

module.exports = AvoidObstacle;