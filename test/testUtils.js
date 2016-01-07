const controllers = require('../brain/controllers/controllers');
const sensorGroups = require('../brain/controllers/sensorGroups');
const mockObstacles = require('../mocks/mockObstacles');
const MockSensor = require('../mocks/MockSensor');
const MockBot = require('../mocks/MockBot');

const testUtils = {
  mockBot: function () {
    const environment = {
      controllers: controllers.all()
    };
    return new MockBot(environment);
  },
  state: function () {
    /**
     * X and Y in the location of bot in space, theta is the angle from the X axis.
     */
    return {
      x: 0,
      y: 0,
      theta: 0,
      goal: {
        x: 1,
        y: 3
      },
      obstacles: [
        mockObstacles.createRectangle('Blocker', 0.1, 0.1, 0.2, 0.05) // Wall directly in front of bot
      ],
      sensors: [
        new MockSensor('Front', 0, 0, 0, sensorGroups.Front, 1),
        new MockSensor('Back', 0, 0, Math.PI, sensorGroups.Back, 1)
      ],
      dt: 0.01
    };
  }
};

module.exports = testUtils;