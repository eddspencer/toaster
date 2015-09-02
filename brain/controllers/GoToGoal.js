const controlTheory = require('../controlTheory');

const GoToGoal = function () {
  var accumulatedError = 0;
  var previousError = 0;

  var execute = function (state) {
    const relativeToGoal = {
      x: state.goal.x - state.x,
      y: state.goal.y - state.y
    };

    const result = controlTheory.calculateTrajectory(state, relativeToGoal, accumulatedError, previousError);
    const w = result.w;
    previousError = result.thetaError;
    accumulatedError = result.accumulatedError;

    return {
      w: w,
      v: state.v
    };
  };

  const reset = function() {
    previousError = 0;
    accumulatedError = 0;
  };

  return {
    behaviour: 'GoToGoal',
    execute: execute,
    reset: reset
  };
};

module.exports = GoToGoal;