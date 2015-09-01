const obstacleTypes = require('./mockObstacles').types;

const MockSensor = function (id, x, y, theta, importance) {
  // TODO add this to some config
  const minSensorDistance = 0.01;
  const maxSensorDistance = 0.1;

  const createPoint = function (x, y) {
    return {x: x, y: y}
  };

  const createLine = function (p1, p2) {
    return {start: p1, end: p2};
  };

  const getLineOfSensor = function (sensorPoint) {
    const end = createPoint(sensorPoint.x + Math.cos(theta) * maxSensorDistance, sensorPoint.y + Math.sin(theta) * maxSensorDistance);
    return createLine(sensorPoint, end);
  };

  const getLinesOfRectangle = function (rectangle) {
    // x,y is top left point of rectangle
    const x1 = rectangle.x;
    const x2 = rectangle.x + rectangle.width;
    const y1 = rectangle.y;
    const y2 = rectangle.y - rectangle.length;

    return [
      createLine(createPoint(x1, y1), createPoint(x1, y2)),
      createLine(createPoint(x1, y1), createPoint(x2, y1)),
      createLine(createPoint(x2, y2), createPoint(x1, y2)),
      createLine(createPoint(x2, y2), createPoint(x2, y1))
    ];
  };

  /**
   * Use cross product to check if the line intersect and find where on the line that they do
   */
  const getIntersectPoint = function (line1, line2) {
    const denominator = ((line2.end.y - line2.start.y) * (line1.end.x - line1.start.x)) -
      ((line2.end.x - line2.start.x) * (line1.end.y - line1.start.y));
    if (denominator === 0) {
      return false;
    } else {
      const xDist = line1.start.x - line2.start.x;
      const yDist = line1.start.y - line2.start.y;
      const numerator1 = ((line2.end.x - line2.start.x) * yDist) - ((line2.end.y - line2.start.y) * xDist);
      const numerator2 = ((line1.end.x - line1.start.x) * yDist) - ((line1.end.y - line1.start.y) * xDist);

      const a = numerator1 / denominator;
      const b = numerator2 / denominator;

      const onLine1 = a > 0 && a < 1;
      const onLine2 = b > 0 && b < 1;
      if (onLine1 && onLine2) {
        const x = line1.start.x + (a * (line1.end.x - line1.start.x));
        const y = line1.start.y + (a * (line1.end.y - line1.start.y));
        return createPoint(x, y);
      } else {
        return false;
      }
    }
  };

  const distanceBetweenPoints = function (p1, p2) {
    const xDist = p2.x - p1.x;
    const yDist = p2.y - p1.y;
    return Math.sqrt(xDist * xDist + yDist * yDist);
  };

  const getDistance = function (state) {
    const sensorPoint = createPoint(state.x + x, state.y + y);
    const sensorLine = getLineOfSensor(sensorPoint);

    const distancesToObstacles = state.obstacles.map(function (obstacle) {
      switch (obstacle.type) {
        case obstacleTypes.RECTANGLE:
          const lines = getLinesOfRectangle(obstacle);
          const intersectPoints = lines.reduce(function (intersections, line) {
            const p = getIntersectPoint(sensorLine, line);
            if (p) {
              intersections.push(p);
            }
            return intersections;
          }, []);
          const distances = intersectPoints.map(function (point) {
            return distanceBetweenPoints(sensorPoint, point);
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