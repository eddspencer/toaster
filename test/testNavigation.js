const expect = require('chai').expect;
const MockBot = require('../mocks/MockBot');
const behaviourTypes = require('../brain/controllers/behaviourTypes');
const fs = require('fs');

describe('Navigation', function () {
  const maxIterations = 1000;

  const runBot = function (environment, startBehaviour, desiredBehaviour) {
    const result = {
      start: {
        x: environment.x,
        y: environment.y
      },
      path: []
    };

    const bot = new MockBot(environment);
    // bot.setDebug(true);
    bot.setBehaviour(startBehaviour);
    for (var i = 0; i < maxIterations; i++) {
      var state = bot.currentState();
      // Keep track of the position through the run
      result.path.push({
        x: state.x,
        y: state.y
      });
      result.currentBehaviour = state.currentBehaviour;

      // Run until reached desired behaviour
      if (desiredBehaviour == state.currentBehaviour) {
        result.success = true;
        break;
      }
    }

    return result;
  };

  const runTest = function (environment) {
    const result = environment.startPositions.reduce(function (result, startPosition) {
      environment.x = startPosition[0];
      environment.y = startPosition[1];
      const run = runBot(environment, behaviourTypes.GoToGoal, behaviourTypes.Stop);
      if (run.success) {
        result.successful.push(run);
      } else {
        result.timedOut.push(run);
      }
      return result;
    }, {
      environment: environment.name,
      successful: [],
      timedOut: []
    });
    return result;
  };

  const readAndProcessDirectory = function (dir, processJSON) {
    const fileNames = fs.readdirSync(dir);
    return fileNames.map(function (fileName) {
      const file = fs.readFileSync(dir + '/' + fileName);
      const environment = JSON.parse(file);
      return processJSON(environment);
    });
  };

  const runEnvironments = function (dir) {
    const results = readAndProcessDirectory(dir, runTest);
    const resultsFlat = results.reduce(function (resultsFlat, result) {
      // TODO create images of the path chosen by bot for all combinations
      if (result.timedOut.length > 0) {
        resultsFlat.errors.push({
          environment: result.environment,
          runs: result.timedOut
        });
      }
      if (result.successful.length > 0) {
        resultsFlat.success.push({
          environment: result.environment,
          runs: result.successful
        });
      }
      return resultsFlat;
    }, {
      errors: [],
      success: []
    });
    return resultsFlat;
  };

  it('should reach goal eventually for all successful environments', function () {
    const results = runEnvironments('./test/resources/environments/successful');
    expect(results.errors, "All runs should finish").to.eql([]);
  });

  it('should not reach goal for all successful environments', function () {
    const results = runEnvironments('./test/resources/environments/failures');
    expect(results.success, "All runs should not finish").to.eql([]);
  });

});