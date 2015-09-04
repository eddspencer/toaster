const Stop = function (controllers) {
  return {
    behaviour: controllers.behaviourTypes.Stop,
    execute: function () {
      return {
        w: 0,
        v: 0
      };
    },
    reset: function () {
      // Nothing to do
    }
  }
};

module.exports = Stop;