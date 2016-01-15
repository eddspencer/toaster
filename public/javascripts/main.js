(function () {
  var socket = initSocket(document.currentScript.getAttribute('host'));
  var canvas = document.getElementById("draw");
  var robotMontitor = new RobotMonitor(canvas);
  robotMontitor.setBehaviour = function(behaviour)  {
    socket.send(JSON.stringify({
      setBehaviour: behaviour
    }));
  };
  robotMontitor.goalUpdated = function(x, y) {
    if (socket.isOpen()) {
      socket.send(JSON.stringify({
        setGoal: {
          x: x,
          y: y
        }
      }));
    }
  };
  robotMontitor.toggleStart = function() {
    if (socket.isOpen()) {
      socket.close();
    } else  {
      socket.open();
    }
  };
  robotMontitor.setDebug = function(debug) {
  socket.send(JSON.stringify({
      setDebug: debug
    }));
  };

  function initSocket(host) {
    var socket = new LazyWebSocket('ws://' + host);

    socket.onmessage = function (msgStr) {
      var msg = JSON.parse(msgStr.data);
      if (msg.type === "currentState") {
        robotMontitor.updateState(msg);
      } else if (msg.type === 'config') {
        robotMontitor.setConfig(msg);
      }
    };

    return socket;
  }

}());