const events = require('./events');
const behaviourTypes = require('./controllers/behaviourTypes');

const Supervisor = function (config) {
  const controllers = config.controllers;
  var controller;
  var state;

  const initState = function () {
    controller = controllers.Stop;
    state = {
      properties: ['x', 'y', 'theta', 'v'],
      dt: config.dt,
      v: config.v,
      obstacles: config.obstacles,
      sensors: config.sensors,
      encoders: config.encoders,
      goal: config.goal,
      currentBehaviour: controller.behaviour,
      x: 0,
      y: 0,
      dx: 0,
      dy: 0,
      theta: Math.PI / 4
    };
  };

  /**
   * Set the current behaviour of the system, only changes if the behaviour is different.
   *
   * @param behaviour The new behaviour
   * @returns {boolean} Whether a change was made
   */
  const setBehaviour = function (behaviour) {
    if (behaviour !== state.currentBehaviour) {
      const validControllers = controllers.asList.filter(function (controller) {
        return controller.behaviour === behaviour
      });

      if (1 === validControllers.length) {
        console.log('Setting behaviour to be ' + behaviour);
        controller.reset();
        controller = validControllers[0];
        state.currentBehaviour = controller.behaviour;
      } else {
        console.error('Unable to get single controller for ' + behaviour + ' got: ' + validControllers);
      }
      return true;
    }
    return false;
  };

  const setGoal = function (newGoal) {
    state.goal = newGoal;
  };

  const processEvents = function (currentEvents) {
    currentEvents.forEach(function (event) {
      switch (event) {
        case events.AT_GOAL:
          setBehaviour(behaviourTypes.Stop);
          break;
        case events.AT_OBSTACLE:
          setBehaviour(behaviourTypes.FollowWall);
          break;
        case events.UNSAFE:
          setBehaviour(behaviourTypes.AvoidObstacle);
          break;
        case events.CLEARED_OBSTACLE:
          setBehaviour(behaviourTypes.GoToGoal);
          break;
        case events.PROGRESS_MADE:
          setBehaviour(behaviourTypes.GoToGoal);
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

  initState();

  return {
    execute: execute,
    setBehaviour: setBehaviour,
    setGoal: setGoal,
    processEvents: processEvents,
    reset: reset,
    currentState: function () {
      return state;
    }
  };
};

module.exports = Supervisor;
