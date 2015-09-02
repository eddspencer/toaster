const obstacleTypes = require('./mockObstacles').types;
const geometry = require('../brain/geometry');

const MockSensor = function (id, x, y, theta, importance) {
  // TODO add this to some config
  const minSensorDistance = 0.01;
  const maxSensorDistance = 0.1;

  const getDistance = function (state) {
    const sensorPoint = geometry.createPoint(state.x + x, state.y + y);
    // Rotate out of the robots frame of reference to the world frame and compute vector
    const sensorLine = geometry.getVector(sensorPoint, theta - state.theta, maxSensorDistance);

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
            return geometry.distanceBetweenPoints(sensorPoint, point);
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
    importance: importance,
    distance: maxSensorDistance,
    maxSensorDistance: maxSensorDistance,
    getDistance: getDistance
  };
};

module.exports = MockSensor;