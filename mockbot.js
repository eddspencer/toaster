/**
 * Mock robot with state for use in testing
 */

const obstacles = require('./mockobstacle');
const controllers = require('./brain/controllers/controllers');
const Supervisor = require('./brain/Supervisor');

const MockEncoder = function (id) {
  return {
    id: id,
    voltage: Math.random()
  }
};

const MockSensor = function (id, x, y, theta) {
  return {
    id: id,
    x: x,
    y: y,
    theta: theta,
    distance: Math.random() / 10
  }
};

const MockBot = function () {
  const supervisor = new Supervisor({
    controllers: controllers.all(),
    dt: 0.1,
    obstacles: [
      obstacles.createRectangle('LeftWall', -0.5, 0.5, 1, 0.05),
      obstacles.createRectangle('RightWall', 0.5, 0.5, 1, 0.05)
    ],
    goal: {
      x: 0.75,
      y: 0.25
    }
  });

  var setBehaviour = function (newBehaviour) {
    console.log('Setting behaviour to be ' + newBehaviour);
    supervisor.setBehaviour(newBehaviour);
  };

  var currentState = function () {
    // Create these every time to randomise sensor output (for now)
    var frSensor = new MockSensor('FR', 0.02, 0.05, -Math.PI / 4);
    var flSensor = new MockSensor('FL', -0.02, 0.05, -3 * Math.PI / 4);
    var ffSensor = new MockSensor('FF', 0, 0.05, -Math.PI / 2);
    var brSensor = new MockSensor('BR', 0.025, -0.045, 0);
    var blSensor = new MockSensor('BL', -0.025, -0.045, Math.PI);
    var sensors = [frSensor, flSensor, ffSensor, brSensor, blSensor];

    var leftEncoder = new MockEncoder('L');
    var rightEncoder = new MockEncoder('R');
    var encoders = [leftEncoder, rightEncoder];

    const state = supervisor.currentState();

    state.sensors = sensors;
    state.encoders = encoders;

    supervisor.execute(state);

    return state;
  };

  var reset = function () {
    console.log('Resetting');
    supervisor.reset();
  };

  return {
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