var WebSocketServer = require('ws').Server

var Toaster = function(config) {
	this.wss = null;
	this.port = config.port;
}

Toaster.prototype.openSocket = function() {
	if (null != this.wss) {
		this.wss.close();
	}

	this.wss = new WebSocketServer({
		port : this.port
	});

	var count = 0;
	this.wss.on('connection', function(ws) {

		// TODO do we need on message?
		ws.on('message', function(message) {
			console.log('received: %s', message);
		});

		// TODO have an issue with reloading page not closing socket then interval
		// not being stopped
		var id = setInterval(function() {
			sendState(ws);
		}, 100);
		console.log('started client interval');

		ws.on('close', function() {
			console.log('stopping client interval');
			clearInterval(id);
			count = 0;
		});
	});

	function sendState(ws) {
		ws.send(JSON.stringify({
			properties : [ 'x', 'y' ],
			sensors : [ new MockSensor('Right', 0, 0, 0), new MockSensor('Left', 0, 0, Math.PI / 2) ],
			x : count / 100,
			y : count / 100,
			dx : 0.01,
			dy : 0.01
		}));
		count++;
	}

	var MockSensor = function(id, x, y, theta) {
		return {
			id: id,
			x : x,
			y : y,
			theta : theta,
			distance : Math.random() / 10
		}
	}
}

Toaster.prototype.destroy = function() {
	this.wss.close();
}

module.exports = Toaster;