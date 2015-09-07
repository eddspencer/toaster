const obstacleTypes = require('./mockObstacles').types;
const geometry = require('../brain/geometry');

const MockSensor = function (id, x, y, theta, group, importance) {
  // TODO add this to some config
  const minSensorDistance = 0.01;
  const maxSensorDistance = 0.2;

  const getVector = function (state, distance) {
    // Get sensor point in the world frame and compute sensor visibility
    const sensorRotated = geometry.transform(x, y, state.theta);
    const sensorPoint = geometry.createPoint(state.x + sensorRotated.x, state.y + sensorRotated.y);
    return geometry.getVector(sensorPoint, theta + state.theta, distance);
  };

  const getDistance = function (state) {
    const sensorLine = getVector(state, maxSensorDistance);

    const distancesToObstacles = state.obstacles.map(function (obstacle) {
      switch (obstacle.type) {
        case obstacleTypes.RECTANGLE:
          const lines = geometry.getLinesOfRectangle(obstacle);
          const intersectPoints = lines.reduce(function (intersections, line) {
            const p = geometry.getIntersectPoint(sensorLine, line);
            if (p) {
              intersections.push(p);
            }
            return intersections;
          }, []);
          const distances = intersectPoints.map(function (point) {
            return geometry.distanceBetweenPoints(sensorLine.start, point);
          });
          return Math.min.apply(null, distances);
        default:
          console.error('Unknown obstacle type');
          return maxSensorDistance;
      }
    });

    const distance = Math.min.apply(null, distancesToObstacles);

    // Only update reading if obstacle is within the maximum  and minimum sensor range
    if (distance > minSensorDistance && distance < maxSensorDistance) {
      return distance;
    } else {
      return maxSensorDistance;
    }
  };

  return {
    id: id,
    x: x,
    y: y,
    theta: theta,
    group: group,
    importance: importance,
    distance: maxSensorDistance,
    maxSensorDistance: maxSensorDistance,
    getVector: getVector,
    getDistance: getDistance
  };
};

module.exports = MockSensor;