import {IntersectionPoint} from './IntersectionPoint'
import {orient2d} from 'robust-predicates'

export function findIntersectionPoints(polygonEdges, lineEdges, intersectingPoints) {
  let i, ii, iii
  let count = lineEdges.length
  let polyCount = polygonEdges.length
  let intersectionCount = 0
  for (i = 0; i < count; i++) {
    let lineEdge = lineEdges[i]

    for (ii = 0; ii < polyCount; ii++) {
      const polygonEdge = polygonEdges[ii]
      if (!polygonEdge.intersectPolylineBbox) continue

      if (polygonEdge.maxX < lineEdge.minX || polygonEdge.minX > lineEdge.maxX) continue
      if (polygonEdge.maxY < lineEdge.minY || polygonEdge.minY > lineEdge.maxY) continue
      const intersection = getEdgeIntersection(lineEdge, polygonEdge)
      if (intersection !== null) {
        for (iii = 0; iii < intersection.length; iii++) {
          const isHeadingIn = orient2d(polygonEdge.p1.p[0], polygonEdge.p1.p[1], polygonEdge.p2.p[0], polygonEdge.p2.p[1], lineEdge.p1.p[0], lineEdge.p1.p[1])
          var ip = new IntersectionPoint(intersection[iii], lineEdge, polygonEdge, isHeadingIn > 0, intersectionCount)
          intersectingPoints.push(ip)
          intersectionCount = intersectionCount++
        }
      }
    }
  }
  lineEdges.forEach(function (edge) {
    edge.intersectionPoints.sort(function (a, b) {
      return a.distanceFromPolylineEdgeStart - b.distanceFromPolylineEdgeStart
    })
  })

  polygonEdges.forEach(function (edge) {
    edge.intersectionPoints.sort(function (a, b) {
      return a.distanceFromPolygonEdgeStart - b.distanceFromPolygonEdgeStart
    })
  })
}

var EPSILON = 1e-9

function crossProduct(a, b) {
  return (a[0] * b[1]) - (a[1] * b[0])
}

function dotProduct(a, b) {
  return (a[0] * b[0]) + (a[1] * b[1])
}

function toPoint(p, s, d) {
  return [
    p[0] + s * d[0],
    p[1] + s * d[1]
  ]
}

export function getEdgeIntersection(lineEdge, potentialEdge, noEndpointTouch) {
  var va = [lineEdge.p2.p[0] - lineEdge.p1.p[0], lineEdge.p2.p[1] - lineEdge.p1.p[1]]
  var vb = [potentialEdge.p2.p[0] - potentialEdge.p1.p[0], potentialEdge.p2.p[1] - potentialEdge.p1.p[1]]

  var e = [potentialEdge.p1.p[0] - lineEdge.p1.p[0], potentialEdge.p1.p[1] - lineEdge.p1.p[1]]
  var kross = crossProduct(va, vb)
  var sqrKross = kross * kross
  var sqrLenA  = dotProduct(va, va)

  if (sqrKross > 0) {

    var s = crossProduct(e, vb) / kross
    if (s < 0 || s > 1) return null
    var t = crossProduct(e, va) / kross
    if (t < 0 || t > 1) return null
    if (s === 0 || s === 1) {
      // on an endpoint of line segment a
      return noEndpointTouch ? null : [toPoint(lineEdge.p1.p, s, va)]
    }
    if (t === 0 || t === 1) {
      // on an endpoint of line segment b
      return noEndpointTouch ? null : [toPoint(potentialEdge.p1.p, t, vb)]
    }
    return [toPoint(lineEdge.p1.p, s, va)]
  }

  var sqrLenE = dotProduct(e, e)
  kross = crossProduct(e, va)
  sqrKross = kross * kross

  if (sqrKross > EPSILON * sqrLenA * sqrLenE) return null

  var sa = dotProduct(va, e) / sqrLenA
  var sb = sa + dotProduct(va, vb) / sqrLenA
  var smin = Math.min(sa, sb)
  var smax = Math.max(sa, sb)

  if (smin <= 1 && smax >= 0) {

    if (smin === 1) return noEndpointTouch ? null : [toPoint(lineEdge.p1.p, smin > 0 ? smin : 0, va)]

    if (smax === 0) return noEndpointTouch ? null : [toPoint(lineEdge.p1.p, smax < 1 ? smax : 1, va)]

    if (noEndpointTouch && smin === 0 && smax === 1) return null

    return [
      toPoint(lineEdge.p1.p, smin > 0 ? smin : 0, va),
      toPoint(lineEdge.p1.p, smax < 1 ? smax : 1, va)
    ]
  }

  return null
}
