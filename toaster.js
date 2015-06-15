var WebSocketServer = require('ws').Server

var Toaster = function() {
	this.wss = null;
}

Toaster.prototype.start = function(port){
	this.wss = new WebSocketServer({
		port : port
	});

	this.wss.on('connection', function connection(ws) {
		ws.on('message', function incoming(message) {
			console.log('received: %s', message);
			ws.send(Math.random());
		});
	});
}

Toaster.prototype.destroy = function() {
	this.wss.close();
}

module.exports = new Toaster;