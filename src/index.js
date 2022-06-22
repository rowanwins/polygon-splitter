import rewind from '@turf/rewind'
import {fillQueue} from './fillQueue'
import {findIntersectionPoints} from './findIntersections.js'
// import { _debugCandidatePoly, _debugIntersectionPoint, _debugLinePoints, _debugIntersectionPoints, _debugPolyStart } from './debug'

export default function (polygon, line) {
  const poly = rewind(polygon)

  const intersections = []
  const polygonEdges = []
  const polylineEdges = []
  const polylineBbox = [Infinity, Infinity, Infinity, Infinity]

  fillQueue(poly, line, polygonEdges, polylineEdges, polylineBbox)

  findIntersectionPoints(polygonEdges, polylineEdges, intersections)

  if (intersections.length === 0) {
    return polygon
  }

  let infiniteLoopGuard = 0
  const outPolys = []
  // _debugIntersectionPoints(intersections)
  // Start the rewiring of the outputs from the first intersection point along the polyline line
  // This step makes a difference (eg see the another.geojson harness file)
  let firstPolyStart = null
  for (let index = 0; index < polylineEdges.length; index++) {
    const pe = polylineEdges[index]
    if (pe.intersectionPoints.length > 0) {
      firstPolyStart = pe.intersectionPoints[0]
      break
    }
  }

  let polyStart = firstPolyStart
  let nextPolyStart = {visitCount: 1}
  // Basically we're going to walk our way around the outside of the polygon
  // to find new output polygons until we get back to the beginning
  while (firstPolyStart !== nextPolyStart) {
    if (infiniteLoopGuard > intersections.length * 2) {
      break
    }
    infiniteLoopGuard = infiniteLoopGuard++

    // If we've already visited this intersection point a couple of times we've
    // already used it in it's two output polygons

    if (nextPolyStart.visitCount >= 2) {
      let unvisitedPolyFound = false
      for (let index = 0; index < intersections.length; index++) {
        const intersection = intersections[index]
        if (intersection.visitCount < 2) {
          polyStart = intersection
          unvisitedPolyFound = true
          break
        }
      }
      if (!unvisitedPolyFound) break
    }

    polyStart.visitCount = polyStart.visitCount + 1
    let outPoly = []
    outPolys.push(outPoly)
    outPoly.push(polyStart.p)

    polyStart.visitCount = polyStart.visitCount + 1
    let nextIntersection = walkPolygonForwards(polyStart, outPoly, intersections)
    // _debugCandidatePoly(outPolys)
    // After we've walked the first stretch of the polygon we now have the
    // starting point for our next output polygon
    nextPolyStart = nextIntersection


    // Although sometimes we walk all the way around the outside
    // because our split line goes from outer to inner ring
    let override = false
    if (nextIntersection === nextPolyStart && intersections.length === 2) {
      for (let index = 0; index < intersections.length; index++) {
        const intersection = intersections[index]
        if (intersection.visitCount < 2) {
          override = true
        }
      }
    }

    // An ouput polygon has to contain at least 1 stretch from the original polygon
    // and one stretch from the polyline
    // However it can contain many stretches of each
    // So we walk continually from polyline to polygon collecting the output
    while (nextIntersection !== polyStart || override) {
      const methodForPolyline = nextIntersection.isHeadingIn ? walkPolylineForwards : walkPolylineBackwards
      nextIntersection = methodForPolyline(nextIntersection, outPoly)
      // _debugCandidatePoly(outPolys)

      if (nextIntersection !== polyStart) {
        nextIntersection = walkPolygonForwards(nextIntersection, outPoly, intersections)
        // _debugCandidatePoly(outPolys)
      }
      override = false
    }

    if (nextPolyStart.visitCount >= 2) {
      let unvisitedPolyFound = false
      for (let index = 0; index < intersections.length; index++) {
        const intersection = intersections[index]
        if (intersection.visitCount < 2) {
          polyStart = intersection
          unvisitedPolyFound = true
          break
        }
      }
      if (unvisitedPolyFound) {
        nextPolyStart = polyStart
      }
    }

    // Finally we set the next start point based on what we found earlier
    polyStart = nextPolyStart
  }


  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'MultiPolygon',
      coordinates: outPolys.map(poly => [poly])
    }
  }
}

// Walk around the polygon collecting vertices
function walkPolygonForwards(intersectionPoint, outPoly) {
  let nextEdge = intersectionPoint.polygonEdge
  if (nextEdge.intersectionPoints.length > 1) {
    // _debugIntersectionPoint(intersectionPoint)
    const lastPointOnEdge = nextEdge.intersectionPoints[nextEdge.intersectionPoints.length - 1]
    if (lastPointOnEdge !== intersectionPoint) {
      let currentIndex = findIndexOfIntersectionPoint(intersectionPoint, nextEdge.intersectionPoints)
      let nextIp = nextEdge.intersectionPoints[currentIndex + 1]
      outPoly.push(nextIp.p)
      nextIp.incrementVisitCount()
      return nextIp
    }
  }
  let condition = true
  while (condition) {
    outPoly.push(nextEdge.p2.p)
    nextEdge = nextEdge.nextEdge
    if (nextEdge === null) return intersectionPoint
    else if (nextEdge.intersectionPoints.length > 0) condition = false
  }
  nextEdge.intersectionPoints[0].incrementVisitCount()
  outPoly.push(nextEdge.intersectionPoints[0].p)
  return nextEdge.intersectionPoints[0]
}

// Given a set of intersections find the next one
function findIndexOfIntersectionPoint(intersection, intersections) {
  for (let index = 0; index < intersections.length; index++) {
    const int = intersections[index]
    if (int === intersection) return index
  }
  return null
}


function walkPolylineBackwards(intersectionPoint, outPoly) {
  let nextEdge = intersectionPoint.polylineEdge
  if (nextEdge.intersectionPoints.length === 2) {
    const lastPointOnEdge = nextEdge.intersectionPoints[nextEdge.intersectionPoints.length - 1]
    // debugger
    if (lastPointOnEdge === intersectionPoint) {
      const nextIntersection = nextEdge.intersectionPoints[0]
      outPoly.push(nextIntersection.p)
      nextIntersection.incrementVisitCount()
      return nextIntersection
    } else {
      outPoly.push(lastPointOnEdge.p)
      lastPointOnEdge.incrementVisitCount()
      return lastPointOnEdge
    }
  } else if (nextEdge.intersectionPoints.length > 2) {
    // _debugIntersectionPoint(intersectionPoint)

    const lastPointOnEdge = nextEdge.intersectionPoints[0]
    if (lastPointOnEdge !== intersectionPoint) {
      let currentIndex = findIndexOfIntersectionPoint(intersectionPoint, nextEdge.intersectionPoints)
      let nextIntersection = nextEdge.intersectionPoints[currentIndex - 1]
      outPoly.push(nextIntersection.p)
      nextIntersection.incrementVisitCount()
      return nextIntersection
    }
  }
  let condition = true
  while (condition) {
    outPoly.push(nextEdge.p1.p)
    nextEdge = nextEdge.prevEdge
    if (nextEdge.originalIndex === undefined) return intersectionPoint
    else if (nextEdge.intersectionPoints.length > 0) {
      condition = false
    }
  }
  if (nextEdge.originalIndex === undefined) return intersectionPoint
  const lastIntersection = nextEdge.intersectionPoints[nextEdge.intersectionPoints.length - 1]
  lastIntersection.incrementVisitCount()
  outPoly.push(lastIntersection.p)
  return lastIntersection
}

function walkPolylineForwards(intersectionPoint, outPoly) {
  let nextEdge = intersectionPoint.polylineEdge

  if (nextEdge.intersectionPoints.length > 1) {
    // _debugIntersectionPoint(intersectionPoint)
    const lastPointOnEdge = nextEdge.intersectionPoints[nextEdge.intersectionPoints.length - 1]
    if (lastPointOnEdge !== intersectionPoint) {
      let currentIndex = findIndexOfIntersectionPoint(intersectionPoint, nextEdge.intersectionPoints)
      let nextIp = nextEdge.intersectionPoints[currentIndex + 1]
      outPoly.push(nextIp.p)
      nextIp.incrementVisitCount()
      return nextIp
    }
  }
  let condition = true
  while (condition) {
    outPoly.push(nextEdge.p2.p)
    nextEdge = nextEdge.nextEdge
    if (nextEdge === null) return intersectionPoint
    else if (nextEdge.intersectionPoints.length > 0) condition = false
  }
  if (nextEdge === undefined) return intersectionPoint
  const lastIntersection = nextEdge.intersectionPoints[0]
  lastIntersection.incrementVisitCount()
  outPoly.push(lastIntersection.p)
  return lastIntersection
}

