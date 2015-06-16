var WebSocketServer = require('ws').Server

var Toaster = function() {
	this.wss = null;
}

Toaster.prototype.openSocket = function(port) {
	if (null != this.wss) {
		this.wss.close();
	}

	this.wss = new WebSocketServer({
		port : port
	});

	this.wss.on('connection', function(ws) {

		// TODO do we need on message?
		ws.on('message', function(message) {
			console.log('received: %s', message);
		});

		var id = setInterval(function() {
			sendState(ws);
		}, 100);
		console.log('started client interval');

		ws.on('close', function() {
			console.log('stopping client interval');
			clearInterval(id);
		});
	});

	function sendState(ws) {
		ws.send(JSON.stringify({
			x : Math.random(),
			y : Math.random()
		}));
	}
}

Toaster.prototype.destroy = function() {
	this.wss.close();
}

module.exports = Toaster;