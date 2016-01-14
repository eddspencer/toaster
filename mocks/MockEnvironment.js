const mockObstacles = require('./mockObstacles');

const mockEnvironment = function () {
  return {
    obstacles: [
      // TODO have various 'terrains' that you can choose from in the screen
      //mockObstacles.createRectangle('LeftWall', -0.5, 0.5, 1, 0.05),
      //mockObstacles.createRectangle('RightWall', 0.5, 0.5, 1, 0.05),
      mockObstacles.createRectangle('TopWall', -0.5, 0.5, 0.05, 1),
      //mockObstacles.createRectangle('Blocker', 0.1, 0.5, 1, 0.05),
      //mockObstacles.createRectangle('Blocker', -0.15, 0.5, 1, 0.05),
      //mockObstacles.createRectangle('Blocker', -0.5, 0.15, 0.05, 1),
      //mockObstacles.createRectangle('Blocker', -0.5, -0.1, 0.05, 1)
    ],
    goal: {
      x: 0,
      y: 0.75
    },
    x: 0,
    y: 0
  };
};

module.exports = mockEnvironment;