import { Vector } from './vector'
import { Point2d } from './point'
import geometry from './geometry'

/**
 * Polygon is an arrray of vectors that form a completed shape
 */
export interface Polygon {
  vectors: Array<Vector>
}

/**
 * Rectangle is defined by a point, width and length, it also stores the vectors that make up it's shape
 */
export class Rectangle extends Point2d implements Polygon {
  vectors: Array<Vector>

  constructor(x: number, public width: number, y: number, public length: number) {
    super(x, y)
    
    // x,y is top left point of rectangle
    const x1 = x
    const x2 = x + width
    const y1 = y
    const y2 = y - length

    this.vectors = [
      geometry.createVector(geometry.createPoint(x1, y1), geometry.createPoint(x1, y2)),
      geometry.createVector(geometry.createPoint(x1, y1), geometry.createPoint(x2, y1)),
      geometry.createVector(geometry.createPoint(x2, y2), geometry.createPoint(x1, y2)),
      geometry.createVector(geometry.createPoint(x2, y2), geometry.createPoint(x2, y1))
    ]
  }
}