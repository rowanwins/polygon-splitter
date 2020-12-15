import TinyQueue from 'tinyqueue'

import {compareEdges} from './compareEdges'
import {fillQueue} from './fillQueue'
import {findIntersectionPoints} from './findIntersections.js'
import { _debugCandidatePoly, _debugLinePoints } from './debug'

export default function (polygon, line) {
  const intersections = []
  const polygonEdges = []
  const polylineEdges = []
  const polygonEdgeQueue = new TinyQueue(null, compareEdges)
  const polylineBbox = [Infinity, Infinity, Infinity, Infinity]

  fillQueue(polygon, line, polygonEdges, polylineEdges, polylineBbox, polygonEdgeQueue)
  const sortedPolygonEdges = []
  while (polygonEdgeQueue.length) sortedPolygonEdges.push(polygonEdgeQueue.pop())

  findIntersectionPoints(polygonEdges, polylineEdges, intersections)

  for (var i = 0; i < intersections.length; i++) {
    if (i % 2 === 0) intersections[i].pair = intersections[i + 1]
    else intersections[i].pair = intersections[i - 1]
  }
  // console.log(intersections)

  const outPolys = []



  // Start by rewiring from the first intersection point along out line
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
  let nextIntersection

  while (firstPolyStart !== nextPolyStart) {

    polyStart.visitCount = polyStart.visitCount + 1

    if (nextPolyStart.visitCount > 2) {
      let unvisitedPolyFound = false
      for (let index = 0; index < intersections.length; index++) {
        const intersection = intersections[index];
        if (intersection.visitCount < 2) {
          polyStart = intersection
          unvisitedPolyFound = true
          break
        }
      }
      if (!unvisitedPolyFound) break
    }
    let outPoly = []
    outPolys.push(outPoly)
    outPoly.push(polyStart.p)

    polyStart.visitCount = polyStart.visitCount + 1
    nextIntersection = walkPolygonForwards(polyStart, outPoly, intersections)
    nextPolyStart = nextIntersection

    const methodForPolyline = nextIntersection.isHeadingIn ? walkPolylineForwards : walkPolylineBackwards

    while (nextIntersection !== polyStart) {
      nextIntersection = methodForPolyline(nextIntersection, outPoly, intersections)
      if (nextIntersection !== polyStart) {
        nextIntersection = walkPolygonForwards(nextIntersection, outPoly, intersections)
      }
    }
    polyStart = nextPolyStart
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


function walkPolygonForwards(intersectionPoint, outPoly) {
  console.log('polygon going forwards', intersectionPoint)
  let nextEdge = intersectionPoint.polygonEdge
  if (nextEdge.intersectionPoints.length > 1) {
    const lastPointOnEdge = nextEdge.intersectionPoints[nextEdge.intersectionPoints.length - 1]
    if (lastPointOnEdge !== intersectionPoint) {
      outPoly.push(nextEdge.intersectionPoints[1].p)
      nextEdge.intersectionPoints[1].visitCount = nextEdge.intersectionPoints[1].visitCount + 1
      return nextEdge.intersectionPoints[1]
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
    if (lastPointOnEdge === intersectionPoint) {
      const nextIntersection = nextEdge.intersectionPoints[0]
      outPoly.push(nextIntersection.p)
      nextIntersection.visitCount = nextIntersection.visitCount + 1
      return nextIntersection
    } else {
      return nextEdge.intersectionPoints[0]
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

