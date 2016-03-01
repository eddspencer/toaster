var Toaster = require('./toaster.js');

var MockBot = require('./mocks/MockBot.js');
var MockEnvironment = require('./mocks/MockEnvironment.js');

// Start the toaster websocket
var toaster = new Toaster({
	port : 8080,
	bot: new MockBot(new MockEnvironment())
});
toaster.openSocket();

module.exports = toaster;
