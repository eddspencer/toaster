/**
 * Checks the state and will fire events depending on configuration and current state, for example the
 * 'reached goal' event
 *
 */

const events = require('./events');
const behaviourTypes = require('./controllers/controllers').behaviourTypes;

const Sentinel = function (params) {

  const absDifference = function (p1, p2) {
    return Math.abs(p2 - p1);
  };

  const checkReachedGoal = function (state) {
    const xDiff = absDifference(state.goal.x, state.x);
    const yDiff = absDifference(state.goal.y, state.y);
    if (xDiff <= config.reachedGoalMargin && yDiff <= config.reachedGoalMargin) {
      return events.AT_GOAL;
    }
  };

  const checkForObstacles = function (state) {
    const sensorsActive = state.sensors.reduce(function (atObstacle, sensor) {
      if (!atObstacle) {
        atObstacle = sensor.distance < config.atObstacleMargin;
      }
      return atObstacle;
    }, false);
    if (sensorsActive) {
      return events.AT_OBSTACLE;
    } else if (behaviourTypes.AvoidObstacle === state.currentBehaviour) {
      return events.CLEARED_OBSTACLE;
    }
  };

  const checks = [checkReachedGoal, checkForObstacles];
  const config = params || {
      reachedGoalMargin: 0.1,
      atObstacleMargin: 0.08
    };

  const analyse = function (state) {
    return checks.reduce(function (events, check) {
      const event = check(state);
      if (event) {
        events.push(event);
      }
      return events;
    }, []);
  };

  return {
    analyse: analyse
  };
};

module.exports = Sentinel;