/*
 * Simple Wrapper for the WebSocket class with lazy connection opening and 
 * the ability to close and then re-open the socket.
 */
function LazyWebSocket(url) {
	var lazysocket = this;
	var url = url;
	var ws = null;

	this.open = function() {
		if (!isOpen()) {
			ws = new WebSocket(url);
			ws.onmessage = this.onmessage;
			ws.onopen = this.onopen;
			ws.onclose = function() {
				// When closing we want to reset the ws variable to enable the
				// socket to be re-opened by the client
				ws = null;

				lazysocket.onclose();
			}
			ws.onerror = this.onerror;
		}
	}

	function isOpen() {
		return null != ws;
	}
	this.isOpen = isOpen;

	this.close = function() {
		if (isOpen) {
			ws.close();
			ws = null;
		}
	}

	this.send = function(msg) {
		if (isOpen()) {
			ws.send(msg);
		} else {
			console.error("Socket not open");
		}
	}

	this.onopen = function() {
		// Override this callback to add functionality
	};

	this.onmessage = function(msg) {
		// Override this callback to add functionality
	};

	this.onclose = function() {
		// Override this callback to add functionality
	};

	this.onerror = function(error) {
		// Override this callback to add functionality
		console.log(error);
	};
}