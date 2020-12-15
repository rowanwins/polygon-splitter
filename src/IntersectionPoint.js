export class IntersectionPoint {

  constructor(p, edge1, edge2, isHeadingIn) {
    this.p = p
    this.polylineEdge = edge1
    this.polygonEdge = edge2
    this.isHeadingIn = isHeadingIn
    this.pair = null

    this.distanceFromPolylineEdgeStart = distance(this.polylineEdge.p1.p, this.p)

    this.polygonEdge.intersectionPoints.push(this)
    this.polylineEdge.intersectionPoints.push(this)

    this.visitCount = 0
  }

  setOrderInfo(ip) {
    this.ip = ip
  }
}

function distance(p1, p2) {
  let xs = p2[0] - p1[0]
  let ys = p2[1] - p1[1]
  xs *= xs
  ys *= ys

  return Math.sqrt(xs + ys)
}
