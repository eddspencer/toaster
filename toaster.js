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

	var id = 0;
	var count = 0;
	this.wss.on('connection', function(ws) {
		
		// TODO on connect start sending data but only MOVE robot on message

		ws.on('message', function(message) {
			switch (message) {
			case "START":
				id = setInterval(function() {
					sendState(ws);
				}, 100);
				console.log('started client interval');
				break;
			case "STOP":
				console.log('stopping client interval');
				clearInterval(id);
				break;
			default:
				console.error('Unhandled message: %s', message);
			}
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
			id : id,
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