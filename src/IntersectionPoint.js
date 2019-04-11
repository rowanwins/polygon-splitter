export class IntersectionPoint {

  constructor(p, edge1, edge2, isPolylineHeadingIn) {
    this.p = p
    this.polylineEdge = edge1
    this.polygonEdge = edge2
    this.isPolylineHeadingIn = isPolylineHeadingIn
    this.visited = false
    this.nextIntersection = null
    
    this.to = this.calculateTo()
    this.from = this.calculateFrom()
  }

  isEqualTo(otherPoint) {
    return this.p[0] === otherPoint.p[0] && this.p[1] === otherPoint.p[1]
  }

  calculateTo() {
    if (this.isPolylineHeadingIn) return this.polylineEdge.p2
    else return this.polylineEdge.p1
  }

  calculateFrom() {
    if (this.isPolylineHeadingIn) return this.polylineEdge.p1
    else return this.polylineEdge.p2
  }

}
