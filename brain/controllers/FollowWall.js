const geometry = require('../geometry');
const controlTheory = require('../controlTheory');

const FollowWall = function (controllers) {

  const getSensorGroup = function (sensors, sensorGroups) {
    // Get all sensors belonging to required group
    const group = sensors.filter(function (sensor) {
      return ~sensorGroups.indexOf(sensor.group);
    });

    // Sort them with smallest reading first
    return group.sort(function (s1, s2) {
      return s1.distance - s2.distance;
    });
  };

  const sumSensorReadings = function (sensors) {
    return sensors.reduce(function (total, sensor) {
      return total + sensor.distance;
    }, 0);
  };

  const getWallSensors = function (sensors) {
    // Group the sensors so we can find out which side the wall is on
    const leftGroup = getSensorGroup(sensors, [controllers.sensorGroups.Front, controllers.sensorGroups.Left]);
    const rightGroup = getSensorGroup(sensors, [controllers.sensorGroups.Front, controllers.sensorGroups.Right]);
    const leftReading = sumSensorReadings(leftGroup);
    const rightReading = sumSensorReadings(rightGroup);

    // Return 2 sensors that are closest to the wall on the correct side
    if (leftReading > rightReading) {
      return rightGroup.slice(0, 2);
    } else {
      return leftGroup.slice(0, 2);
    }
  };

  const getSensorReadingPoint = function (sensor) {
    const start = geometry.createPoint(sensor.x, sensor.y);
    const sensorVector = geometry.getVector(start, sensor.theta, sensor.distance);
    return sensorVector.end;
  };

  const execute = function (state) {
    const wallSensors = getWallSensors(state.sensors);
    const p1 = getSensorReadingPoint(wallSensors[0]);
    const p2 = getSensorReadingPoint(wallSensors[1]);

    // TODO may have to add logic to define direction of uFwT
    const uFwT = geometry.createPoint(p2.x - p1.x, p2.y - p1.y);
    const thetaFw = Math.atan2(uFwT.y, uFwT.x);
    const uFw = geometry.getVector(geometry.createPoint(state.x, state.y), thetaFw, 1);

    return {
      w: 0,
      v: state.v
    };
  };

  const reset = function () {
  };

  return {
    behaviour: controllers.behaviourTypes.FollowWall,
    execute: execute,
    reset: reset
  }
};

module.exports = FollowWall;