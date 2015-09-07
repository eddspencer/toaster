const geometry = require('../geometry');
const controlTheory = require('../controlTheory');

const FollowWall = function (controllers) {

  var accumulatedError = 0;
  var previousError = 0;
  var previousSlide = null;

  const followWallDistance = 0.15;

  const getSensorGroup = function (sensors, sensorGroups) {
    // Get all sensors belonging to required group
    const group = sensors.filter(function (sensor) {
      return ~sensorGroups.indexOf(sensor.group);
    });

    // Sort them with smallest reading first and largest importance first
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

    const getResult = function (slidingMode, leftGroup, rightGroup) {
      return {
        sliding: slidingMode,
        sensors: slidingMode === controllers.sensorGroups.Right ? rightGroup.slice(0, 2) : leftGroup.slice(0, 2)
      };
    };

    // Return 2 sensors that are closest to the wall on the correct side
    if (leftReading > rightReading) {
      return getResult(controllers.sensorGroups.Right, leftGroup, rightGroup);
    } else if (leftReading === rightReading) {
      // If readings are the same assume that sensors are not reading anything and
      // continue the way you were before
      return getResult(previousSlide, leftGroup, rightGroup);
    } else {
      return getResult(controllers.sensorGroups.Left, leftGroup, rightGroup);
    }
  };

  const getSensorReadingPoint = function (state, sensor) {
    const sensorVector = sensor.getVector(state, sensor.distance);
    return sensorVector.end;
  };

  const setProgressMade = function (state) {
    if (!state.progressMade) {
      state.progressMade = geometry.norm(geometry.createPoint(state.goal.x - state.x, state.goal.y, state.y));
    }
  };

  const execute = function (state) {
    setProgressMade(state);

    const sensorResult = getWallSensors(state.sensors);
    previousSlide = sensorResult.sliding;

    const p1 = getSensorReadingPoint(state, sensorResult.sensors[0]);
    const p2 = getSensorReadingPoint(state, sensorResult.sensors[1]);

    // Calculate the wall segment in the direction of travel
    const uFwT = geometry.createPoint(p2.x - p1.x, p2.y - p1.y);

    // Calculate the vector from the robot to the wall segment
    const uFwTNorm = geometry.norm(uFwT);
    const uFwTP = geometry.createPoint(uFwT.x / uFwTNorm, uFwT.y / uFwTNorm);
    const uA = p1;
    const uP = geometry.createPoint(state.x, state.y);

    // Calculate: u_fw_p = ((u_a-u_p)-((u_a-u_p)'*u_fw_tp)*u_fw_tp)
    const uAuPDiff = geometry.createPoint(uA.x - uP.x, uA.y - uP.y);
    const uAuPDiffDotUFwTP = uAuPDiff.x * uFwTP.x + uAuPDiff.y * uFwTP.y;

    const uFwP = geometry.createPoint(uAuPDiff.x - uAuPDiffDotUFwTP * uFwTP.x, uAuPDiff.y - uAuPDiffDotUFwTP * uFwTP.y);

    // Get the vector perpendicular to the wall segment that will keep you a constant
    // distance from the segment
    const uFwPNorm = geometry.norm(uFwP);
    const uFwPP = geometry.createPoint(uFwP.x / uFwPNorm, uFwP.y / uFwPNorm);
    const uFw = geometry.createPoint(
      followWallDistance * uFwTP.x + (uFwP.x - followWallDistance * uFwPP.x),
      followWallDistance * uFwTP.y + (uFwP.y - followWallDistance * uFwPP.y)
    );

    // Calculate heading
    state.followWall = geometry.createLine(geometry.createPoint(0, 0), uFw);
    state.wallSegment = geometry.createLine(p2, p1);
    state.followWallPerpendicular = geometry.createLine(geometry.createPoint(0, 0), uFwP);

    const result = controlTheory.calculateTrajectory(state, uFw, accumulatedError, previousError);
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
    previousSlide = null;
  };

  return {
    behaviour: controllers.behaviourTypes.FollowWall,
    execute: execute,
    reset: reset
  }
};

module.exports = FollowWall;