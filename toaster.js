var WebSocketServer = require('ws').Server;

var Toaster = function (config) {
  var wss = null;
  var port = config.port;
  var bot = config.bot;

  var openSocket = function () {
    if (null != wss) {
      wss.close();
    }

    wss = new WebSocketServer({
      port: port
    });

    var id = 0;
    wss.on('connection', function (ws) {

      // On start of connection send initial bot configuration
      var config = bot.config;
      config.type = 'config';
      ws.send(JSON.stringify(config));

      // Set up timer to send current state of bot to client
      id = setInterval(function () {
        var currentState = bot.currentState();
        currentState.type = 'currentState';
        ws.send(JSON.stringify(currentState));
      }, 200);

      console.log('started client interval');

      ws.on('message', function (message) {
        var msg = JSON.parse(message);
        if ('setBehaviour' in msg) {
          bot.setBehaviour(msg.setBehaviour);
        } else if ('setGoal' in msg) {
          bot.setGoal(msg.setGoal);
        } else {
          console.error('Unhandled message: %s', msg);
        }
      });

      ws.on('close', function () {
        console.log('stopping client interval');
        bot.reset();
        clearInterval(id);
      });
    });

  };

  var destroy = function () {
    wss.close();
  };

  return {
    destroy: destroy,
    openSocket: openSocket
  }
};


module.exports = Toaster;