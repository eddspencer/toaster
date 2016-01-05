const controllers = require('../brain/controllers/controllers');

const mockEnvironment = function () {
  return {
    controllers: controllers.all(),
    dt: 0.1, // TODO what units is this?
    v: 0.025,
    obstacles: [
      // TODO have various 'terrains' that you can choose from in the screen
      mockObstacles.createRectangle('LeftWall', -0.5, 0.5, 1, 0.05),
      mockObstacles.createRectangle('RightWall', 0.5, 0.5, 1, 0.05),
      mockObstacles.createRectangle('TopWall', -0.5, 0.5, 0.05, 1)
      //mockObstacles.createRectangle('Blocker', 0.1, 0.5, 1, 0.05),
      //mockObstacles.createRectangle('Blocker', -0.15, 0.5, 1, 0.05),
      //mockObstacles.createRectangle('Blocker', -0.5, 0.15, 0.05, 1),
      //mockObstacles.createRectangle('Blocker', -0.5, -0.1, 0.05, 1)
    ],
    goal: {
      x: 0.75,
      y: 0.25
    }
  };
};

module.exports = mockEnvironment;