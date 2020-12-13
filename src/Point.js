export class Point {

  constructor(p) {
    this.p = p
    this.nextPoint = null
    this.prevPoint = null
    this.visited = false

    this.intersectionPoints = []
  }
}
