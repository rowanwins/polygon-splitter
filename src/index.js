const TinyQueue = require('tinyqueue')
const intersections = []
const polygonEdges = []
const polylineEdges = []

import {compareEdges, compareIpLocations} from './compareEdges'
import {fillQueue} from './fillQueue'
import {findIntersectionPoints} from './findIntersections.js'
import { _debugIntersectionPoints, _debugFillSection } from './debug'

const polygonEdgeQueue = new TinyQueue(null, compareEdges)
const polylineBbox = [Infinity, Infinity, Infinity, Infinity]

export default function (polygon, line) {

  // Section 3.1 of paper
  fillQueue(polygon, line, polygonEdges, polylineEdges, polylineBbox, polygonEdgeQueue)
  // const nonIntersectingEdge = new TinyQueue(null, compareEdges)
  // const potentialIntersectingEdges = new TinyQueue(null, compareEdges)
  // findEdgesWithPossibleIntersections(polygonEdgeQueue, polylineBbox, nonIntersectingEdge, potentialIntersectingEdges)

  const sortedPolygonEdges = []
  while (polygonEdgeQueue.length) sortedPolygonEdges.push(polygonEdgeQueue.pop())

  // Section 3.2 of paper
  findIntersectionPoints(polygonEdges, polylineEdges, intersections)

  for (var i = 0; i < intersections.length - 1; i++) {
    intersections[i].nextIntersection = intersections[i + 1]
  }
  // intersections[intersections.length - 1].nextIntersection = intersections[0]
  _debugIntersectionPoints(intersections)

  // Section 3.3 of paper
  const outPolys = []


  const ipsTravelBackwards = intersections[0].polygonEdge.originalIndex < intersections[1].polygonEdge.originalIndex
  console.log(ipsTravelBackwards)


  let numberOutPolygons = intersections.length > 2 ? (intersections.length / 2) + 1 : 2
  for (let i = 0; i <= numberOutPolygons; i++) {
    let ipValue = intersections[i]
    const outPoly = []
    outPoly.push(ipValue.p)

    let toPlusOne, nextValue
    if (numberOutPolygons === 2) { // For operations where we're only expecting 2 output polys

      nextValue = i === 0 ? intersections[i + 1] : intersections[i - 1]
      toPlusOne = ipValue.polygonEdge.p2
      do {
        outPoly.push(toPlusOne.p)
        if (pointsMatch(nextValue.polygonEdge.p1.p, toPlusOne.p) || pointsMatch(nextValue.polygonEdge.p2.p, toPlusOne.p)) break
        toPlusOne = pointsMatch(toPlusOne.p, toPlusOne.nextPoint.p) ? toPlusOne.nextPoint.nextPoint : toPlusOne.nextPoint
      } while (true)
      outPoly.push(nextValue.p)

      toPlusOne = nextValue.polylineEdge.p1.nextPoint === null || nextValue.polylineEdge.p1.prevPoint === null ? nextValue.polylineEdge.p2 : nextValue.polylineEdge.p1
      do {
        outPoly.push(toPlusOne.p)
        if (pointsMatch(ipValue.polylineEdge.p1.p, toPlusOne.p) || pointsMatch(ipValue.polylineEdge.p2.p, toPlusOne.p)) break
        toPlusOne = pointsMatch(toPlusOne.p, toPlusOne.nextPoint.p) ? toPlusOne.nextPoint.nextPoint : toPlusOne.nextPoint
        toPlusOne = toPlusOne.nextPoint.p
      } while (true)

    } else { // For operations with 3 or more output polys
      nextValue = i < numberOutPolygons ? intersections[i + 1] : intersections[i - 1]

      // If it's the first poly
      if (i === 0) {
        if (ipValue.polylineEdge.originalIndex !== nextValue.polylineEdge.originalIndex) {
          traverseContourForwards(ipValue.polylineEdge.p2, outPoly, nextValue.polylineEdge)
        }
        outPoly.push(nextValue.p)
        if (ipsTravelBackwards === true) traverseContourForwards(nextValue.polygonEdge.p2, outPoly, ipValue.polygonEdge)
        else traverseContourBackwards(nextValue.polygonEdge.p1, outPoly, ipValue.polygonEdge)

      } else if (i === numberOutPolygons - 1) {
        continue
      } else if (i === numberOutPolygons) {  // If it's the end poly

        ipValue = intersections[intersections.length - 2]
        nextValue = intersections[intersections.length - 1]
        if (ipValue.polylineEdge.originalIndex !== nextValue.polylineEdge.originalIndex) {
          traverseContourForwards(ipValue.polylineEdge.p2, outPoly, nextValue.polylineEdge)
        }
        outPoly.push(nextValue.p)
        traverseContourBackwards(nextValue.polygonEdge.p1, outPoly, ipValue.polygonEdge)

      } else { // If it's the middle polys

        const prevValue = intersections[i - 1] // Where we need to get back to
        let currentIp = ipValue
        let numLoops = 0

        // Handle where we're slicing off a chunk
        if (ipValue.polylineEdge.originalIndex === nextValue.polylineEdge.originalIndex) {
          outPoly.push(nextValue.p)
          traverseContourBackwards(nextValue.polygonEdge.p1, outPoly, ipValue.polygonEdge)

        // Handle where we have to do a more complex traverse
        } else {

          do {
            if (currentIp.polylineEdge.originalIndex !== nextValue.polylineEdge.originalIndex) {
              if (!ipsTravelBackwards) {
                if (numLoops % 2 === 0) traverseContourForwards(currentIp.polygonEdge.p2, outPoly, nextValue.polygonEdge)
                else traverseContourForwards(currentIp.polylineEdge.p2, outPoly, nextValue.polylineEdge)
              } else {
                if (numLoops % 2 === 0) traverseContourBackwards(currentIp.polygonEdge.p1, outPoly, nextValue.polygonEdge)
                else traverseContourBackwards(currentIp.polylineEdge.p1, outPoly, nextValue.polylineEdge)
              }
            }
            outPoly.push(nextValue.p)
            numLoops++
            let adjustedI = i + numLoops < intersections.length - 1 ? i + numLoops  + 1 : (i + numLoops + 1) - intersections.length
            if (ipsTravelBackwards && numLoops > 1) adjustedI = i - numLoops + 1
            currentIp = nextValue
            nextValue = intersections[adjustedI]
          } while (currentIp !== prevValue)

          if (ipsTravelBackwards) traverseContourForwards(currentIp.polylineEdge.p2, outPoly, ipValue.polylineEdge)

        }
      }
    }
    outPoly.push(outPoly[0])
    outPolys.push(outPoly)
  }

  return {
    'type': 'Feature',
    'properties': {},
    'geometry': {
      'type': 'MultiPolygon',
      'coordinates': [outPolys]
    }
  }
}

function pointsMatch(p1, p2) {
  if (p2 === null || p1 === null) return false
  return p1[0] === p2[0] && p1[1] === p2[1]
}

function traverseContourBackwards(contour, outPoly, watchFor) {
  do {
    outPoly.push(contour.p)
    if (pointsMatch(watchFor.p1.p, contour.p) || pointsMatch(watchFor.p2.p, contour.p)) break
    contour = contour.prevPoint
  } while (true)
}

function traverseContourForwards(contour, outPoly, watchFor) {
  do {
    outPoly.push(contour.p)
    if (pointsMatch(watchFor.p1.p, contour.p) || pointsMatch(watchFor.p2.p, contour.p)) break
    contour = contour.nextPoint
  } while (true)
}
