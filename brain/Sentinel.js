/**
 * Checks the state and will fire events depending on configuration and current state, for example the
 * 'reached goal' event
 *
 */

const events = require('./events');

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

  const config = params || {
      checks: [checkReachedGoal],
      reachedGoalMargin: 0.01
    };

  const analyse = function (state) {
    return config.checks.reduce(function (events, check) {
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