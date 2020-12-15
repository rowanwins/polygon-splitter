import {Edge} from './Edge'
import {Point} from './Point'

export function fillQueue(polygon, line, polyEdges, lineEdges, polylineBbox) {
  var i, ii, j, polygonSet, p1, p2, e = null
  let edgeCount = 0
  const linegeom = line.type === 'Feature' ? line.geometry : line

  let linecoords = linegeom.coordinates
  const lineLength = linecoords.length - 1

  p1 = new Point(linecoords[0])
  let prevEdge = {nextEdge: null}
  for (i = 0; i < lineLength; i++) {
    p2 = new Point(linecoords[i + 1])
    p1.nextPoint = p2
    p2.prevPoint = p1
    const e = new Edge(p1, p2, 'polyline', edgeCount)
    lineEdges.push(e)
    prevEdge.nextEdge = e
    e.prevEdge = prevEdge
    polylineBbox[0] = Math.min(polylineBbox[0], p1.p[0])
    polylineBbox[1] = Math.min(polylineBbox[1], p1.p[1])
    polylineBbox[2] = Math.max(polylineBbox[2], p1.p[0])
    polylineBbox[3] = Math.max(polylineBbox[3], p1.p[1])

    p1 = p2
    edgeCount = edgeCount + 1
    prevEdge = e
  }

  polylineBbox[0] = Math.min(polylineBbox[0], linecoords[lineLength][0])
  polylineBbox[1] = Math.min(polylineBbox[1], linecoords[lineLength][1])
  polylineBbox[2] = Math.max(polylineBbox[2], linecoords[lineLength][0])
  polylineBbox[3] = Math.max(polylineBbox[3], linecoords[lineLength][1])

  const polygeom = polygon.type === 'Feature' ? polygon.geometry : polygon

  let polycoords = polygeom.coordinates

  const polyLength = polycoords.length

  for (i = 0, ii = polyLength; i < ii; i++) {
    polygonSet = polycoords[i]
    const firstPoint = new Point(polygonSet[0])
    p1 = firstPoint

    let prevEdge = {nextEdge:null, prevEdge: null}
    let firstEdge = null

    for (j = 1; j < polygonSet.length; j++) {
      p2 = new Point(polygonSet[j])
      p1.nextPoint = p2
      p2.prevPoint = p1

      e = new Edge(p1, p2, 'polygon', edgeCount)
      prevEdge.nextEdge = e
      e.prevEdge = prevEdge
      if (j === 1) firstEdge = e

      if (i > 0) e.interiorRing = true
      e.intersectPolylineBbox = edgeIntersectsBbox(e, polylineBbox)
      polyEdges.push(e)

      p1 = p2
      edgeCount = edgeCount + 1
      prevEdge = e
    }

    e.nextEdge = firstEdge
    firstEdge.prevEdge = e
    p2.nextPoint = firstPoint.nextPoint
    firstPoint.prevPoint = p2.prevPoint
  }
}

function edgeIntersectsBbox(edge, bbox) {
  if (edge.maxX < bbox[0]) return false
  if (edge.minX > bbox[2]) return false
  if (edge.maxY < bbox[1]) return false
  if (edge.minY > bbox[3]) return false
  return true
}
