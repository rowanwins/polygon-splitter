import {fillQueue} from './fillQueue'
import {findIntersectionPoints} from './findIntersections.js'
import { _debugCandidatePoly, _debugLinePoints } from './debug'

export default function (polygon, line) {
  const intersections = []
  const polygonEdges = []
  const polylineEdges = []
  const polylineBbox = [Infinity, Infinity, Infinity, Infinity]

  fillQueue(polygon, line, polygonEdges, polylineEdges, polylineBbox)

  findIntersectionPoints(polygonEdges, polylineEdges, intersections)

  // console.log(intersections)

  const outPolys = []

  // Start by rewiring from the first intersection point along the polyline line
  // This step makes a difference (eg see the another.geojson harness file)
  let firstPolyStart = null
  for (let index = 0; index < polylineEdges.length; index++) {
    const pe = polylineEdges[index]
    if (pe.intersectionPoints) {
      firstPolyStart = pe.intersectionPoints[0]
      break
    }
  }

  let polyStart = firstPolyStart
  let nextPolyStart = {visitCount: 0}

  while (firstPolyStart !== nextPolyStart) {

    if (nextPolyStart.visitCount > 2) {
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
    nextPolyStart = nextIntersection
    // _debugCandidatePoly(outPolys)
    const methodForPolyline = nextIntersection.isHeadingIn ? walkPolylineForwards : walkPolylineBackwards

    while (nextIntersection !== polyStart) {
      nextIntersection = methodForPolyline(nextIntersection, outPoly, intersections)
      // _debugCandidatePoly(outPolys)

      if (nextIntersection !== polyStart) {
        nextIntersection = walkPolygonForwards(nextIntersection, outPoly, intersections)
      }
    }
    polyStart = nextPolyStart
    // _debugCandidatePoly(outPolys)
  }


  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'MultiPolygon',
      coordinates: [outPolys]
    }
  }
}

function findNextIp(intersection, intersections) {
  for (let index = 0; index < intersections.length; index++) {
    const int = intersections[index]
    if (int === intersection) return intersections[index + 1]
  }
}

function walkPolygonForwards(intersectionPoint, outPoly) {
  console.log('polygon going forwards')
  let nextEdge = intersectionPoint.polygonEdge
  if (nextEdge.intersectionPoints.length > 1) {
    const lastPointOnEdge = nextEdge.intersectionPoints[nextEdge.intersectionPoints.length - 1]
    if (lastPointOnEdge !== intersectionPoint) {
      const nextIp = findNextIp(intersectionPoint, nextEdge.intersectionPoints)
      outPoly.push(nextIp.p)
      nextIp.visitCount = nextIp.visitCount + 1
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
  nextEdge.intersectionPoints[0].visitCount = nextEdge.intersectionPoints[0].visitCount + 1
  outPoly.push(nextEdge.intersectionPoints[0].p)
  return nextEdge.intersectionPoints[0]
}

function walkPolylineBackwards(intersectionPoint, outPoly, intersections) {
  console.log('polyline going backwards')
  let nextEdge = intersectionPoint.polylineEdge
  if (nextEdge.intersectionPoints.length === 2) {
    const lastPointOnEdge = nextEdge.intersectionPoints[nextEdge.intersectionPoints.length - 1]
    // debugger
    if (lastPointOnEdge === intersectionPoint) {
      const nextIntersection = nextEdge.intersectionPoints[0]
      outPoly.push(nextIntersection.p)
      nextIntersection.visitCount = nextIntersection.visitCount + 1
      return nextIntersection
    } else {
      // return nextEdge.intersectionPoints[0]
      outPoly.push(lastPointOnEdge.p)
      lastPointOnEdge.visitCount = lastPointOnEdge.visitCount + 1
      return lastPointOnEdge
    }
  } else if (nextEdge.intersectionPoints.length > 2) {
    const lastPointOnEdge = nextEdge.intersectionPoints[nextEdge.intersectionPoints.length - 1]
    if (lastPointOnEdge === intersectionPoint) {
      const nextIntersection = intersections[intersectionPoint.ip - 1]
      outPoly.push(nextIntersection.p)
      nextIntersection.visitCount = nextIntersection.visitCount + 1
      return nextIntersection
    } else {
      return nextEdge.intersectionPoints[0]
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
  lastIntersection.visitCount = lastIntersection.visitCount + 1
  outPoly.push(lastIntersection.p)
  return lastIntersection
}

function walkPolylineForwards(intersectionPoint, outPoly, intersections) {
  console.log('polyline going forwards')
  let nextEdge = intersectionPoint.polylineEdge
  if (nextEdge.intersectionPoints.length === 2) {
    const lastPointOnEdge = nextEdge.intersectionPoints[nextEdge.intersectionPoints.length - 1]
    // debugger

    if (lastPointOnEdge === intersectionPoint) {
      const nextIntersection = nextEdge.intersectionPoints[0]
      outPoly.push(nextIntersection.p)
      nextIntersection.visitCount = nextIntersection.visitCount + 1
      return nextIntersection
    } else {
      outPoly.push(lastPointOnEdge.p)
      lastPointOnEdge.visitCount = lastPointOnEdge.visitCount + 1
      return lastPointOnEdge
    }
  } else if (nextEdge.intersectionPoints.length > 2) {
    const lastPointOnEdge = nextEdge.intersectionPoints[nextEdge.intersectionPoints.length - 1]
    if (lastPointOnEdge !== intersectionPoint) {
      const nextPointOnEdge = intersections[intersectionPoint.ip + 1]
      outPoly.push(nextPointOnEdge.p)
      nextPointOnEdge.visitCount = nextPointOnEdge.visitCount + 1
      return nextPointOnEdge
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
  const lastIntersection = nextEdge.intersectionPoints[nextEdge.intersectionPoints.length - 1]
  lastIntersection.visitCount = lastIntersection.visitCount + 1
  outPoly.push(lastIntersection.p)
  return lastIntersection
}

