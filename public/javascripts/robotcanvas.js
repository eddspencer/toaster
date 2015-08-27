var RobotCanvas = function (canvasId) {

  var xPath, yPath = null;
  var scale = 1;
  var centre = false;
  var context = initCanvas(canvasId);

  var drawConfig = {
    pathColour: "#000000",
    pathThickness: 3,
    robotColour: "#0000FF",
    obstacleColour: "#0000EE",
    sensorColour: "#FF0000",
    sensorConeTheta: Math.PI / 32,
    goalColour: "#DD0000",
    goalThickness: 5
  };

  function initCanvas(canvasId) {
    var canvas = document.getElementById(canvasId);
    var context = canvas.getContext("2d");

    var length = 400; // canvas.parentElement.clientWidth;
    canvas.width = length;
    canvas.height = length;

    return context;
  }

  function initialise() {
    xPath = [];
    yPath = [];
    obstacles = [];
  }

  function updateState(currentState) {
    xPath.push(currentState.x);
    yPath.push(currentState.y);
  }

  /**
   * Scale the value (in metres) to the specific scale which is number of meters
   * in canvas
   */
  // TODO can likely do this with the canvas scale...
  function scaleValue(value) {
    var s = context.canvas.height / scale;
    return value * s;
  }

  /**
   * Translate the coordinates to be centred on the middle of the canvas and
   * handle whether bot should always be centred or not
   */
  function translateAndScale(x, y) {
    // TODO do this in canvas
    if (centre && 0 != xPath.length) {
      x -= xPath[0];
      y -= yPath[0];
    }

    return {
      x: context.canvas.width / 2 + scaleValue(x),
      y: context.canvas.height - (context.canvas.height / 2 + scaleValue(y))
    }
  }

  function redraw(state) {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    var theta = Math.atan2(state.dy, state.dx);
    var translated = translateAndScale(state.x, state.y);

    drawPath();
    drawSensors(translated.x, translated.y, theta, state.sensors);
    drawRobot(translated.x, translated.y, theta);
    drawObstacles(state.obstacles);
    drawGoal(state.goal);
  }

  function drawPath() {
    var canvas = context.canvas;

    context.strokeStyle = drawConfig.pathColour;
    context.lineJoin = "round";
    context.lineWidth = drawConfig.pathThickness / scale;

    var path = new Path2D();
    path.moveTo(canvas.width / 2, canvas.height / 2);

    for (var i = 0; i < xPath.length; i++) {
      var translated = translateAndScale(xPath[i], yPath[i]);
      path.lineTo(translated.x, translated.y);
    }

    context.stroke(path);
  }

  function drawRobot(x, y, theta) {
    // TODO configure the robtot size
    var width = scaleValue(0.05);
    var length = scaleValue(0.1);

    drawRotated(x, y, theta, function () {
      var pathRobot = new Path2D();
      pathRobot.rect(-width / 2, -length / 2, width, length);
      context.fillStyle = drawConfig.robotColour;
      context.fill(pathRobot);
    });
  }

  function drawSensors(x, y, theta, sensors) {
    drawRotated(x, y, theta, function () {
      sensors.forEach(function (sensor) {
        var sensorX = scaleValue(sensor.x);
        var sensorY = -scaleValue(sensor.y);

        drawRotated(sensorX, sensorY, sensor.theta, function () {
          var pathSensor = new Path2D();
          pathSensor.moveTo(0, 0);

          var h = sensorX + scaleValue(sensor.distance);

          pathSensor.lineTo(Math.cos(drawConfig.sensorConeTheta) * h, Math.sin(drawConfig.sensorConeTheta) * h);
          pathSensor.lineTo(Math.cos(-drawConfig.sensorConeTheta) * h, Math.sin(-drawConfig.sensorConeTheta) * h);

          context.fillStyle = drawConfig.sensorColour;
          context.fill(pathSensor);
        });
      });
    });
  }

  function drawGoal(goal) {
    var path = new Path2D();
    path.rect(goal.x, goal.y, drawConfig.goalThickness, drawConfig.goalThickness);
    context.fillStyle = drawConfig.goalColour;
    context.fill(path);
  }

  function drawObstacles(obstacles) {
    obstacles.forEach(function (obstacle) {
      switch (obstacle.type) {
        case 'Rectangle' :
          var pathRobot = new Path2D();
          pathRobot.rect(obstacle.x, obstacle.y, obstacle.width, obstacle.length);
          context.fillStyle = drawConfig.obstacleColour;
          context.fill(pathRobot);
          break;
        default:
          console.log('Unknown obstacle type: ' + obstacle);
      }
    });
  }

  function drawRotated(x, y, theta, drawFunction) {
    context.save();
    context.translate(x, y);
    context.rotate(theta);

    drawFunction();

    context.restore();
  }

  function setScale(newScale) {
    scale = newScale;
  }

  function setCentre(newCentre) {
    centre = newCentre;
  }

  return {
    initialise: initialise,
    redraw: redraw,
    updateState: updateState,
    setScale: setScale,
    setCentre: setCentre
  }
};