(function() {
	var socket = initSocket(document.currentScript.getAttribute('host'));
	var context = initCanvas(document.currentScript.getAttribute('canvas'));

	var xPath, yPath = null;
	var scale = 1;

	function initSocket(host) {
		var socket = new LazyWebSocket('ws://' + host);

		socket.onmessage = function(msg) {
			var currentState = JSON.parse(msg.data);
			updateState(currentState);
			redraw();
		}

		return socket;
	}

	function initCanvas(canvasId) {
		var canvas = document.getElementById(canvasId);
		var context = canvas.getContext("2d");

		context.strokeStyle = "#df4b26";
		context.lineJoin = "round";
		context.lineWidth = 5;

		var lenght = 600 // canvas.parentElement.clientWidth;
		canvas.width = lenght;
		canvas.height = lenght;

		return context;
	}

	function updateState(currentState) {
		// Update the path
		xPath.push(currentState.x);
		yPath.push(currentState.y);

		// Update the table data
		currentState.properties
				.forEach(function(item) {
					var value = currentState[item];
					if (undefined != value) {
						if ($('#properties').find('#state' + item).length > 0) {
							$('#state' + item).html(value);
						} else {
							$('#properties > tbody:last-child').append(
									'<tr><td>' + item + '</td><td id="state' + item + '">' + value + '</td></tr>');
						}
					}
				});
	}

	function redraw(x, y) {
		var canvas = context.canvas;

		/**
		 * Scale the value (in metres) to the specific scale which is number of meters in canvas
		 */
		function scaleValue(value) {
			var s = canvas.height / 2;
			return value * s;
		}

		context.clearRect(0, 0, canvas.width, canvas.height);

		context.beginPath();
		context.moveTo(canvas.width / 2, canvas.height / 2);

		for (var i = 0; i < xPath.length; i++) {
			var x = canvas.width / 2 + scaleValue(xPath[i]);
			var y = canvas.height / 2 + scaleValue(yPath[i]);
			context.lineTo(x, y);
		}

		context.closePath();
		context.stroke();
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