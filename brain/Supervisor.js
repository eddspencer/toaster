const events = require('./events');
const behaviourTypes = require('./controllers/controllers').behaviourTypes;

const Supervisor = function (config) {
  const controllers = config.controllers;
  var controller = controllers.Stop;
  const state = {
    properties: ['x', 'y'],
    dt: config.dt,
    obstacles: config.obstacles,
    goal: config.goal
  };

  const initState = function () {
    state.x = 0;
    state.y = 0;
    state.v = 0.05;
    state.dx = 0;
    state.dy = 0;
    state.theta = Math.atan2(state.dy, state.dx);
  };

  const setBehaviour = function (behaviour) {
    const validControllers = controllers.asList.filter(function (controller) {
      return controller.behaviour === behaviour
    });

    if (1 === validControllers.length) {
      console.log('Setting behaviour to be ' + behaviour);
      controller = validControllers[0];
    } else {
      console.error('Unable to get single controller for ' + behaviour + ' got: ' + validControllers);
    }
  };

  const processEvents = function (currentEvents) {
    currentEvents.forEach(function (event) {
      switch (event) {
        case events.AT_GOAL:
          if (controllers.Stop !== controller) {
            console.log('At Goal');
            setBehaviour(behaviourTypes.Stop);
          }
          break;
      }
    });
  };

  const reset = function () {
    setBehaviour(behaviourTypes.Stop);
    initState();
  };

  const execute = function (state) {
    const output = controller.execute(state);

    // TODO will be easier to debug when data pushed from client. Also better for multiple clients

    state.theta += output.w * state.dt;

    state.dx = output.v * Math.cos(state.theta);
    state.dy = output.v * Math.sin(state.theta);

    state.x += state.dx;
    state.y += state.dy;
  };

  const currentBehaviour = function () {
    return controller.behaviour;
  };

  initState();

  return {
    execute: execute,
    setBehaviour: setBehaviour,
    processEvents: processEvents,
    reset: reset,
    currentState: function () {
      return state;
    },
    currentBehaviour: currentBehaviour
  };
};

module.exports = Supervisor;
