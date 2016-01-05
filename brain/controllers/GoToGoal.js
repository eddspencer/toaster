const controlTheory = require('../controlTheory');
const geometry = require('../geometry');
const behaviourTypes = require('./behaviourTypes');

const GoToGoal = function () {
  var accumulatedError = 0;
  var previousError = 0;

  var execute = function (state) {
    const relativeToGoal = geometry.createPoint(state.goal.x - state.x, state.goal.y - state.y);

    const result = controlTheory.calculateTrajectory(state, relativeToGoal, accumulatedError, previousError);
    const w = result.w;
    previousError = result.thetaError;
    accumulatedError = result.accumulatedError;

    return {
      w: w,
      v: state.v
    };
  };

  const reset = function () {
    previousError = 0;
    accumulatedError = 0;
  };

  return {
    behaviour: behaviourTypes.GoToGoal,
    execute: execute,
    reset: reset
  };
};

module.exports = GoToGoal;