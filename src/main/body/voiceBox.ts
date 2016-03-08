export enum Level {
  Silence, Error, Warn, Info, Debug
}

export interface Logger {
  log(txt: string)
}

export interface VoiceBox {
  info(txt: string)
  warn(txt: string)
  error(txt: string)
  debug(txt: string)
  level: Level
}

export class ConsoleLogger implements Logger {
  log(txt: string) {
    console.log(txt)
  }
}

export class ArrayLogger implements Logger {
  public messages: Array<string> = []
  log(txt: string) {
    this.messages.push(txt)
  }
}

export class DefaultVoiceBox implements VoiceBox {
  constructor(
    public level: Level = Level.Info,
    private logger: Logger = new ConsoleLogger()
  ) { }

  info(txt: string) {
    if (Level.Info <= this.level) {
      this.logger.log(txt)
    }
  }
  warn(txt: string) {
    if (Level.Warn <= this.level) {
      this.logger.log(txt)
    }
  }
  error(txt: string) {
    if (Level.Error <= this.level) {
      this.logger.log(txt)
    }
  }
  debug(txt: string) {
    if (Level.Debug <= this.level) {
      this.logger.log(txt)
    }
  }
}