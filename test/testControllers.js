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
    const relativeToGoal = geometry.createPoint(1, 3);
    const expectedW = controlTheory.calculateTrajectory(state, relativeToGoal, 0, 0).w;

    const result = controller.execute(state);
    expect(result.w).to.equal(expectedW);
    expect(result.v).to.equal(state.v);
  });

});

describe('Follow Wall Controller', function () {
  const controller = new controllers.FollowWall();
  const fwState = Object.create(state);
  fwState.sensors = mockBot.sensors;
  mockBot.updateSensors(fwState);

  const result = controller.execute(fwState);

  it('should turn the bot to follow the wall', function () {
    expect(result.w, "Turn right, wall on left").to.be.negtive;
    expect(result.v).to.equal(fwState.v);
  });

  it('should set the progress made, how close it is to goal when starting to follow', function () {
    const distanceToGoal = geometry.norm(fwState.goal);
    expect(fwState.progressMade).to.equal(distanceToGoal);
  });

  it('should map the segment of the wall correctly', function () {
    expect(fwState.wallSegment.start.x, "Start of vertical wall at 0.1").to.equal(0.1);
    expect(fwState.wallSegment.start.y, "From left sensor").to.be.positive;
    expect(fwState.wallSegment.end.x, "End of vertical wall at 0.1").to.equal(0.1);
    expect(fwState.wallSegment.end.y, "From left sensor").to.equal(0);
  });

  it('should calculate the follow wall trajectory parallel to the wall', function () {
    expect(fwState.followWall.start, "Start at bot").to.eql(geometry.createPoint(0, 0));
    expect(fwState.followWall.end, "Vertical line").to.eql(geometry.createPoint(0, -0.1));
  });

  it('should calculate the trajectory perpendicular and away from the wall', function () {
    expect(fwState.followWallPerpendicular.start, "Start at bot").to.eql(geometry.createPoint(0, 0));
    expect(fwState.followWallPerpendicular.end, "Horizontal line").to.eql(geometry.createPoint(0.1, 0));
  });

  it('should follow wall on right if angled correctly', function () {
    const fwAngleState = Object.create(fwState);
    fwAngleState.theta = Math.PI / 4; // 45 degrees up so follow vertical wall on right
    mockBot.updateSensors(fwAngleState);

    const result = controller.execute(fwAngleState);
    expect(result.w, "Turn left, wall on right").to.be.positive;
    expect(result.v).to.equal(fwState.v);
  });

  it('should move towards wall when wall is lost', function () {
    const fwAngleState = Object.create(fwState);
    fwAngleState.theta = Math.PI; // 180 degree turn on spot to loose wall
    mockBot.updateSensors(fwAngleState);

    const result = controller.execute(fwAngleState);
    expect(result.w, "Turn left, wall on right").to.be.positive;
    expect(result.v).to.equal(fwState.v);
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