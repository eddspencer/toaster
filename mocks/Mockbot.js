/**
 * Mock robot with state for use in testing
 */

const mockObstacles = require('./mockObstacles');
const controllers = require('./../brain/controllers/controllers');
const Supervisor = require('./../brain/Supervisor');
const Sentinel = require('./../brain/Sentinel');
const MockSensor = require('./MockSensor');

const MockEncoder = function (id) {
  return {
    id: id,
    voltage: Math.random()
  }
};

const MockBot = function () {
  const frSensor = new MockSensor('FR', 0.05, -0.02, Math.PI / 4);
  const flSensor = new MockSensor('FL', 0.05, 0.02, -Math.PI / 4);
  const ffSensor = new MockSensor('FF', 0.05, 0, 0);
  const brSensor = new MockSensor('BR', -0.05, -0.02, 3 * Math.PI / 4);
  const blSensor = new MockSensor('BL', -0.05, 0.02, -3 * Math.PI / 4);
  const sensors = [frSensor, flSensor, ffSensor, brSensor, blSensor];

  const leftEncoder = new MockEncoder('L');
  const rightEncoder = new MockEncoder('R');
  const encoders = [leftEncoder, rightEncoder];

  const supervisor = new Supervisor({
    controllers: controllers.all(),
    dt: 0.1,
    obstacles: [
      //mockObstacles.createRectangle('LeftWall', -0.5, 0.5, 1, 0.05),
      //mockObstacles.createRectangle('LeftWall', -0.5, 0.5, 1, 0.05),
      mockObstacles.createRectangle('Blocker', 0.1, 0.5, 1, 0.05)
    ],
    goal: {
      x: 0.75,
      y: 0.25
    },
    sensors: sensors,
    encoders: encoders
  });

  const sentinel = new Sentinel();

  var setBehaviour = function (newBehaviour) {
    supervisor.setBehaviour(newBehaviour);
  };

  var currentState = function () {
    const state = supervisor.currentState();
    state.sensors.forEach(function (sensor) {
     // sensor.distance = sensor.getDistance(state);
    });
    supervisor.execute(state);

    const events = sentinel.analyse(state);
    supervisor.processEvents(events);

    return state;
  };

  var reset = function () {
    console.log('Resetting');
    supervisor.reset();
  };

  return {
    // TODO Move this to state? Or move other things to config...
    config: {
      currentBehaviour: supervisor.currentBehaviour(),
      behaviours: controllers.behaviourTypes.asList()
    },
    setBehaviour: setBehaviour,
    currentState: currentState,
    reset: reset
  };
};

module.exports = MockBot;