const geometry = require('../geometry');
const controlTheory = require('../controlTheory');

const AvoidObstacle = function () {
  var accumulatedError = 0;
  var previousError = 0;

  // Calculate the summed, weighted vector of the sensor headings. Larger the sensor reading the
  // more you want to go in that direction
  const getObstacleAvoidance = function (state) {
    return state.sensors.reduce(function (obstacleAvoidance, sensor) {
      const point = geometry.createPoint(0, 0); // as summing always start from centre of robot
      const vector = geometry.getVector(point, sensor.theta, -sensor.distance * sensor.importance);
      return geometry.addVectors(obstacleAvoidance, vector);
    }, geometry.createLine(geometry.createPoint(0, 0), geometry.createPoint(0, 0)));
  };

  const execute = function (state) {
    const obstacleAvoidance = getObstacleAvoidance(state);
    state.obstacleAvoidance = obstacleAvoidance; // Update state so vector can be drawn

    const result = controlTheory.calculateTrajectory(state, obstacleAvoidance.end, accumulatedError, previousError);
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
    behaviour: 'AvoidObstacle',
    execute: execute,
    reset: reset
  }
};

module.exports = AvoidObstacle;