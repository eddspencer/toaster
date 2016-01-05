const chai = require('chai');
const chaiStats = require('chai-stats');
chai.use(chaiStats);

const expect = chai.expect;
const controllers = require('../brain/controllers/controllers');
const controlTheory = require('../brain/controlTheory');
const sensorGroups = require('../brain/controllers/sensorGroups');
const geometry = require('../brain/geometry');
const mockObstacles = require('../mocks/mockObstacles');
const MockBot = require('../mocks/MockBot');
const MockSensor = require('../mocks/MockSensor');

const environment = {
  controllers: controllers.all()
};
const mockBot = new MockBot(environment);

/**
 * X and Y in the location of bot in space, theta is the angle from the X axis.
 */
const state = {
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

describe('Avoid Obstacle Controller', function () {
  const controller = new controllers.AvoidObstacle();
  mockBot.updateSensors(state);
  const result = controller.execute(state);

  it('should create a new trajectory away from obstacle', function () {
    const expectedVector = geometry.createLine(geometry.createPoint(0, 0), geometry.createPoint(-0.1, 0));
    expect(state.obstacleAvoidance, "Obstacle avoidance vector computed successfully").to.almost.eql(expectedVector);
  });

  it('should turn away from the obstacle', function () {
    expect(result.w).to.not.equal(0);
    expect(result.v).to.equal(state.v);
  });

});

describe('Go To Goal Controller', function () {
  const controller = new controllers.GoToGoal();

  it('should create a new trajectory towards goal', function () {
    const relativeToGoal = geometry.createPoint(1, 2);
    const expectedW = controlTheory.calculateTrajectory(state, relativeToGoal, 0, 0).w;

    const result = controller.execute(state);
    expect(result.w).to.equal(expectedW);
    expect(result.v).to.equal(state.v);
  });

});

describe('Follow Wall Controller', function () {
  const controller = new controllers.FollowWall();
  const result = controller.execute(state);

  it('should turn the bot to follow the wall', function () {
    expect(result.w).to.equal(0);
    expect(result.v).to.equal(state.v);
  });

  it('should map the segment of the wall correctly', function () {
    expect(state.wallSegment).to.equal([0, 0]);
  });

  it('should calculate the follow wall trajectory', function () {
    expect(state.followWall).to.equal([0, 0]);
  });

  it('should calculate the trajectory perpendicular to the wall', function () {
    expect(state.followWallPerpendicular).to.equal([0, 0]);
  });

});

describe('Stop Controller', function () {
  const controller = new controllers.Stop();

  it('should stop the bot', function () {
    const result = controller.execute(state);
    expect(result.w).to.equal(0);
    expect(result.v).to.equal(0);
  });

});