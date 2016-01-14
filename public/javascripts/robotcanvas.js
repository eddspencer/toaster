/**
 * Define a canvas that draws the robot, its path sensors and obstacles. The coordinate system is centered on the robot itself
 * and the units are in meters.
 */
const RobotCanvas = function (canvas) {

  const drawConfig = {
    initialScale: 2,
    pathColour: "#000000",
    pathThickness: 3,
    robotColour: "#0000FF",
    obstacleColour: "#0000EE",
    sensorColour: "green",
    sensorActiveColour: "red",
    sensorConeTheta: Math.PI / 32,
    goalColour: "#DD0000",
    goalThickness: 5,
    obstacleAvoidanceColour: "yellow",
    followWallColour: "orange",
    wallSegmentColour: "purple",
    followWallPerpendicularColour: "brown"
  };

  var xPath, yPath = null;
  var scale = drawConfig.initialScale;
  var centre = false;
  const context = initCanvas(canvas);

  function initCanvas(canvas) {
    const context = canvas.getContext("2d");

    const length = 400; // canvas.parentElement.clientWidth;
    canvas.width = length;
    canvas.height = length;

    return context;
  }

  function initialise() {
    xPath = [];
    yPath = [];
    mockObstacles = [];
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
    const s = context.canvas.height / scale;
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

    const translated = translateAndScale(state.x, state.y);

    drawPath();
    drawObstacles(state.obstacles);
    drawSensors(translated.x, translated.y, state.theta, state.sensors);
    drawRobot(translated.x, translated.y, state.theta);
    drawGoal(state.goal);
    drawVectorRobotFrame(translated.x, translated.y, state.theta, state.obstacleAvoidance, drawConfig.obstacleAvoidanceColour);
    drawVectorRobotFrame(translated.x, translated.y, state.theta, state.followWall, drawConfig.followWallColour);
    drawVectorRobotFrame(translated.x, translated.y, state.theta, state.followWallPerpendicular, drawConfig.followWallPerpendicularColour);
    drawVector(state.wallSegment, drawConfig.wallSegmentColour);
  }

  function drawPath() {
    const canvas = context.canvas;

    context.strokeStyle = drawConfig.pathColour;
    context.lineJoin = "round";
    context.lineWidth = drawConfig.pathThickness / scale;

    context.beginPath();

    for (var i = 0; i < xPath.length; i++) {
      var translated = translateAndScale(xPath[i], yPath[i]);
      if (i === 0) {
        context.moveTo(translated.x, translated.y);
      } else {
        context.lineTo(translated.x, translated.y);
      }
    }

    context.stroke();
  }

  function drawRobot(x, y, theta) {
    // TODO configure the robtot size
    const width = scaleValue(0.05);
    const length = scaleValue(0.1);

    // convert to robot coordinates
    drawRotated(x, y, Math.PI / 2 - theta, function () {
      context.fillStyle = drawConfig.robotColour;
      context.fillRect(-width / 2, -length / 2, width, length);
    });
  }

  function drawSensors(x, y, theta, sensors) {
    drawRotated(x, y, Math.PI / 2 - theta, function () {
      // Due to PI/2 rotation and negative theta to get canvas in robot coordinates must inverse and
      // flip sensor properties and remove the PI/2 rotation
      sensors.forEach(function (sensor) {
        const sensorX = -scaleValue(sensor.y);
        const sensorY = -scaleValue(sensor.x);

        drawRotated(sensorX, sensorY, -sensor.theta - Math.PI / 2, function () {
          context.beginPath();
          context.moveTo(0, 0);

          const h = scaleValue(sensor.distance);

          context.lineTo(Math.cos(drawConfig.sensorConeTheta) * h, Math.sin(drawConfig.sensorConeTheta) * h);
          context.lineTo(Math.cos(-drawConfig.sensorConeTheta) * h, Math.sin(-drawConfig.sensorConeTheta) * h);

          const active = sensor.maxSensorDistance > sensor.distance;
          context.fillStyle = active ? drawConfig.sensorActiveColour : drawConfig.sensorColour;
          context.fill();
        });
      });
    });
  }

  function drawGoal(goal) {
    const translated = translateAndScale(goal.x, goal.y);
    context.fillStyle = drawConfig.goalColour;
    context.fillRect(translated.x, translated.y, drawConfig.goalThickness, drawConfig.goalThickness);
  }

  function drawObstacles(obstacles) {
    obstacles.forEach(function (obstacle) {
      switch (obstacle.type) {
        case 'Rectangle' :
          const translated = translateAndScale(obstacle.x, obstacle.y);
          context.fillStyle = drawConfig.obstacleColour;
          context.fillRect(
            translated.x,
            translated.y,
            scaleValue(obstacle.width),
            scaleValue(obstacle.length)
          );
          break;
        default:
          console.log('Unknown obstacle type: ' + obstacle);
      }
    });
  }

  // TODO not sure I can trust the drawing of any of the vector drawing.....
  function drawVectorRobotFrame(x, y, theta, vector, colour) {
    if (vector) {
      drawRotated(x, y, Math.PI / 2 - theta, function () {
        context.beginPath();
        context.moveTo(-scaleValue(vector.start.y), -scaleValue(vector.start.x));
        context.lineTo(-scaleValue(vector.end.y), -scaleValue(vector.end.x));

        context.strokeStyle = colour;
        context.lineWidth = drawConfig.pathThickness / scale;
        context.stroke();
      });
    }
  }

  function drawVector(vector, colour) {
    if (vector) {
      context.beginPath();

      const translatedStart = translateAndScale(vector.start.x, vector.start.y);
      const translatedEnd = translateAndScale(vector.end.x, vector.end.y);
      context.moveTo(translatedStart.x, translatedStart.y);
      context.lineTo(translatedEnd.x, translatedEnd.y);

      context.strokeStyle = colour;
      context.lineWidth = drawConfig.pathThickness / scale;
      context.stroke();
    }
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

  function getScale() {
    return scale;
  }

  function setCentre(newCentre) {
    centre = newCentre;
  }

  return {
    initialise: initialise,
    redraw: redraw,
    updateState: updateState,
    setScale: setScale,
    getScale: getScale,
    setCentre: setCentre
  };
};