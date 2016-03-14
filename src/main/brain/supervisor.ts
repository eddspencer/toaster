import { State } from './state'
import { EventType } from './event'
import { Controller, Behaviour } from '../controllers/controller'
import { VoiceBox, DefaultVoiceBox } from '../body/voiceBox'

/**
 * Supervisor holds the current behaviour and processes events in the system in order to switch behaviours
 */
export interface Supervisor {
  activeController: Controller
  setBehaviour(behaviour: Behaviour): boolean
  processEvents(events: Array<EventType>): void
}

/**
 * Link between an event type and a a resulting behaviour
 */
export class EventConfig {
  weighting: number = 0
  constructor(
    public type: EventType,
    public behaviour: Behaviour
  ) { }
}

export class DefaultSupervisor implements Supervisor {

  private eventConfig: { [id: string]: EventConfig } = {}
  activeController: Controller

  constructor(
    private controllers: Array<Controller>,
    events: Array<EventConfig>,
    public behaviour: Behaviour = Behaviour.Stop,
    private voiceBox: VoiceBox = new DefaultVoiceBox()
  ) {
    this.activeController = this.filerControllers(behaviour)

    var weighting = 0
    events.forEach(event => {
      // Events are in order of importance
      event.weighting = ++weighting
      this.eventConfig[event.type] = event
    });
  }

  private filerControllers(behaviour: Behaviour): Controller {
    const filtered = this.controllers.filter((controller) => {
      return controller.behaviour === behaviour
    })
    if (filtered.length === 1) {
      return filtered[0]
    } else {
      this.voiceBox.error('Unable to get single controller for ' + Behaviour[behaviour] + ' got: ' + filtered)
      return null
    }
  }

  setBehaviour(behaviour: Behaviour): boolean {
    var changed = false
    if (behaviour !== this.behaviour) {
      const controller = this.filerControllers(behaviour)
      if (controller) {
        this.voiceBox.info('Setting behaviour to be ' + Behaviour[behaviour])
        this.activeController.reset()
        this.activeController = controller
        this.behaviour = behaviour
        // TODO have to handle this elsewhere 
        // TODO also have to copy this behaviour to state
        // this.progressMade = null // Changing behaviour resets any progress you may have had in previous state
        changed = true
      }
    }
    return changed
  }

  private sortEvents(events: Array<EventType>): Array<EventType> {
    const config = this.eventConfig
    return events.sort((e1, e2) => {
      return config[e1].weighting - config[e2].weighting
    })
  }

  processEvents(events: Array<EventType>): void {
    if (events.length > 0) {
      const sorted = this.sortEvents(events)
      const behaviour = this.eventConfig[sorted[0]].behaviour
      this.setBehaviour(behaviour)
    }
  }

}