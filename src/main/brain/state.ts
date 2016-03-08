import { Point, Point2d } from '../geometry/point'

interface Obstacle {
  
}

interface World {
  obstacles: Array<Obstacle>  
}

class BlankWorld implements World {
  obstacles: Array<Obstacle> = []
}

export interface State {
  position: Point
  theta: number
  world: World
}

export class DefaultState implements State {
  world: World = new BlankWorld()
  
  constructor(
    public position: Point = new Point2d(0, 0),
    public theta: number = 0
  ) { }
}