/**
 * Checks the state and will fire events depending on configuration and current state, for example the
 * 'reached goal' event
 *
 */

const geometry = require('./geometry');
const events = require('./events');
const behaviourTypes = require('./controllers/controllers').behaviourTypes;

const Sentinel = function (params) {

  const absDifference = function (p1, p2) {
    return Math.abs(p2 - p1);
  };

  const isBehaviour = function (behaviour, checkList) {
    return ~checkList.indexOf(behaviour);
  };

  const checkReachedGoal = function (state) {
    const xDiff = absDifference(state.goal.x, state.x);
    const yDiff = absDifference(state.goal.y, state.y);
    if (xDiff <= config.reachedGoalMargin && yDiff <= config.reachedGoalMargin) {
      return events.AT_GOAL;
    }
  };

  const isObstacleWithin = function (sensors, distance) {
    return sensors.reduce(function (withinDistance, sensor) {
      if (!withinDistance) {
        withinDistance = sensor.distance < distance;
      }
      return withinDistance;
    }, false);
  };

  const checkForObstacles = function (state) {
    if (state.currentBehaviour === behaviourTypes.Stop) {
      return false;
    } else {
      const atObstacle = isObstacleWithin(state.sensors, config.atObstacleMargin);
      if (atObstacle) {
        const unsafe = isObstacleWithin(state.sensors, config.unsafeMargin);
        if (unsafe) {
          return events.UNSAFE;
        } else {
          return events.AT_OBSTACLE;
        }
      } else if (!isBehaviour(state.currentBehaviour, [behaviourTypes.GoToGoal, behaviourTypes.FollowWall])) {
        return events.CLEARED_OBSTACLE;
      }
    }
  };

  const progressMade = function (state) {
    if (state.progressMade) {
      const distanceToGoal = geometry.norm(geometry.createPoint(state.goal.x - state.x, state.goal.y, state.y));
      const atObstacle = isObstacleWithin(state.sensors, config.atObstacleMargin);
      if (!isBehaviour(state.currentBehaviour, [behaviourTypes.GoToGoal, behaviourTypes.Stop]) && !atObstacle && distanceToGoal < state.progressMade) {
        return events.PROGRESS_MADE;
      }
    }
  };

  const checks = [checkReachedGoal, checkForObstacles, progressMade];
  const config = params || {
      reachedGoalMargin: 0.1,
      atObstacleMargin: 0.1,
      unsafeMargin: 0.05
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