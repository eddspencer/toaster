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
		});
	});

	var count = 0;
	function sendState(ws) {
		ws.send(JSON.stringify({
			x : count,
			y : count
		}));
		count++;
	}
}

Toaster.prototype.destroy = function() {
	this.wss.close();
}

module.exports = Toaster;