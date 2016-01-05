const controllers = {
  Stop: require('./Stop'),
  GoToGoal: require('./GoToGoal'),
  AvoidObstacle: require('./AvoidObstacle'),
  FollowWall: require('./FollowWall'),
  all: function () {
    const obj = {
      asList: []
    };
    const self = this;
    Object.keys(self).forEach(function (key) {
      if (!~['behaviourTypes', 'all', 'sensorGroups'].indexOf(key)) {
        const controller = new self[key]();
        obj[key] = controller;
        obj.asList.push(controller);
      }
    });
    return obj;
  }
};

module.exports = controllers;