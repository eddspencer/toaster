import { Point } from '../geometry/point'
import { Polygon } from '../geometry/shapes'
import { Vector } from '../geometry/vector'
import { geometry } from '../geometry/geometry'
import { State } from './state'

export interface Sensor<T> {
  id: string
  sense(state: State): T
  reading: T
}

export interface IRSensor extends Sensor<number> {
  position: Point
  theta: number
  group: string
  importance: number
  maxDistance: number
}

export class IRSensorModel implements IRSensor {
  minSensorDistance: number = 0.01
  maxSensorDistance: number = 0.2
  reading: number = 0

  constructor(
    public id: string,
    public position: Point,
    public theta: number,
    public group: string,
    public importance: number,
    public maxDistance: number
  ) { }

  private getVector(state: State, distance: number): Vector {
    // Get sensor point in the world frame and compute sensor visibility
    const sensorRotated = geometry.transform(this.position, state.theta)
    const sensorPoint = geometry.createPoint(state.position.x + sensorRotated.x, state.position.y + sensorRotated.y)
    return geometry.createVectorFromPoint(sensorPoint, this.theta + state.theta, distance)
  }

  sense(state: State): number {
    const sensorLine: Vector = this.getVector(state, this.maxSensorDistance)

    const distancesToObstacles = state.world.obstacles.map((obstacle: Polygon) => {
      const lines: Array<Vector> = obstacle.vectors
      const intersectPoints: Array<Point> = lines.reduce((intersections: Array<Point>, line: Vector) => {
        const p = geometry.getIntersectPoint(sensorLine, line)
        if (p) {
          intersections.push(p)
        }
        return intersections
      }, [])
      const distances: Array<number> = intersectPoints.map((point: Point) => {
        return geometry.distanceBetweenPoints(sensorLine.start, point)
      })
      return Math.min.apply(null, distances)
    })

    const distance = Math.min.apply(null, distancesToObstacles)

    // Only update reading if obstacle is within the maximum  and minimum sensor range
    if (distance > this.minSensorDistance && distance < this.maxSensorDistance) {
      this.reading = distance
    } else {
      this.reading = this.maxSensorDistance
    }
    return this.reading
  }
}