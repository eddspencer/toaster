/**
 * Mock robot with state for use in testing
 */
var MockBot = function() {
	this.count = 0;
}

MockBot.prototype.currentState = function() {
	var currentState = {
		properties : [ 'x', 'y' ],
		sensors : [ new MockSensor('Right', 0, 0, 0), new MockSensor('Left', 0, 0, Math.PI / 2) ],
		x : this.count / 100,
		y : this.count / 100,
		dx : 0.01,
		dy : 0.01
	};
	this.count++;
	return currentState;
}

MockBot.prototype.reset = function() {
	this.count = 0;
}

var MockSensor = function(id, x, y, theta) {
	return {
		id : id,
		x : x,
		y : y,
		theta : theta,
		distance : Math.random() / 10
	}
}

module.exports = MockBot;