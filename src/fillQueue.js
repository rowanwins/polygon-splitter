import {Edge} from './Edge'
import {Point} from './Point'

export function fillQueue(polygon, line, polyEdges, lineEdges, polylineBbox, polygonEdgeQueue) {
  var i, ii, j, polygonSet, p1, p2, e = null
  const lineLength = line.length - 1

  p1 = new Point(line[0])
  for (i = 0; i < lineLength; i++) {
    p2 = new Point(line[i + 1])
    p1.nextPoint = p2
    p2.prevPoint = p1
    lineEdges.push(new Edge(p1, p2, 'polyline', i))

    polylineBbox[0] = Math.min(polylineBbox[0], p1.p[0])
    polylineBbox[1] = Math.min(polylineBbox[1], p1.p[1])
    polylineBbox[2] = Math.max(polylineBbox[2], p1.p[0])
    polylineBbox[3] = Math.max(polylineBbox[3], p1.p[1])

    p1 = p2
  }

  polylineBbox[0] = Math.min(polylineBbox[0], line[lineLength][0])
  polylineBbox[1] = Math.min(polylineBbox[1], line[lineLength][1])
  polylineBbox[2] = Math.max(polylineBbox[2], line[lineLength][0])
  polylineBbox[3] = Math.max(polylineBbox[3], line[lineLength][1])


  const polyLength = polygon.length

  for (i = 0, ii = polyLength; i < ii; i++) {
    polygonSet = polygon[i]
    const tempArray = []
    p1 = new Point(polygonSet[0])
    tempArray.push(p1)

    for (j = 1; j < polygonSet.length; j++) {
      p2 = new Point(polygonSet[j])
      p1.nextPoint = p2
      p2.prevPoint = p1

      e = new Edge(p1, p2, 'polygon', j - 1)
      e.intersectPolylineBbox = edgeIntersectsBbox(e, polylineBbox)
      polyEdges.push(e)
      polygonEdgeQueue.push(e)

      p1 = p2
    }
    e = new Edge(p1, tempArray[0], 'polygon', j - 1)
    e.intersectPolylineBbox = edgeIntersectsBbox(e, polylineBbox)
    polyEdges.push(e)
    polygonEdgeQueue.push(e)

    p2.nextPoint = tempArray[0]
    tempArray[0].prevPoint = p2.prevPoint
  }
}

function edgeIntersectsBbox(edge, bbox) {
  if (edge.maxX < bbox[0]) return false
  if (edge.minX > bbox[2]) return false
  if (edge.maxY < bbox[1]) return false
  if (edge.minY > bbox[3]) return false
  return true
}
