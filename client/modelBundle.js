(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Checks the state and will fire events depending on configuration and current state, for example the
 * 'reached goal' event
 *
 */

const geometry = require('./geometry');
const events = require('./events');
const behaviourTypes = require('./controllers/behaviourTypes');

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
      const distanceToGoal = geometry.distanceBetweenPoints(state.goal, state);
      if (!isBehaviour(state.currentBehaviour, [behaviourTypes.GoToGoal, behaviourTypes.Stop]) && distanceToGoal + config.epsilonProgressMade < state.progressMade) {
        return events.PROGRESS_MADE;
      }
    }
  };

  const checks = [checkReachedGoal, checkForObstacles, progressMade];
  const config = params || {
      reachedGoalMargin: 0.1,
      atObstacleMargin: 0.15,
      unsafeMargin: 0.03,
      epsilonProgressMade: 0.15
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
},{"./controllers/behaviourTypes":9,"./events":12,"./geometry":13}],2:[function(require,module,exports){
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

},{"./controllers/behaviourTypes":9,"./events":12}],3:[function(require,module,exports){
const VoiceBox = function (state) {
  this.debugFlag = false;

  this.debug = function (txt) {
    if (this.debugFlag) {
      console.log(txt);
    }
  };

};

module.exports = VoiceBox;
},{}],4:[function(require,module,exports){
const geometry = require('./geometry');

const controlTheory = function () {

  const kp = 4;
  const ki = 0.01;
  const kd = 0.01;

  const pid = function (errorP, errorI, errorD) {
    return kp * errorP + ki * errorI + kd * errorD;
  };

  const calculateTrajectory = function (state, heading, accumulatedError, previousError) {
    const thetaHeading = Math.atan2(heading.y, heading.x);
    const thetaError = geometry.boundAngle(thetaHeading - state.theta);

    accumulatedError += thetaError * state.dt;

    const w = pid(thetaError, accumulatedError, (thetaError - previousError) / state.dt);

    return {
      thetaError: thetaError,
      accumulatedError: accumulatedError,
      w: w
    };
  };

  return {
    pid: pid,
    calculateTrajectory: calculateTrajectory
  }
}();

module.exports = controlTheory;
},{"./geometry":13}],5:[function(require,module,exports){
const geometry = require('../geometry');
const controlTheory = require('../controlTheory');
const behaviourTypes = require('./behaviourTypes');

const AvoidObstacle = function () {
  var accumulatedError = 0;
  var previousError = 0;

  // Calculate the summed, weighted vector of the sensor headings. Larger the sensor reading the
  // more you want to go in that direction
  const getObstacleAvoidance = function (state) {
    return state.sensors.reduce(function (obstacleAvoidance, sensor) {
      const point = geometry.createPoint(0, 0); // as summing always start from centre of robot
      const vector = geometry.getVector(point, state.theta + sensor.theta, sensor.distance * sensor.importance);
      return geometry.addVectors(obstacleAvoidance, vector);
    }, geometry.createLine(geometry.createPoint(0, 0), geometry.createPoint(0, 0)));
  };

  const execute = function (state) {
    const obstacleAvoidance = getObstacleAvoidance(state);
    state.obstacleAvoidance = obstacleAvoidance; // Update state so vector can be drawn

    const result = controlTheory.calculateTrajectory(state, obstacleAvoidance.end, accumulatedError, previousError);
    const w = result.w;
    previousError = result.thetaError;
    accumulatedError = result.accumulatedError;

    return {
      w: w,
      v: state.v
    };
  };

  const reset = function () {
    previousError = 0;
    accumulatedError = 0;
  };

  return {
    behaviour:  behaviourTypes.AvoidObstacle,
    execute: execute,
    reset: reset
  }
};

module.exports = AvoidObstacle;
},{"../controlTheory":4,"../geometry":13,"./behaviourTypes":9}],6:[function(require,module,exports){
const geometry = require('../geometry');
const controlTheory = require('../controlTheory');
const behaviourTypes = require('./behaviourTypes');
const sensorGroups = require('./sensorGroups');

const FollowWall = function () {

  var accumulatedError = 0;
  var previousError = 0;
  var previousSlide = null;

  const followWallDistance = 0.1;

  const getSensorGroup = function (sensors, sensorGroups) {
    // Get all sensors belonging to required group
    const group = sensors.filter(function (sensor) {
      return ~sensorGroups.indexOf(sensor.group);
    });

    // Sort them with smallest reading first
    return group.sort(function (s1, s2) {
      return s1.distance - s2.distance;
    });
  };

  const sumSensorReadings = function (sensors) {
    return sensors.reduce(function (total, sensor) {
      return total + sensor.distance;
    }, 0);
  };

  const getWallSensors = function (sensors) {
    // Group the sensors so we can find out which side the wall is on
    const leftGroup = getSensorGroup(sensors, [sensorGroups.Front, sensorGroups.Left]);
    const rightGroup = getSensorGroup(sensors, [sensorGroups.Front, sensorGroups.Right]);
    const leftReading = sumSensorReadings(leftGroup);
    const rightReading = sumSensorReadings(rightGroup);

    const getResult = function (slidingMode, leftGroup, rightGroup) {
      const getSensorsInDirectionOfTravel = function (sensors) {
        const twoClosestSensors = sensors.slice(0, 2);

        // Ensure sensors are ordered correctly for direction of travel
        // TODO have this order configurable inside the sensor
        return ['FF', 'FR', 'FL', 'BR', 'BL'].reduce(function (ordered, id) {
          twoClosestSensors.forEach(function (sensor) {
            if (id === sensor.id) {
              ordered.push(sensor);
            }
          });
          return ordered;
        }, []);
      };

      return {
        sliding: slidingMode,
        lostWall: false,
        sensors: getSensorsInDirectionOfTravel(slidingMode === sensorGroups.Right ? rightGroup : leftGroup)
      };
    };

    // Can be heading directly into wall, so test for this
    const frontSensor = getSensorGroup(sensors, [sensorGroups.Front]);
    const wallInFront = frontSensor ? frontSensor[0].distance < frontSensor[0].maxSensorDistance : false;

    // Return 2 sensors that are closest to the wall on the correct side
    if (leftReading > rightReading) {
      return getResult(sensorGroups.Right, leftGroup, rightGroup);
    } else if (leftReading === rightReading && !wallInFront) {
      // If readings are the same assume that sensors are not reading anything and
      // start to turn into the wall, assuming that the wall has ended. Turn into the wall by switching
      // sensor groups around
      // TODO this can turn you into the obstacle, maybe a better way to do this?
      //return getResult(previousSlide, rightGroup, leftGroup);
      return {
        sliding: previousSlide,
        lostWall: true
      };
    } else {
      // Bot has a tendency to turn right (sensors on left), who doesn't!
      return getResult(sensorGroups.Left, leftGroup, rightGroup);
    }
  };

  const getSensorReadingPoint = function (state, sensor) {
    const sensorVector = sensor.getVector(state, sensor.distance);
    return sensorVector.end;
  };

  const setProgressMade = function (state) {
    // Only set the progress made once at the start of following wall
    if (!state.progressMade) {
      state.progressMade = geometry.distanceBetweenPoints(state.goal, state);
    }
  };

  const execute = function (state) {
    setProgressMade(state);

    const sensorResult = getWallSensors(state.sensors);
    previousSlide = sensorResult.sliding;

    if (sensorResult.lostWall) {
      // attempt to just move towards wall gracefully
      const thetaError = sensorResult.sliding === sensorGroups.Right ? -Math.PI / 8 : Math.PI / 8;
      accumulatedError += thetaError * state.dt;

      const w = controlTheory.pid(thetaError, accumulatedError, (thetaError - previousError) / state.dt);
      previousError = thetaError;

      return {
        w: w,
        v: state.v
      };
    } else {
      const p1 = getSensorReadingPoint(state, sensorResult.sensors[0]);
      const p2 = getSensorReadingPoint(state, sensorResult.sensors[1]);

      // Calculate the wall segment in the direction of travel
      const uFwT = geometry.createPoint(p1.x - p2.x, p1.y - p2.y);

      // Calculate the vector from the robot to the wall segment
      const uFwTNorm = geometry.norm(uFwT);
      const uFwTP = geometry.createPoint(uFwT.x / uFwTNorm, uFwT.y / uFwTNorm);
      const uA = p2;
      const uP = geometry.createPoint(state.x, state.y);

      // Calculate: u_fw_p = ((u_a-u_p)-((u_a-u_p)'*u_fw_tp)*u_fw_tp)
      const uAuPDiff = geometry.createPoint(uA.x - uP.x, uA.y - uP.y);
      const uAuPDiffDotUFwTP = uAuPDiff.x * uFwTP.x + uAuPDiff.y * uFwTP.y;

      const uFwP = geometry.createPoint(uAuPDiff.x - uAuPDiffDotUFwTP * uFwTP.x, uAuPDiff.y - uAuPDiffDotUFwTP * uFwTP.y);

      // Get the vector perpendicular to the wall segment that will keep you a constant
      // distance from the segment
      const uFwPNorm = geometry.norm(uFwP);
      const uFwPP = geometry.createPoint(uFwP.x / uFwPNorm, uFwP.y / uFwPNorm);
      const uFw = geometry.createPoint(
        followWallDistance * uFwTP.x + (uFwP.x - followWallDistance * uFwPP.x),
        followWallDistance * uFwTP.y + (uFwP.y - followWallDistance * uFwPP.y)
      );

      // Calculate heading
      state.followWall = geometry.createLine(geometry.createPoint(0, 0), uFw);
      state.wallSegment = geometry.createLine(p2, p1);
      state.followWallPerpendicular = geometry.createLine(geometry.createPoint(0, 0), uFwP);

      const result = controlTheory.calculateTrajectory(state, uFw, accumulatedError, previousError);
      previousError = result.thetaError;
      accumulatedError = result.accumulatedError;

      return {
        w: result.w,
        v: state.v
      };
    }
  };

  const reset = function () {
    previousError = 0;
    accumulatedError = 0;
    previousSlide = null;
  };

  return {
    behaviour: behaviourTypes.FollowWall,
    execute: execute,
    reset: reset
  }
};

module.exports = FollowWall;
},{"../controlTheory":4,"../geometry":13,"./behaviourTypes":9,"./sensorGroups":11}],7:[function(require,module,exports){
const controlTheory = require('../controlTheory');
const geometry = require('../geometry');
const behaviourTypes = require('./behaviourTypes');

const GoToGoal = function () {
  var accumulatedError = 0;
  var previousError = 0;

  var execute = function (state) {
    const relativeToGoal = geometry.createPoint(state.goal.x - state.x, state.goal.y - state.y);

    const result = controlTheory.calculateTrajectory(state, relativeToGoal, accumulatedError, previousError);
    const w = result.w;
    previousError = result.thetaError;
    accumulatedError = result.accumulatedError;

    return {
      w: w,
      v: state.v
    };
  };

  const reset = function () {
    previousError = 0;
    accumulatedError = 0;
  };

  return {
    behaviour: behaviourTypes.GoToGoal,
    execute: execute,
    reset: reset
  };
};

module.exports = GoToGoal;
},{"../controlTheory":4,"../geometry":13,"./behaviourTypes":9}],8:[function(require,module,exports){
const behaviourTypes = require('./behaviourTypes');

const Stop = function () {
  return {
    behaviour: behaviourTypes.Stop,
    execute: function () {
      return {
        w: 0,
        v: 0
      };
    },
    reset: function () {
      // Nothing to do
    }
  }
};

module.exports = Stop;
},{"./behaviourTypes":9}],9:[function(require,module,exports){
const behaviourTypes = {
  Stop: 'Stop',
  GoToGoal: 'GoToGoal',
  AvoidObstacle: 'AvoidObstacle',
  FollowWall: 'FollowWall',
  asList: function () {
    const self = this;
    return Object.keys(self).reduce(function (types, key) {
      if ('asList' !== key) {
        types.push(self[key]);
      }
      return types;
    }, []);
  }
};

module.exports = behaviourTypes;
},{}],10:[function(require,module,exports){
const controllers = {
  Stop: require('./Stop'),
  GoToGoal: require('./GoToGoal'),
  AvoidObstacle: require('./AvoidObstacle'),
  FollowWall: require('./FollowWall'),
  all: function () {
    const obj = {
      asList: []
    };
    const self = this;
    Object.keys(self).forEach(function (key) {
      if (!~['behaviourTypes', 'all', 'sensorGroups'].indexOf(key)) {
        const controller = new self[key]();
        obj[key] = controller;
        obj.asList.push(controller);
      }
    });
    return obj;
  }
};

module.exports = controllers;
},{"./AvoidObstacle":5,"./FollowWall":6,"./GoToGoal":7,"./Stop":8}],11:[function(require,module,exports){
const sensorGroups = {
  Right: 'Right',
  Left: 'Left',
  Front: 'Front',
  Back: 'Back'
};

module.exports = sensorGroups;
},{}],12:[function(require,module,exports){
const events = {
  AT_GOAL: 'AT_GOAL',
  AT_OBSTACLE: 'AT_OBSTACLE',
  CLEARED_OBSTACLE: 'CLEARED_OBSTACLE',
  PROGRESS_MADE: 'PROGRESS_MADE',
  UNSAFE: 'UNSAFE'
};

module.exports = events;
},{}],13:[function(require,module,exports){
const geometry = function () {

  const createPoint = function (x, y) {
    return {x: x, y: y}
  };

  const createLine = function (p1, p2) {
    return {start: p1, end: p2};
  };

  const getVector = function (start, theta, length) {
    const end = createPoint(start.x + Math.cos(theta) * length, start.y + Math.sin(theta) * length);
    return createLine(start, end);
  };

  const distanceBetweenPoints = function (p1, p2) {
    const xDist = p2.x - p1.x;
    const yDist = p2.y - p1.y;
    return Math.sqrt(xDist * xDist + yDist * yDist);
  };

  const norm = function (p) {
    return Math.sqrt(p.x * p.x + p.y * p.y);
  };

  const getLinesOfRectangle = function (rectangle) {
    // x,y is top left point of rectangle
    const x1 = rectangle.x;
    const x2 = rectangle.x + rectangle.width;
    const y1 = rectangle.y;
    const y2 = rectangle.y - rectangle.length;

    return [
      createLine(createPoint(x1, y1), createPoint(x1, y2)),
      createLine(createPoint(x1, y1), createPoint(x2, y1)),
      createLine(createPoint(x2, y2), createPoint(x1, y2)),
      createLine(createPoint(x2, y2), createPoint(x2, y1))
    ];
  };

  const boundAngle = function (theta) {
    // Use atan2 to make sure this stays in [-pi,pi]
    return Math.atan2(Math.sin(theta), Math.cos(theta));
  };

  /**
   * Use cross product to check if the line intersect and find where on the line that they do
   */
  const getIntersectPoint = function (line1, line2) {
    const denominator = ((line2.end.y - line2.start.y) * (line1.end.x - line1.start.x)) -
      ((line2.end.x - line2.start.x) * (line1.end.y - line1.start.y));
    if (denominator === 0) {
      return false;
    } else {
      const xDist = line1.start.x - line2.start.x;
      const yDist = line1.start.y - line2.start.y;
      const numerator1 = ((line2.end.x - line2.start.x) * yDist) - ((line2.end.y - line2.start.y) * xDist);
      const numerator2 = ((line1.end.x - line1.start.x) * yDist) - ((line1.end.y - line1.start.y) * xDist);

      const a = numerator1 / denominator;
      const b = numerator2 / denominator;

      const onLine1 = a > 0 && a < 1;
      const onLine2 = b > 0 && b < 1;
      if (onLine1 && onLine2) {
        const x = line1.start.x + (a * (line1.end.x - line1.start.x));
        const y = line1.start.y + (a * (line1.end.y - line1.start.y));
        return createPoint(x, y);
      } else {
        return false;
      }
    }
  };

  const addVectors = function (v1, v2) {
    const start = createPoint(v1.start.x + v2.start.x, v1.start.y + v2.start.y);
    const end = createPoint(v1.end.x + v2.end.x, v1.end.y + v2.end.y);
    return createLine(start, end);
  };

  /**
   * Transform using matrix: R = [cos(theta) -sin(theta) x; sin(theta) cos(theta) y; 0 0 1];
   * and  v = [x y 1] to get the points rotated by theta. Theta rotates anti-clockwise
   */
  const transform = function (x, y, theta) {
    const xT = x * Math.cos(-theta) + y * Math.sin(-theta);
    const yT = -x * Math.sin(-theta) + y * Math.cos(-theta);
    return {
      x: xT,
      y: yT
    };
  };

  return {
    boundAngle: boundAngle,
    createPoint: createPoint,
    createLine: createLine,
    getLinesOfRectangle: getLinesOfRectangle,
    distanceBetweenPoints: distanceBetweenPoints,
    norm: norm,
    getVector: getVector,
    getIntersectPoint: getIntersectPoint,
    addVectors: addVectors,
    transform: transform
  };
}();

module.exports = geometry;
},{}],14:[function(require,module,exports){
/*
 * Uses browseify to export the MockBot to browser
 */
const MockBot = require('../mocks/MockBot');
const MockEnvironment = require('../mocks/MockEnvironment');

const ModelTester = function(robotMontitor) {
  	var id = 0;
	var bot = new MockBot(new MockEnvironment());
	
	robotMontitor.setBehaviour = bot.setBehaviour;
	robotMontitor.goalUpdated = bot.setGoal;
	robotMontitor.setDebug = bot.setDebug;
	robotMontitor.toggleStart = function(running) {
	    if(running && id) {
	        bot.reset();
	        clearInterval(id);
	    } else {
	        robotMontitor.setConfig(bot.config);
	        id = setInterval(function () {
	            robotMontitor.updateState(bot.currentState());         
	        }, 200);
	    }
	};
};

window.ModelTester = ModelTester;
},{"../mocks/MockBot":15,"../mocks/MockEnvironment":16}],15:[function(require,module,exports){
/**
 * Mock robot with state for use in testing
 */

const behaviourTypes = require('../brain/controllers/behaviourTypes');
const sensorGroups = require('../brain/controllers/sensorGroups');
const Supervisor = require('./../brain/Supervisor');
const Sentinel = require('./../brain/Sentinel');
const MockSensor = require('./MockSensor');
const VoiceBox = require('../brain/Voicebox');
const controllers = require('../brain/controllers/controllers');

const MockEncoder = function (id) {
  return {
    id: id,
    voltage: Math.random()
  }
};

const MockBot = function (environment) {
  const frSensor = new MockSensor('FR', 0.05, -0.02, -Math.PI / 4, sensorGroups.Right, 1);
  const flSensor = new MockSensor('FL', 0.05, 0.02, Math.PI / 4, sensorGroups.Left, 1);
  const ffSensor = new MockSensor('FF', 0.05, 0, 0, sensorGroups.Front, 0.5);
  const brSensor = new MockSensor('BR', -0.05, -0.02, -3 * Math.PI / 4, sensorGroups.Right, 1);
  const blSensor = new MockSensor('BL', -0.05, 0.02, 3 * Math.PI / 4, sensorGroups.Left, 1);

  // This order is important for following wall when sensors do not read object
  const sensors = [frSensor, flSensor, ffSensor, brSensor, blSensor];

  const leftEncoder = new MockEncoder('L');
  const rightEncoder = new MockEncoder('R');
  const encoders = [leftEncoder, rightEncoder];

  const config = Object.create(environment);
  config.sensors = sensors;
  config.encoders = encoders;
  config.controllers = controllers.all();
  config.dt = 0.1;
  config.v = 0.025;
  const supervisor = new Supervisor(config);

  const sentinel = new Sentinel();
  const voiceBox = new VoiceBox();

  const setBehaviour = function (newBehaviour) {
    supervisor.setBehaviour(newBehaviour);
  };

  const setGoal = function (newGoal) {
    supervisor.setGoal(newGoal);
  };

  const setDebug = function (debug) {
    voiceBox.debugFlag = debug;
  };

  /**
   * Updated the sensor objects with the latest readings, this is a separate
   * step so it can be controlled and done only once per iteration for performance
   */
  const updateSensors = function (state) {
    state.sensors.forEach(function (sensor) {
      sensor.distance = sensor.getDistance(state);
    });
  };

  // TODO this is a cheat to get the bot to tick when state is calculated
  const currentState = function () {
    const state = supervisor.currentState();
    updateSensors(state);
    supervisor.execute(state);

    const events = sentinel.analyse(state);
    if (events.length > 0) {
      voiceBox.debug("Events: " + events);
    }
    supervisor.processEvents(events);

    return state;
  };

  const reset = function () {
    console.log('Resetting');
    supervisor.reset();
  };

  return {
    // TODO Move this to state? Or move other things to config...
    config: {
      behaviours: behaviourTypes.asList()
    },
    sensors: sensors,
    encoders: encoders,
    setBehaviour: setBehaviour,
    setGoal: setGoal,
    setDebug: setDebug,
    currentState: currentState,
    updateSensors: updateSensors,
    reset: reset
  };
};

module.exports = MockBot;
},{"../brain/Voicebox":3,"../brain/controllers/behaviourTypes":9,"../brain/controllers/controllers":10,"../brain/controllers/sensorGroups":11,"./../brain/Sentinel":1,"./../brain/Supervisor":2,"./MockSensor":17}],16:[function(require,module,exports){
const mockObstacles = require('./mockObstacles');

const mockEnvironment = function () {
  return {
    obstacles: [
      // TODO have various 'terrains' that you can choose from in the screen
      //mockObstacles.createRectangle('LeftWall', -0.5, 0.5, 1, 0.05),
      //mockObstacles.createRectangle('RightWall', 0.5, 0.5, 1, 0.05),
      mockObstacles.createRectangle('TopWall', -0.5, 0.5, 0.05, 1),
      //mockObstacles.createRectangle('Blocker', 0.1, 0.5, 1, 0.05),
      //mockObstacles.createRectangle('Blocker', -0.15, 0.5, 1, 0.05),
      //mockObstacles.createRectangle('Blocker', -0.5, 0.15, 0.05, 1),
      //mockObstacles.createRectangle('Blocker', -0.5, -0.1, 0.05, 1)
    ],
    goal: {
      x: 0,
      y: 0.75
    },
    x: 0,
    y: 0
  };
};

module.exports = mockEnvironment;
},{"./mockObstacles":18}],17:[function(require,module,exports){
const obstacleTypes = require('./mockObstacles').types;
const geometry = require('../brain/geometry');

const MockSensor = function (id, x, y, theta, group, importance) {
  // TODO add this to some config
  const minSensorDistance = 0.01;
  const maxSensorDistance = 0.2;

  const getVector = function (state, distance) {
    // Get sensor point in the world frame and compute sensor visibility
    const sensorRotated = geometry.transform(x, y, state.theta);
    const sensorPoint = geometry.createPoint(state.x + sensorRotated.x, state.y + sensorRotated.y);
    return geometry.getVector(sensorPoint, theta + state.theta, distance);
  };

  const getDistance = function (state) {
    const sensorLine = getVector(state, maxSensorDistance);

    const distancesToObstacles = state.obstacles.map(function (obstacle) {
      switch (obstacle.type) {
        case obstacleTypes.RECTANGLE:
          const lines = geometry.getLinesOfRectangle(obstacle);
          const intersectPoints = lines.reduce(function (intersections, line) {
            const p = geometry.getIntersectPoint(sensorLine, line);
            if (p) {
              intersections.push(p);
            }
            return intersections;
          }, []);
          const distances = intersectPoints.map(function (point) {
            return geometry.distanceBetweenPoints(sensorLine.start, point);
          });
          return Math.min.apply(null, distances);
        default:
          console.error('Unknown obstacle type');
          return maxSensorDistance;
      }
    });

    const distance = Math.min.apply(null, distancesToObstacles);

    // Only update reading if obstacle is within the maximum  and minimum sensor range
    if (distance > minSensorDistance && distance < maxSensorDistance) {
      return distance;
    } else {
      return maxSensorDistance;
    }
  };

  return {
    id: id,
    x: x,
    y: y,
    theta: theta,
    group: group,
    importance: importance,
    maxSensorDistance: maxSensorDistance,
    getVector: getVector,
    getDistance: getDistance
  };
};

module.exports = MockSensor;
},{"../brain/geometry":13,"./mockObstacles":18}],18:[function(require,module,exports){
/**
 * Mock obstacles for the bot
 */
var obstacleTypes = Object.freeze({
  RECTANGLE: 'Rectangle'
});

var createRectangle = function (id, x, y, length, width) {
  return {
    id: id,
    type: obstacleTypes.RECTANGLE,
    x: x,
    y: y,
    length: length,
    width: width
  }
};

var mockObstacles = {
  types: obstacleTypes,
  createRectangle: createRectangle
};

module.exports = mockObstacles;
},{}]},{},[14]);
