import TinyQueue from 'tinyqueue'

import {compareEdges} from './compareEdges'
import {fillQueue} from './fillQueue'
import {findIntersectionPoints} from './findIntersections.js'
import { _debugIntersectionPoints, _debugLinePoints } from './debug'

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
  console.log(intersections)
  let outPoly = []
  const outPolys = [outPoly]

  const crossbackMap = new Map()

  for (let index = 0; index < polygonEdges.length; index++) {
    const edge = polygonEdges[index]
    const firstPoint = edge.p1
    outPoly.push(firstPoint.p)

    if (edge.intersectionPoints.length > 0) {
      edge.intersectionPoints.forEach(function (intersection) {
        outPoly.push(intersection.p)
        const pair = intersection.pair

        crossbackMap.set(pair.polygonEdge.originalIndex, {
          usedIn: outPoly
        })

        if (crossbackMap.has(intersection.polygonEdge.originalIndex)) {
          const m = crossbackMap.get(intersection.polygonEdge.originalIndex)
          outPoly = m.usedIn

          if (intersection.isPolylineHeadingIn) {
            console.log('1')
            let linePoint = intersection.polylineEdge.p2
            const target = pair.polylineEdge.p1
            addLinePointsForwards(linePoint, target, outPoly)
          } else {
            console.log('2')
            let linePoint = intersection.polylineEdge.p1
            const target = pair.polylineEdge.p2
            addLinePointsBackwards(linePoint, target, outPoly)
          }
        } else {
          const newOutPoly = []
          outPolys.push(newOutPoly)
          outPoly = newOutPoly
          outPoly.push(pair.p)

          if (intersection.isPolylineHeadingIn) {
            console.log('3')
            let linePoint = intersection.polylineEdge.p2
            const target = pair.polylineEdge.p1
            addLinePointsForwards(linePoint, target, outPoly)
          } else {
            console.log('4')
            let linePoint = intersection.polylineEdge.p1
            const target = pair.polylineEdge.p2
            addLinePointsBackwards(linePoint, target, outPoly)
          }
        }
        outPoly.push(intersection.p)
      })
    }
  }
  console.log(crossbackMap)
  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'MultiPolygon',
      coordinates: [outPolys]
    }
  }
}

function addLinePointsForwards (linePoint, target, outPoly) {
  let condition = linePoint === target
  while (condition) {
    outPoly.push(linePoint.p)
    linePoint = linePoint.nextPoint
    if (linePoint === null) condition = false
    else if (linePoint !== target) condition = false
  }
}

function addLinePointsBackwards (linePoint, target, outPoly) {
  let condition = linePoint === target
  while (condition) {
    outPoly.push(linePoint.p)
    linePoint = linePoint.prevPoint
    if (linePoint === null) condition = false
    else if (linePoint !== target) condition = false
  }
}