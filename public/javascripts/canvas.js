(function() {
	var socket = initSocket(document.currentScript.getAttribute('host'));
	var context = initCanvas(document.currentScript.getAttribute('canvas'));

	var xPath, yPath = null;
	var scale = 1;

	var drawConfig = {
		pathColour : "#000000",
		robotColour : "#0000FF",
		sensorColour : "#FF0000"
	}

	function initSocket(host) {
		var socket = new LazyWebSocket('ws://' + host);

		socket.onmessage = function(msg) {
			var currentState = JSON.parse(msg.data);
			updateState(currentState);
			redraw(currentState.x, currentState.y, currentState.dx, currentState.dy, currentState.sensors);
		}

		return socket;
	}

	function initCanvas(canvasId) {
		var canvas = document.getElementById(canvasId);
		var context = canvas.getContext("2d");

		var lenght = 600 // canvas.parentElement.clientWidth;
		canvas.width = lenght;
		canvas.height = lenght;

		return context;
	}

	function updateState(currentState) {
		// Update the path
		xPath.push(currentState.x);
		yPath.push(currentState.y);

		// Update the properties
		currentState.properties.forEach(function(item) {
			var value = currentState[item];
			if (undefined != value) {
				createOrUpdateTableRow('properties', 'state', item, value);
			}
		});

		// Update the sensor information
		currentState.sensors.forEach(function(sensor) {
			createOrUpdateTableRow('sensors', 'sensor', sensor.id, sensor.distance);
		});

		function createOrUpdateTableRow(tableId, prefix, key, value) {
			var id = prefix + key;
			if ($('#' + tableId).find('#' + id).length > 0) {
				$('#' + id).html(value);
			} else {
				$('#' + tableId + ' > tbody:last-child').append('<tr><td>' + key + '</td><td id="' + id + '">' + value + '</td></tr>');
			}
		}
	}

	/**
	 * Scale the value (in metres) to the specific scale which is number of meters
	 * in canvas
	 */
	function scaleValue(value) {
		var s = context.canvas.height / scale;
		return value * s;
	}

	function translateAndScale(x, y) {
		return {
			x : context.canvas.width / 2 + scaleValue(x),
			y : context.canvas.height - (context.canvas.height / 2 + scaleValue(y))
		}
	}

	function redraw(x, y, dx, dy, sensors) {
		context.clearRect(0, 0, context.canvas.width, context.canvas.height);

		var theta = Math.atan2(dy, dx);
		var translated = translateAndScale(x, y);

		drawPath();
		drawSensors(translated.x, translated.y, theta, sensors);
		drawRobot(translated.x, translated.y, theta);
	}

	function drawPath() {
		var canvas = context.canvas;

		context.strokeStyle = drawConfig.pathColour;
		context.lineJoin = "round";
		context.lineWidth = 5 / scale;

		var path = new Path2D();
		path.moveTo(canvas.width / 2, canvas.height / 2);

		for (var i = 0; i < xPath.length; i++) {
			// Calculate x and y coordinates for canvas centred in middle with
			// inverted y-axis
			var translated = translateAndScale(xPath[i], yPath[i]);
			path.lineTo(translated.x, translated.y);
		}

		context.stroke(path);
	}

	function drawRobot(x, y, theta) {
		var width = scaleValue(0.05);
		var length = scaleValue(0.1);

		drawRotated(x, y, theta, function() {
			var pathRobot = new Path2D();
			pathRobot.rect(-width / 2, -length / 2, width, length);
			context.fillStyle = drawConfig.robotColour;
			context.fill(pathRobot);
		});
	}

	function drawSensors(x, y, theta, sensors) {
		drawRotated(x, y, theta, function() {
			sensors.forEach(function(sensor) {
				drawRotated(sensor.x, sensor.y, sensor.theta, function() {
					var pathSensor = new Path2D();
					pathSensor.moveTo(scaleValue(sensor.x), scaleValue(sensor.y));

					var dx = sensor.distance * Math.cos(sensor.theta);
					var dy = sensor.distance * Math.sin(sensor.theta);
					pathSensor.lineTo(scaleValue(dx), scaleValue(dy));

					context.strokeStyle = drawConfig.sensorColour;
					context.lineWidth = 2 / scale;
					context.stroke(pathSensor, '#FF0000');
				});
			});
		});
	}

	function drawRotated(x, y, theta, drawFunction) {
		context.save();
		context.translate(x, y);
		context.rotate(theta);

		drawFunction();

		context.restore();
	}

	$('#start').click(function(event) {
		socket.open();
		xPath = new Array();
		yPath = new Array();
	});

	$('#stop').click(function(event) {
		socket.close();
	});

	$('#scale').change(function(event) {
		scale = event.currentTarget.value;
	});

}());