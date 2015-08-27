/**
 * Mock obstacles for the bot
 */
var obstacleTypes = Object.freeze({
  RECTANGLE: 'Rectangle'
});

var createRectangle = function (id, x, y) {
  return {
    id: id,
    type: obstacleTypes.RECTANGLE,
    x: x,
    y: y,
    width: 10,
    length: 100
  }
};

var obstacles = {
  types: obstacleTypes,
  createRectangle: createRectangle
};

module.exports = obstacles;