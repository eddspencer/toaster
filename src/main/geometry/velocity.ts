export interface Velocity {
  v: number
  w: number
}

export class Velocity2d {
  constructor(public v: number = 0, public w: number = 0) { }
}