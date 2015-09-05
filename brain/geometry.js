const geometry = function () {

  const createPoint = function (x, y) {
    return {x: x, y: y}
  };

  const createLine = function (p1, p2) {
    return {start: p1, end: p2};
  };

  const getVector = function (start, theta, length) {
    const end = createPoint(start.x + Math.cos(theta) * length, start.y + Math.sin(theta) * length);
    return createLine(start, end);
  };

  const distanceBetweenPoints = function (p1, p2) {
    const xDist = p2.x - p1.x;
    const yDist = p2.y - p1.y;
    return Math.sqrt(xDist * xDist + yDist * yDist);
  };

  const norm = function (p) {
    return Math.sqrt(p.x * p.x + p.y * p.y);
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

  const boundAngle = function (theta) {
    // Use atan2 to make sure this stays in [-pi,pi]
    return Math.atan2(Math.sin(theta), Math.cos(theta));
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

  const addVectors = function (v1, v2) {
    const start = createPoint(v1.start.x + v2.start.x, v1.start.y + v2.start.y);
    const end = createPoint(v1.end.x + v2.end.x, v1.end.y + v2.end.y);
    return createLine(start, end);
  };

  /**
   * Transform using matrix: R = [cos(theta) -sin(theta) x; sin(theta) cos(theta) y; 0 0 1];
   * and  v = [x y 1] to get the points rotated by theta. Theta rotates anti-clockwise
   */
  const transform = function (x, y, theta) {
    const xT = x * Math.cos(-theta) + y * Math.sin(-theta);
    const yT = -x * Math.sin(-theta) + y * Math.cos(-theta);
    return {
      x: xT,
      y: yT
    };
  };

  return {
    boundAngle: boundAngle,
    createPoint: createPoint,
    createLine: createLine,
    getLinesOfRectangle: getLinesOfRectangle,
    distanceBetweenPoints: distanceBetweenPoints,
    norm: norm,
    getVector: getVector,
    getIntersectPoint: getIntersectPoint,
    addVectors: addVectors,
    transform: transform
  };
}();

module.exports = geometry;