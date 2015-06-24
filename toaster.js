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

		// TODO on connect start sending data but only MOVE robot on message

		ws.on('message', function(message) {
			switch (message) {
			case "START":
				id = setInterval(function() {
					ws.send(JSON.stringify(bot.currentState()));
				}, 500);
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

		ws.on('close', function() {
			bot.reset();
			clearInterval(id);
		});
	});

}

Toaster.prototype.destroy = function() {
	this.wss.close();
}

module.exports = Toaster;