const behaviourTypes = require('./behaviourTypes');

const Stop = function () {
  return {
    behaviour: behaviourTypes.Stop,
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