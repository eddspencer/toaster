const geometry = require('../geometry');
const controlTheory = require('../controlTheory');
const behaviourTypes = require('./behaviourTypes');
const sensorGroups = require('./sensorGroups');

const FollowWall = function () {

  var accumulatedError = 0;
  var previousError = 0;
  var previousSlide = null;

  const followWallDistance = 0.1;

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
    const leftGroup = getSensorGroup(sensors, [sensorGroups.Front, sensorGroups.Left]);
    const rightGroup = getSensorGroup(sensors, [sensorGroups.Front, sensorGroups.Right]);
    const leftReading = sumSensorReadings(leftGroup);
    const rightReading = sumSensorReadings(rightGroup);

    const getResult = function (slidingMode, leftGroup, rightGroup) {
      const getSensorsInDirectionOfTravel = function (sensors) {
        const twoClosestSensors = sensors.slice(0, 2);

        // Ensure sensors are ordered correctly for direction of travel
        // TODO have this order configurable inside the sensor
        return ['FF', 'FR', 'FL', 'BR', 'BL'].reduce(function (ordered, id) {
          twoClosestSensors.forEach(function (sensor) {
            if (id === sensor.id) {
              ordered.push(sensor);
            }
          });
          return ordered;
        }, []);
      };

      return {
        sliding: slidingMode,
        lostWall: false,
        sensors: getSensorsInDirectionOfTravel(slidingMode === sensorGroups.Right ? rightGroup : leftGroup)
      };
    };

    // Can be heading directly into wall, so test for this
    const frontSensor = getSensorGroup(sensors, [sensorGroups.Front]);
    const wallInFront = frontSensor ? frontSensor[0].distance < frontSensor[0].maxSensorDistance : false;

    // Return 2 sensors that are closest to the wall on the correct side
    if (leftReading > rightReading) {
      return getResult(sensorGroups.Right, leftGroup, rightGroup);
    } else if (leftReading === rightReading && !wallInFront) {
      // If readings are the same assume that sensors are not reading anything and
      // start to turn into the wall, assuming that the wall has ended. Turn into the wall by switching
      // sensor groups around
      // TODO this can turn you into the obstacle, maybe a better way to do this?
      //return getResult(previousSlide, rightGroup, leftGroup);
      return {
        sliding: previousSlide,
        lostWall: true
      };
    } else {
      // Bot has a tendency to turn right (sensors on left), who doesn't!
      return getResult(sensorGroups.Left, leftGroup, rightGroup);
    }
  };

  const getSensorReadingPoint = function (state, sensor) {
    const sensorVector = sensor.getVector(state, sensor.distance);
    return sensorVector.end;
  };

  const setProgressMade = function (state) {
    // Only set the progress made once at the start of following wall
    if (!state.progressMade) {
      state.progressMade = geometry.distanceBetweenPoints(state.goal, state);
    }
  };

  const execute = function (state) {
    setProgressMade(state);

    const sensorResult = getWallSensors(state.sensors);
    previousSlide = sensorResult.sliding;

    if (sensorResult.lostWall) {
      // attempt to just move towards wall gracefully
      const thetaError = sensorResult.sliding === sensorGroups.Right ? -Math.PI / 8 : Math.PI / 8;
      accumulatedError += thetaError * state.dt;

      const w = controlTheory.pid(thetaError, accumulatedError, (thetaError - previousError) / state.dt);
      previousError = thetaError;

      return {
        w: w,
        v: state.v
      };
    } else {
      const p1 = getSensorReadingPoint(state, sensorResult.sensors[0]);
      const p2 = getSensorReadingPoint(state, sensorResult.sensors[1]);

      // Calculate the wall segment in the direction of travel
      const uFwT = geometry.createPoint(p1.x - p2.x, p1.y - p2.y);

      // Calculate the vector from the robot to the wall segment
      const uFwTNorm = geometry.norm(uFwT);
      const uFwTP = geometry.createPoint(uFwT.x / uFwTNorm, uFwT.y / uFwTNorm);
      const uA = p2;
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
      previousError = result.thetaError;
      accumulatedError = result.accumulatedError;

      return {
        w: result.w,
        v: state.v
      };
    }
  };

  const reset = function () {
    previousError = 0;
    accumulatedError = 0;
    previousSlide = null;
  };

  return {
    behaviour: behaviourTypes.FollowWall,
    execute: execute,
    reset: reset
  }
};

module.exports = FollowWall;