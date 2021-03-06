/**
 * Mock obstacles for the bot
 */
var obstacleTypes = Object.freeze({
  RECTANGLE: 'Rectangle'
});

var createRectangle = function (id, x, y, length, width) {
  return {
    id: id,
    type: obstacleTypes.RECTANGLE,
    x: x,
    y: y,
    length: length,
    width: width
  }
};

var mockObstacles = {
  types: obstacleTypes,
  createRectangle: createRectangle
};

module.exports = mockObstacles;