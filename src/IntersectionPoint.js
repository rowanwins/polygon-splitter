let ip = 0

export class IntersectionPoint {

  constructor(p, edge1, edge2) {
    this.p = p
    this.polylineEdge = edge1
    this.polygonEdge = edge2
    this.isPolylineHeadingIn = isEven(ip)
    this.visited = false
    this.pair = null
    this.ip = ip
    ip = ip + 1

    this.polygonEdge.intersectionPoints.push(this)
  }
}

function isEven(n) {
  return n % 2 === 0
}
