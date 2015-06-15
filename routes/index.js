var WebSocket = require('ws');
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	var ws = new WebSocket('ws://' + req.get('host'));
	var receivedData = [];

	ws.on('open', function open() {
		ws.send('something');
	});

	ws.on('message', function(data, flags) {
		receivedData.push(data);
	});

	res.render('index', {
		title : 'Express',
		receivedData : receivedData
	});

});

module.exports = router;
