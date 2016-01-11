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