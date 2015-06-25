/**
 * Mock robot with state for use in testing
 */
var MockEncoder = function(id) {
	return {
		id : id,
		voltage : Math.random()
	}
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

var BehaviourEnum = Object.freeze({
	START : 'START',
	STOP : 'STOP'
})

function values(obj) {
	return Object.keys(obj).map(function(key) {
		return obj[key];
	})
}

var MockBot = function() {
	this.count = 0;
	this.behaviour = BehaviourEnum.STOP;

	this.config = {
		behaviours : values(BehaviourEnum)
	}
}

MockBot.prototype.setBehaviour = function(behaviour) {
	this.behaviour = behaviour;
	console.log('Setting behaviour to be ' + behaviour);
}

MockBot.prototype.currentState = function() {
	var frSensor = new MockSensor('FR', 0.02, 0.05, -Math.PI / 4);
	var flSensor = new MockSensor('FL', -0.02, 0.05, -3 * Math.PI / 4);
	var ffSensor = new MockSensor('FF', 0, 0.05, -Math.PI / 2);
	var brSensor = new MockSensor('BR', 0.025, -0.045, 0);
	var blSensor = new MockSensor('BL', -0.025, -0.045, Math.PI);
	var sensors = [ frSensor, flSensor, ffSensor, brSensor, blSensor ];

	var leftEncoder = new MockEncoder('L');
	var rightEncoder = new MockEncoder('R');
	var encoders = [ leftEncoder, rightEncoder ];

	var currentState = {
		properties : [ 'x', 'y' ],
		sensors : sensors,
		encoders : encoders,
		x : this.count / 100,
		y : this.count / 100,
		dx : 0.01,
		dy : 0.01
	};

	// Mimic behaviour logic
	if (BehaviourEnum.START === this.behaviour) {
		this.count++;
	}
	return currentState;
}

MockBot.prototype.reset = function() {
	this.count = 0;
}

module.exports = MockBot;