var WebSocketServer = require('ws').Server

var Toaster = function(config) {
	this.wss = null;
	this.port = config.port;
	this.bot = config.bot;
}

Toaster.prototype.openSocket = function() {
	if (null != this.wss) {
		this.wss.close();
	}

	this.wss = new WebSocketServer({
		port : this.port
	});

	var id = 0;
	var bot = this.bot;
	this.wss.on('connection', function(ws) {

		// On start of connection send initial bot configuration
		var config = bot.config;
		config.type = 'config';
		ws.send(JSON.stringify(config));

		// Set up timer to sennd current state of bot to client
		id = setInterval(function() {
			var currentState = bot.currentState();
			currentState.type = 'currentState';
			ws.send(JSON.stringify(currentState));
		}, 200);

		console.log('started client interval');

		ws.on('message', function(message) {
			var msg = JSON.parse(message);
			if ('setBehaviour' in msg) {
				bot.setBehaviour(msg.setBehaviour);
			} else {
				console.error('Unhandled message: %s', msg);
			}
		});

		ws.on('close', function() {
			console.log('stopping client interval');
			bot.reset();
			clearInterval(id);
		});
	});

}

Toaster.prototype.destroy = function() {
	this.wss.close();
}

module.exports = Toaster;