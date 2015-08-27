(function() {
	var socket = initSocket(document.currentScript.getAttribute('host'));
	var robotCanvas = new RobotCanvas(document.currentScript.getAttribute('canvas'));

	function initSocket(host) {
		var socket = new LazyWebSocket('ws://' + host);

		socket.onmessage = function(msgStr) {
			var msg = JSON.parse(msgStr.data);
			if (msg.type === "currentState") {
				updateState(msg);
				robotCanvas.updateState(msg);
				robotCanvas.redraw(msg);
			} else if (msg.type === 'config') {
				setConfig(msg);
			}
		};

		return socket;
	}

	function setConfig(config) {
		config.behaviours.forEach(function(behaviour) {
			var id = 'behaviour' + behaviour;
			$('#behaviours').append('<input id="' + id + '" type="radio" name="behaviours" value="' + behaviour + '">' + behaviour);
		});

		$('#behaviour' + config.currentBehaviour).prop('checked', true);

		$('input:radio[name="behaviours"]').change(function() {
			if (this.checked) {
				socket.send(JSON.stringify({
					setBehaviour : this.value
				}));
			}
		});
	}

	function updateState(currentState) {
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

		// Update the encoder information
		currentState.encoders.forEach(function(encoder) {
			createOrUpdateTableRow('encoders', 'encoder', encoder.id, encoder.voltage);
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

	// TODO could use rxJS here....
	// TODO what about sockets and rxJS?
	$('#connect').click(function() {
		if (socket.isOpen()) {
			socket.close();
			$('#connect').text("Connect");
			$('#behaviours').html('');
		} else {
			socket.open();
			robotCanvas.initialise();
			$('#connect').text("Disconnect");
		}
	});

	$('#scale').change(function(event) {
		robotCanvas.setScale(event.currentTarget.value);
	});
	
	$('#centre').change(function(event) {
		robotCanvas.setCentre("on" === event.currentTarget.value);
	});
	
}());