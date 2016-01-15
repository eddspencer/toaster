const RobotMonitor = function (canvas) {
  var robotCanvas = new RobotCanvas(canvas);
  var self  = this;
  var running = false;

  // Functions to implement to get functionality
  self.setBehaviour = function(behaviour) {};
  self.goalUpdated = function(x, y) {};
  self.toggleStart = function(running) {};
  self.setDebug = function(debug) {};

  // Public functions
  self.setConfig = function(config) {
    var first = true;
    config.behaviours.forEach(function (behaviour) {
      var id = 'behaviour' + behaviour;
      $('#behaviours').append('<input id="' + id + '" type="radio" name="behaviours" value="' + behaviour + '">' + behaviour);
      if (first) {
        $('#' + id).prop('checked', true);
        first = false;
      }
    });

    $('input:radio[name="behaviours"]').change(function () {
      if (this.checked) {
        self.setBehaviour(this.value);
      }
    });
  }

  self.updateState = function(currentState) {
    // Update canvas
    robotCanvas.updateState(currentState);
    robotCanvas.redraw(currentState);

    // Update the properties
    currentState.properties.forEach(function (item) {
      var value = currentState[item];
      if (undefined != value) {
        createOrUpdateTableRow('properties', 'state', item, value);
      }
    });

    $('#behaviour' + currentState.currentBehaviour).prop('checked', true);

    // Update the sensor information
    currentState.sensors.forEach(function (sensor) {
      createOrUpdateTableRow('sensors', 'sensor', sensor.id, sensor.distance);
    });

    // Update the encoder information
    currentState.encoders.forEach(function (encoder) {
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

  // Private functions
  function updateGoal(x, y) {
    const canvas = $('#draw');
    const canvasWidth = canvas.width();
    const canvasHeight = canvas.height();
    const scale = robotCanvas.getScale();
    const goalX = (x - canvasWidth / 2) * scale / canvasWidth;
    const goalY = -(y - canvasHeight / 2) * scale / canvasHeight;

    self.goalUpdated(goalX, goalY);
  }

  // Events
  $('#scale').change(function (event) {
    robotCanvas.setScale(event.currentTarget.value);
  });

  $('#centre').change(function (event) {
    robotCanvas.setCentre("on" === event.currentTarget.value);
  });

  $('#draw').click(function (event) {
    updateGoal(event.offsetX, event.offsetY);
  });

  $('#connect').click(function () {
    if (running) {
      $('#connect').text("Start");
      $('#behaviours').html('');
    } else {
      robotCanvas.initialise();
      $('#connect').text("Stop");
    }
    self.toggleStart(running);
    running = !running;
  });

  $('#debug').change(function(event) {
    self.setDebug(event.currentTarget.value);
  });

};