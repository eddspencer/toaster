import { Point, Point2d } from './point'
import { Vector } from './vector'
import { Rectangle } from './shapes'

/**
 * Useful geometry functions
 */
export class geometry {

  constructor() {
    throw new Error("Factory cannot be instantiated")
  }

  static createPoint(x: number, y: number): Point {
    return new Point2d(x, y)
  }

  static createVector(start: Point, end: Point): Vector {
    return new Vector(start, end)
  }

  static createVectorFromPoint(start: Point, theta: number, length: number): Vector {
    const end: Point = this.createPoint(start.x + Math.cos(theta) * length, start.y + Math.sin(theta) * length)
    return this.createVector(start, end)
  }

  static createRectangle(x: number, width: number, y: number, length: number): Rectangle {
    return new Rectangle(x, width, y, length)
  }

  static distanceBetweenPoints(p1: Point, p2): number {
    const xDist: number = p2.x - p1.x
    const yDist: number = p2.y - p1.y
    return Math.sqrt(xDist * xDist + yDist * yDist)
  }

  static norm(p: Point): number {
    return Math.sqrt(p.x * p.x + p.y * p.y)
  }

  static boundAngle(theta: number): number {
    // Use atan2 to make sure this stays in [-pi,pi]
    return Math.atan2(Math.sin(theta), Math.cos(theta))
  }

  /**
   * Use cross product to check if the line intersect and find where on the line that they do
   */
  static getIntersectPoint(line1: Vector, line2: Vector): Point {
    const denominator = ((line2.end.y - line2.start.y) * (line1.end.x - line1.start.x)) - ((line2.end.x - line2.start.x) * (line1.end.y - line1.start.y))
    if (denominator === 0) {
      return null
    } else {
      const xDist = line1.start.x - line2.start.x
      const yDist = line1.start.y - line2.start.y
      const numerator1 = ((line2.end.x - line2.start.x) * yDist) - ((line2.end.y - line2.start.y) * xDist)
      const numerator2 = ((line1.end.x - line1.start.x) * yDist) - ((line1.end.y - line1.start.y) * xDist)

      const a = numerator1 / denominator
      const b = numerator2 / denominator

      const onLine1 = a > 0 && a < 1
      const onLine2 = b > 0 && b < 1
      if (onLine1 && onLine2) {
        const x = line1.start.x + (a * (line1.end.x - line1.start.x))
        const y = line1.start.y + (a * (line1.end.y - line1.start.y))
        return this.createPoint(x, y)
      } else {
        return null
      }
    }
  }

  static addVectors(v1, v2): Vector {
    const start = this.createPoint(v1.start.x + v2.start.x, v1.start.y + v2.start.y)
    const end = this.createPoint(v1.end.x + v2.end.x, v1.end.y + v2.end.y)
    return this.createVector(start, end)
  }

  /**
   * Transform around origin using matrix: R = [cos(theta) -sin(theta) x sin(theta) cos(theta) y 0 0 1]
   * and v = [x y 1] to get the points rotated by theta. Theta rotates anti-clockwise
   */
  static transform(p: Point, theta: number): Point {
    const xT = p.x * Math.cos(-theta) + p.y * Math.sin(-theta)
    const yT = -p.x * Math.sin(-theta) + p.y * Math.cos(-theta)
    return this.createPoint(xT, yT)
  }
}
