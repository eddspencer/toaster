const events = require('./events');
const behaviourTypes = require('./controllers/behaviourTypes');

const Supervisor = function (config) {
  const controllers = config.controllers;
  const eventConfig = config.eventConfig || {
    "AT_GOAL": {weighting: 100, behaviour: behaviourTypes.Stop},
    "UNSAFE": {weighting: 90, behaviour: behaviourTypes.AvoidObstacle},
    "AT_OBSTACLE": {weighting: 80, behaviour: behaviourTypes.FollowWall},
    "CLEARED_OBSTACLE": {weighting: 0, behaviour: behaviourTypes.GoToGoal},
    "PROGRESS_MADE": {weighting: 0, behaviour: behaviourTypes.GoToGoal}
  };
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
      x: config.x || 0,
      y: config.y || 0,
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
        state.progressMade = null; // Changing behaviour resets any progress you may have had in previous state
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

  const sortEvents = function(events) {
    return events.sort(function(e1, e2) {
        return eventConfig[e2].weighting - eventConfig[e1].weighting;
    });
  };

  const processEvents = function (currentEvents) {
    if (currentEvents.length > 0) {
      const sorted = sortEvents(currentEvents);
      const behaviour = eventConfig[sorted[0]].behaviour;
      setBehaviour(behaviour);
    }
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
