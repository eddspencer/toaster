// const chai = require('chai');
// const chaiStats = require('chai-stats');
// chai.use(chaiStats);

// const expect = chai.expect;
// const Sentinel = require('../brain/Sentinel');
// const events = require('../brain/events');
// const behaviourTypes = require('../brain/controllers/behaviourTypes');
// const testUtils = require('./testUtils');
// const mockBot = testUtils.mockBot();

// describe('Sentinel', function () {
//   const sentinel = new Sentinel();

//   it('should know when goal is reached', function () {
//     const state = testUtils.state();
//     state.x = state.goal.x - 0.01;
//     state.y = state.goal.y - 0.01;

//     const result = sentinel.analyse(state);
//     expect(result).to.contain(events.AT_GOAL);
//   });

//   it('should know when progress is made', function () {
//     const state = testUtils.state();
//     state.currentBehaviour = behaviourTypes.FollowWall;
//     state.progressMade = 100;
//     const result = sentinel.analyse(state);
//     expect(result).to.contain(events.PROGRESS_MADE);
//   });

//   it('should not make progress until epsilon progress made is reached', function () {
//     const state = testUtils.state();
//     state.currentBehaviour = behaviourTypes.FollowWall;
//     state.progressMade = 1.05;
//     state.x = 1;
//     const result = sentinel.analyse(state);
//     expect(result).to.not.contain(events.PROGRESS_MADE);
//   });

//   it('should know when obstacle is cleared', function () {
//     const state = testUtils.state();
//     state.currentBehaviour = behaviourTypes.AvoidObstacle;
//     const result = sentinel.analyse(state);
//     expect(result).to.contain(events.CLEARED_OBSTACLE);
//   });

//   it('should know when it is at obstacle', function () {
//     const state = testUtils.state();
//     state.x = 0.03;
//     mockBot.updateSensors(state);
//     const result = sentinel.analyse(state);
//     expect(result).to.contain(events.AT_OBSTACLE);
//   });

//   it('should know when it is unsafe', function () {
//     const state = testUtils.state();
//     state.x = 0.09;
//     mockBot.updateSensors(state);
//     const result = sentinel.analyse(state);
//     expect(result).to.contain(events.UNSAFE);
//   });
// });