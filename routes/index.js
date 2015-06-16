var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	var receivedData = [];

	var hostname = (req.headers.host.match(/:/g)) ? req.headers.host.slice(0, req.headers.host.indexOf(":")) : req.headers.host

	res.render('index', {
		title : 'Toaster',
		host : hostname + ':8080' // TODO this is nasty
	});

});

module.exports = router;
