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