/**
 * Mock robot with state for use in testing
 */

const obstacles = require('./mockobstacle');
const controllers = require('./controllers/controllers');

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

const behaviourTypes = Object.freeze({
  STOP: 'STOP',
  GOTOGOAL: 'GOTOGOAL'
});

const supervisor = function () {
  var controller = controllers.stop;

  const setBehaviour = function (behaviour) {
    switch (behaviour) {
      case behaviourTypes.GOTOGOAL:
        controller = controllers.goToGoal;
        break;
      case behaviourTypes.STOP:
        controller = controllers.stop;
        break;
      default:
        controller = controllers.stop;
        break;
    }
  };

  return {
    setBehaviour: setBehaviour,
    currentController: function () {
      return controller;
    }
  };
}();

const MockBot = function () {
  var behaviour = behaviourTypes.STOP;

  var state = {
    properties: ['x', 'y'],
    dt: 0.1,
    obstacles: [
      obstacles.createRectangle('LeftWall', -0.5, 0.5, 1, 0.05),
      obstacles.createRectangle('RightWall', 0.5, 0.5, 1, 0.05)
    ],
    goal: {
      x: 0.75,
      y: 0.25
    }
  };

  var values = function (obj) {
    return Object.keys(obj).map(function (key) {
      return obj[key];
    });
  };

  var setBehaviour = function (newBehaviour) {
    behaviour = newBehaviour;
    supervisor.setBehaviour(newBehaviour);
    console.log('Setting behaviour to be ' + behaviour);
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

    state.sensors = sensors;
    state.encoders = encoders;

    const output = supervisor.currentController().execute(state);

    // TODO how to move this to real bot?
    // TODO will be easier to debug when data pushed from client. Also better for multiple clients

    state.theta += output.w * state.dt;

    state.dx = output.v * Math.cos(state.theta);
    state.dy = output.v * Math.sin(state.theta);

    state.x += state.dx;
    state.y += state.dy;

    return state;
  };

  var reset = function () {
    setBehaviour(behaviourTypes.STOP);
    initState();
  };

  var initState = function () {
    state.x = 0;
    state.y = 0;
    state.v = 0.05;
    state.dx = 0;
    state.dy = 0;
    state.theta = Math.atan2(state.dy, state.dx);
  };

  initState();

  return {
    config: {
      currentBehaviour: behaviour,
      behaviours: values(behaviourTypes)
    },
    setBehaviour: setBehaviour,
    currentState: currentState,
    reset: reset
  };
};

module.exports = MockBot;