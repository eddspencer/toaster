(function() {
	var host = document.currentScript.getAttribute('host');
	var canvasId = document.currentScript.getAttribute('canvas');
	var socket = new LazyWebSocket('ws://' + host);

	var canvas = document.getElementById(canvasId);
	var context = canvas.getContext("2d");

	context.strokeStyle = "#df4b26";
	context.lineJoin = "round";
	context.lineWidth = 5;

	context.beginPath();

	socket.onmessage = function(msg) {
		var currentState = msg.currentState;

		context.lineTo(currentState.x, currentState.y);
		context.stroke();
	}
	
	socket.open();
	
	socket.send('HI');
}());