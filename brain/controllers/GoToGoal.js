const GoToGoal = function () {

  var accumulatedError = 0;
  var previousError = 0;
  const kp = 4;
  const ki = 0.01;
  const kd = 0.01;

  const boundAngle = function (theta) {
    // Use atan2 to make sure this stays in [-pi,pi]
    return Math.atan2(Math.sin(theta), Math.cos(theta));
  };

  const pid = function (errorP, errorI, errorD) {
    return kp * errorP + ki * errorI + kd * errorD;
  };

  var execute = function (state) {
    const distanceToGoal = {
      x: state.goal.x - state.x,
      y: state.goal.y - state.y
    };
    const thetaGoal = Math.atan2(distanceToGoal.y, distanceToGoal.x);
    const thetaError = boundAngle(thetaGoal - state.theta);

    accumulatedError += thetaError * state.dt;
    const w = pid(thetaError, accumulatedError, (thetaError - previousError) / state.dt);

    previousError = thetaError;

    return {
      w: w,
      v: state.v
    };
  };

  return {
    behaviour: 'GoToGoal',
    execute: execute
  };
};

module.exports = GoToGoal;