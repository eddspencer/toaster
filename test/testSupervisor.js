const expect = require('chai').expect;
const controllers = require('../brain/controllers/controllers');
const behaviourTypes = require('../brain/controllers/behaviourTypes');
const mockObstacles = require('../mocks/mockObstacles');
const Supervisor = require('../brain/Supervisor');

describe('Supervior', function () {
  const supervisor = new Supervisor({
    controllers: controllers.all(),
    dt: 0.1,
    v: 0.025,

    // TODO separate the bot and environment configurations
    obstacles: [
      mockObstacles.createRectangle('LeftWall', -0.5, 0.5, 1, 0.05),
      mockObstacles.createRectangle('RightWall', 0.5, 0.5, 1, 0.05),
      mockObstacles.createRectangle('TopWall', -0.5, 0.5, 0.05, 1)
    ],
    goal: {
      x: 0.75,
      y: 0.25
    },
    sensors: []
  });

  it('should not change behaviour if there is no change to make', function () {
    const changed = supervisor.setBehaviour(behaviourTypes.Stop);
    expect(changed).to.equal(false);
  });

});