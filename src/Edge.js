export class Edge {

  constructor(p1, p2, edgeType, index, contourId) {
    this.p1 = p1
    this.p2 = p2
    this.edgeType = edgeType
    this.originalIndex = index

    this.polygonContourId = contourId
    this.interiorRing = false

    this.minX = Math.min(p1.p[0], p2.p[0])
    this.minY = Math.min(p1.p[1], p2.p[1])

    this.maxX = Math.max(p1.p[0], p2.p[0])
    this.maxY = Math.max(p1.p[1], p2.p[1])

    this.intersectionPoints = []
    this.nextEdge = null
  }

}
