const geometry = require('./geometry');

const controlTheory = function () {

  const kp = 4;
  const ki = 0.01;
  const kd = 0.01;

  const pid = function (errorP, errorI, errorD) {
    return kp * errorP + ki * errorI + kd * errorD;
  };

  const calculateTrajectory = function (state, heading, accumulatedError, previousError) {
    const thetaHeading = Math.atan2(heading.y, heading.x);
    const thetaError = geometry.boundAngle(thetaHeading - state.theta);

    accumulatedError += thetaError * state.dt;

    const w = pid(thetaError, accumulatedError, (thetaError - previousError) / state.dt);

    return {
      thetaError: thetaError,
      accumulatedError: accumulatedError,
      w: w
    };
  };

  return {
    pid: pid,
    calculateTrajectory: calculateTrajectory
  }
}();

module.exports = controlTheory;