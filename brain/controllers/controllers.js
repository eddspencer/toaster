const controllers = {
  Stop: require('./controller.stop.js'),
  GoToGoal: require('./controller.gotogoal.js'),
  all: function () {
    const obj = {
      asList: []
    };
    const self = this;
    Object.keys(self).forEach(function (key) {
      if (key !== 'behaviourTypes') {
        const controller = new self[key];
        obj[key] = controller;
        obj.asList.push(controller);
      }
    });
    return obj;
  },
  behaviourTypes: {
    Stop: 'Stop',
    GoToGoal: 'GoToGoal',
    asList: function () {
      const self = this;
      return Object.keys(self).reduce(function (types, key) {
        if ('asList' !== key) {
          types.push(self[key]);
        }
        return types;
      }, []);
    }
  }
};

module.exports = controllers;