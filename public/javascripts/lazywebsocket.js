/*
 * Simple Wrapper for the WebSocket class with lazy connection opening and 
 * the ability to close and then re-open the socket.
 */
function LazyWebSocket(url) {
	var lazysocket = this;
	var url = url;
	var ws = null;

	this.open = function() {
		if (null == ws) {
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

	this.close = function() {
		if (null != ws) {
			ws.close();
			ws = null;
		}
	}

	this.send = function(msg) {
		if (null == ws) {
			console.error("Socket not open");
		} else {
			ws.send(msg);
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