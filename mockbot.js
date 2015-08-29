/**
 * Mock robot with state for use in testing
 */

var obstacles = require('./mockobstacle');

var MockEncoder = function (id) {
  return {
    id: id,
    voltage: Math.random()
  }
};

var MockSensor = function (id, x, y, theta) {
  return {
    id: id,
    x: x,
    y: y,
    theta: theta,
    distance: Math.random() / 10
  }
};

var behaviourTypes = Object.freeze({
  STOP: 'STOP',
  START: 'START'
});

var MockBot = function () {
  var count = 0;
  var behaviour = behaviourTypes.STOP;

  var values = function (obj) {
    return Object.keys(obj).map(function (key) {
      return obj[key];
    });
  };

  var setBehaviour = function (newBehaviour) {
    behaviour = newBehaviour;
    console.log('Setting behaviour to be ' + behaviour);
  };

  var currentState = function () {
    var frSensor = new MockSensor('FR', 0.02, 0.05, -Math.PI / 4);
    var flSensor = new MockSensor('FL', -0.02, 0.05, -3 * Math.PI / 4);
    var ffSensor = new MockSensor('FF', 0, 0.05, -Math.PI / 2);
    var brSensor = new MockSensor('BR', 0.025, -0.045, 0);
    var blSensor = new MockSensor('BL', -0.025, -0.045, Math.PI);
    var sensors = [frSensor, flSensor, ffSensor, brSensor, blSensor];

    var leftEncoder = new MockEncoder('L');
    var rightEncoder = new MockEncoder('R');
    var encoders = [leftEncoder, rightEncoder];

    var currentState = {
      properties: ['x', 'y'],
      sensors: sensors,
      encoders: encoders,
      x: count / 100,
      y: count / 100,
      dx: 0.01,
      dy: 0.01,
      obstacles: [
        obstacles.createRectangle('LeftWall', -0.5, 0.5, 1, 0.05),
        obstacles.createRectangle('RightWall', 0.5, 0.5, 1, 0.05)
      ],
      goal: {
        x: 0.75,
        y: 0
      }
    };

    // Mimic behaviour logic
    if (behaviourTypes.START === behaviour) {
      count++;
    }
    return currentState;
  };

  var reset = function () {
    count = 0;
    setBehaviour(behaviourTypes.STOP);
  };

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