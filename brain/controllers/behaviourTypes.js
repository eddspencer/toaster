const behaviourTypes = {
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
};

module.exports = behaviourTypes;