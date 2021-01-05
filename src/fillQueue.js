import {Edge} from './Edge'
import {Point} from './Point'

export function fillQueue(polygon, line, polyEdges, lineEdges, polylineBbox) {

  const linegeom = line.type === 'Feature' ? line.geometry : line
  const linecoords = linegeom.type === 'LineString' ? [linegeom.coordinates] : linegeom.coordinates

  let edgeCount = 0

  for (let i = 0; i < linecoords.length; i++) {

    const lineLength = linecoords[i].length - 1
    let p1 = new Point(linecoords[i][0])
    let p2 = null
    let prevEdge = {nextEdge: null}

    for (let ii = 0; ii < lineLength; ii++) {
      p2 = new Point(linecoords[i][ii + 1])
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
    polylineBbox[0] = Math.min(polylineBbox[0], linecoords[i][lineLength][0])
    polylineBbox[1] = Math.min(polylineBbox[1], linecoords[i][lineLength][1])
    polylineBbox[2] = Math.max(polylineBbox[2], linecoords[i][lineLength][0])
    polylineBbox[3] = Math.max(polylineBbox[3], linecoords[i][lineLength][1])
  }

  const polygeom = polygon.type === 'Feature' ? polygon.geometry : polygon
  const polycoords = polygeom.type === 'Polygon' ? [polygeom.coordinates] : polygeom.coordinates

  const polyLength = polycoords.length

  for (let i = 0; i < polyLength; i++) {

    let polyLenth2 = polycoords[i].length

    for (let ii = 0; ii < polyLenth2; ii++) {
      let polygonSet = polycoords[i][ii]
      let polyLenth3 = polygonSet.length

      const firstPoint = new Point(polygonSet[0])
      let p1 = firstPoint
      let p2, e = null
      let prevEdge = {nextEdge: null, prevEdge: null}
      let firstEdge = null

      for (let iii = 1; iii < polyLenth3; iii++) {
        p2 = new Point(polygonSet[iii])
        p1.nextPoint = p2
        p2.prevPoint = p1

        e = new Edge(p1, p2, 'polygon', edgeCount)
        prevEdge.nextEdge = e
        e.prevEdge = prevEdge
        if (iii === 1) firstEdge = e

        if (ii > 0) e.interiorRing = true
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
}

function edgeIntersectsBbox(edge, bbox) {
  if (edge.maxX < bbox[0]) return false
  if (edge.minX > bbox[2]) return false
  if (edge.maxY < bbox[1]) return false
  if (edge.minY > bbox[3]) return false
  return true
}
