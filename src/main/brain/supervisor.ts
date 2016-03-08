import { State } from './state'

/**
 * Supervisor holds the current behaviour and processes events in the system in order to switch behaviours
 */

enum Behaviour {
  Stop, AvoidObstacle, FollowWall, GoToGoal
}

interface Controller {
  behaviour: Behaviour
  reset(): void
}

interface Event {

}

interface EventConfig {
  id: string
  weigthing: number
  behaviour: Behaviour
}

interface Supervisor {
  controllers: Array<Controller>
  events: Array<EventConfig>
  setBehaviour(behaviour: Behaviour): boolean
  // behaviour: Behaviour
  // processEvents(events: Array<Event>): void
  // reset(): void
}

class DefaultSupervisor implements Supervisor {

  private progressMade: boolean
  private controller: Controller

  constructor(
    public controllers: Array<Controller>,
    public events: Array<EventConfig>,
    public behaviour: Behaviour = Behaviour.Stop
  ) { }

  setBehaviour(behaviour: Behaviour): boolean {
    if (behaviour !== this.behaviour) {
      const validControllers = this.controllers.filter((controller) => {
        return controller.behaviour === behaviour
      });

      if (1 === validControllers.length) {
        console.log('Setting behaviour to be ' + behaviour);
        this.controller.reset();
        this.controller = validControllers[0];
        this.behaviour = behaviour;
        this.progressMade = null; // Changing behaviour resets any progress you may have had in previous state
        return true;
      } else {
        console.error('Unable to get single controller for ' + behaviour + ' got: ' + validControllers);
        return false;
      }
    }
    return false;
  };

}

// const Supervisor = function(config) {
//   const controllers = config.controllers;
//   const eventConfig = config.eventConfig || {
//     "AT_GOAL": { weighting: 100, behaviour: Behaviours.Stop },
//     "UNSAFE": { weighting: 90, behaviour: Behaviours.AvoidObstacle },
//     "AT_OBSTACLE": { weighting: 80, behaviour: Behaviours.FollowWall },
//     "CLEARED_OBSTACLE": { weighting: 0, behaviour: Behaviours.GoToGoal },
//     "PROGRESS_MADE": { weighting: 0, behaviour: Behaviours.GoToGoal }
//   };
//   var controller;
//   var state;

//   const initState = function() {
//     controller = controllers.Stop;
//     state = {
//       properties: ['x', 'y', 'theta', 'v'],
//       dt: config.dt,
//       v: config.v,
//       obstacles: config.obstacles,
//       sensors: config.sensors,
//       encoders: config.encoders,
//       goal: config.goal,
//       currentBehaviour: controller.behaviour,
//       x: config.x || 0,
//       y: config.y || 0,
//       dx: 0,
//       dy: 0,
//       theta: Math.PI / 4
//     };
//   };

//   /**
//    * Set the current behaviour of the system, only changes if the behaviour is different.
//    *
//    * @param behaviour The new behaviour
//    * @returns {boolean} Whether a change was made
//    */
//   const setBehaviour = function(behaviour) {
//     if (behaviour !== state.currentBehaviour) {
//       const validControllers = controllers.asList.filter(function(controller) {
//         return controller.behaviour === behaviour
//       });

//       if (1 === validControllers.length) {
//         console.log('Setting behaviour to be ' + behaviour);
//         controller.reset();
//         controller = validControllers[0];
//         state.currentBehaviour = controller.behaviour;
//         state.progressMade = null; // Changing behaviour resets any progress you may have had in previous state
//       } else {
//         console.error('Unable to get single controller for ' + behaviour + ' got: ' + validControllers);
//       }
//       return true;
//     }
//     return false;
//   };

//   const setGoal = function(newGoal) {
//     state.goal = newGoal;
//   };

//   const sortEvents = function(events) {
//     return events.sort(function(e1, e2) {
//       return eventConfig[e2].weighting - eventConfig[e1].weighting;
//     });
//   };

//   const processEvents = function(currentEvents) {
//     if (currentEvents.length > 0) {
//       const sorted = sortEvents(currentEvents);
//       const behaviour = eventConfig[sorted[0]].behaviour;
//       setBehaviour(behaviour);
//     }
//   };

//   const reset = function() {
//     setBehaviour(Behaviours.Stop);
//     initState();
//   };

//   const execute = function(state) {
//     const output = controller.execute(state);

//     // TODO will be easier to debug when data pushed from client. Also better for multiple clients

//     state.theta += output.w * state.dt;

//     state.dx = output.v * Math.cos(state.theta);
//     state.dy = output.v * Math.sin(state.theta);

//     state.x += state.dx;
//     state.y += state.dy;
//   };

//   initState();

//   return {
//     execute: execute,
//     setBehaviour: setBehaviour,
//     setGoal: setGoal,
//     processEvents: processEvents,
//     reset: reset,
//     currentState: function() {
//       return state;
//     }
//   };
// };

// module.exports = Supervisor;
