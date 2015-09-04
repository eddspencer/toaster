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
        const controller = new self[key](self);
        obj[key] = controller;
        obj.asList.push(controller);
      }
    });
    return obj;
  },
  behaviourTypes: {
    Stop: 'Stop',
    GoToGoal: 'GoToGoal',
    AvoidObstacle: 'AvoidObstacle',
    FollowWall: 'FollowWall',
    asList: function () {
      const self = this;
      return Object.keys(self).reduce(function (types, key) {
        if ('asList' !== key) {
          types.push(self[key]);
        }
        return types;
      }, []);
    }
  },
  sensorGroups: {
    Right: 'Right',
    Left: 'Left',
    Front: 'Front'
  }
};

module.exports = controllers;