(function() {
	var socket = initSocket(document.currentScript.getAttribute('host'));
	var context = initCanvas(document.currentScript.getAttribute('canvas'));
	
	function initSocket(host) {
		var socket = new LazyWebSocket('ws://' + host);

		socket.onmessage = function(msg) {
			var currentState = JSON.parse(msg.data);
			updateState(currentState);
		}

		return socket;
	}
	
	function initCanvas(canvasId) {
		var canvas = document.getElementById(canvasId);
		var context = canvas.getContext("2d");

		context.strokeStyle = "#df4b26";
		context.lineJoin = "round";
		context.lineWidth = 5;

		context.beginPath();
		
		return context;
	}
	
	function updateState(currentState) {
		// Update the canvas
		context.lineTo(currentState.x * 100, currentState.y * 100);
		context.stroke();

		// Update the table data
		[ 'x', 'y', 'dx', 'dy' ].forEach(function(item) {
			$('#' + item).html(currentState[item]);
		});
	}
	
	$('#start').click(function(event) {
		socket.open();
	});
	
	$('#stop').click(function(event) {
		socket.close();
	});

}());