'use strict';

function compareEdges(edge1, edge2) {
  if (edge1.minX > edge2.minX) return 1
  if (edge1.minX < edge2.minX) return -1

  if (edge1.minY > edge2.minY) return 1
  if (edge1.minY < edge2.minY) return -1
  return 1
}

class Edge {

  constructor(p1, p2, edgeType) {
    this.p1 = p1;
    this.p2 = p2;
    this.edgeType = edgeType;


    this.minX = Math.min(p1.p[0], p2.p[0]);
    this.minY = Math.min(p1.p[1], p2.p[1]);

    this.maxX = Math.max(p1.p[0], p2.p[0]);
    this.maxY = Math.max(p1.p[1], p2.p[1]);
  }

}

class Point {

  constructor(p) {
    this.p = p;
    this.nextPoint = null;
  }

}

function fillQueue(polygon, line, polyEdges, lineEdges, polylineBbox) {
  var i, ii, j, polygonSet, p1, p2, e;
  const lineLength = line.length - 1;

  p1 = new Point(line[0]);
  for (i = 0; i < lineLength; i++) {
    p2 = new Point(line[i + 1]);
    p1.nextPoint = p2;
    lineEdges.addLast(new Edge(p1, p2, 'polyline'));

    polylineBbox[0] = Math.min(polylineBbox[0], p1.p[0]);
    polylineBbox[1] = Math.min(polylineBbox[1], p1.p[1]);
    polylineBbox[2] = Math.max(polylineBbox[2], p1.p[0]);
    polylineBbox[3] = Math.max(polylineBbox[3], p1.p[1]);

    p1 = p2;
  }

  polylineBbox[0] = Math.min(polylineBbox[0], line[lineLength][0]);
  polylineBbox[1] = Math.min(polylineBbox[1], line[lineLength][1]);
  polylineBbox[2] = Math.max(polylineBbox[2], line[lineLength][0]);
  polylineBbox[3] = Math.max(polylineBbox[3], line[lineLength][1]);


  const polyLength = polygon.length;

  for (i = 0, ii = polyLength; i < ii; i++) {
    polygonSet = polygon[i];

    p1 = new Point(polygonSet[0]);
    for (j = 0; j < polygonSet.length - 1; j++) {
      p2 = new Point(polygonSet[j + 1]);
      p1.nextPoint = p2;
      e = new Edge(p1, p2, 'polygon');
      polyEdges.addLast(e);
      p1 = p2;
      
    }
    p2.nextPoint = new Point(polygonSet[0]);
  }
}

class IntersectionPoint {

  constructor(p, edge1, edge2) {
    this.p = p;
    this.polylineEdge = edge1;
    this.polygonEdge = edge2;
    this.visited = false;
    this.startDot = false;
  }

}

function findEdgesWithPossibleIntersections(polyQueue, polylineBbox, nonIntersectingEdge, potentialIntersectingEdges) {
  while (polyQueue.length) {
    const edge = polyQueue.pop();
    edgeIntersectsBbox(edge, polylineBbox) ? potentialIntersectingEdges.push(edge) : nonIntersectingEdge.push(edge); //eslint-disable-line
  }
}

function findIntersectionPoints(potentialIntersectingEdges, lineQueue, intersectingPoints) {
  while (lineQueue.length) {
    const lineEdge = lineQueue.pop();
    for (var i = 0; i < potentialIntersectingEdges.length; i++) {
      const potentialEdge = potentialIntersectingEdges[i];
      if (potentialEdge.maxX < lineEdge.minX || potentialEdge.minX > lineEdge.maxX) continue
      if (potentialEdge.maxY < lineEdge.minY || potentialEdge.minY > lineEdge.maxY) continue
      const intersection = getEdgeIntersection(lineEdge, potentialEdge);
      if (intersection !== null)
        for (var ii = 0; ii < intersection.length; ii++) {
          intersectingPoints.addLast(new IntersectionPoint(intersection[ii], lineEdge, potentialEdge));
        }
    }
  }
}

var EPSILON = 1e-9;

function crossProduct(a, b) {
  return a[0] * b[1] - a[1] * b[0]
}

function dotProduct(a, b) {
  return a[0] * b[0] + a[1] * b[1]
}

function toPoint(p, s, d) {
  return [
    p[0] + s * d[0],
    p[1] + s * d[1]
  ]
}

function getEdgeIntersection(lineEdge, potentialEdge, noEndpointTouch) {
  var va = [lineEdge.p2.p[0] - lineEdge.p1.p[0], lineEdge.p2.p[1] - lineEdge.p1.p[1]];
  var vb = [potentialEdge.p2.p[0] - potentialEdge.p1.p[0], potentialEdge.p2.p[1] - potentialEdge.p1.p[1]];

  var e = [potentialEdge.p1.p[0] - lineEdge.p1.p[0], potentialEdge.p1.p[1] - lineEdge.p1.p[1]];
  var kross    = crossProduct(va, vb);
  var sqrKross = kross * kross;
  var sqrLenA  = dotProduct(va, va);
  var sqrLenB  = dotProduct(vb, vb);

  if (sqrKross > EPSILON * sqrLenA * sqrLenB) {

    var s = crossProduct(e, vb) / kross;
    if (s < 0 || s > 1) return null
    var t = crossProduct(e, va) / kross;
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

  var sqrLenE = dotProduct(e, e);
  kross = crossProduct(e, va);
  sqrKross = kross * kross;

  if (sqrKross > EPSILON * sqrLenA * sqrLenE) return null

  var sa = dotProduct(va, e) / sqrLenA;
  var sb = sa + dotProduct(va, vb) / sqrLenA;
  var smin = Math.min(sa, sb);
  var smax = Math.max(sa, sb);

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

function edgeIntersectsBbox(edge, bbox) {
  if (edge.maxX < bbox[0]) return false
  if (edge.minX > bbox[2]) return false
  if (edge.maxY < bbox[1]) return false
  if (edge.minY > bbox[3]) return false
  return true
}

const TinyQueue = require('tinyqueue');
const ll = require('datastructures-js').linkedList();

const polygonEdgeQueue = new TinyQueue(null, compareEdges);
const lineEdgeQueue = new TinyQueue(null, compareEdges);
const polylineBbox = [Infinity, Infinity, Infinity, Infinity];

function index (polygon, line) {

  // Section 3.1 of paper
  fillQueue(polygon, line, polygonEdgeQueue, lineEdgeQueue, polylineBbox);
  const nonIntersectingEdge = new TinyQueue(null, compareEdges);
  const potentialIntersectingEdges = new TinyQueue(null, compareEdges);
  findEdgesWithPossibleIntersections(polygonEdgeQueue, polylineBbox, nonIntersectingEdge, potentialIntersectingEdges);

  // Section 3.2 of paper
  const potentialIntersectingEdges2 = [];
  while (potentialIntersectingEdges.length) potentialIntersectingEdges2.push(potentialIntersectingEdges.pop());
  findIntersectionPoints(potentialIntersectingEdges2, lineEdgeQueue, ll);

  // Section 3.3 of paper
  const outPolys = [];

  let count = ll.length();
  let ip = ll.head();

  for (var i = 0; i < count; i++) {
    let ipValue = ip.getValue();
    let nextIp, nextIpNode;

    const outPoly = [];
    outPolys.push(outPoly);

    do {
      outPoly.push(ipValue.p);
      ipValue.isVisited = true;

      nextIpNode = ip.getNext();
      nextIp = nextIpNode.getValue();

      if (pointsMatch(outPoly[0], nextIp.p)) {
        outPoly.push(nextIp.p);
        nextIpNode = nextIpNode.getNext();
        nextIp = nextIpNode.getValue();
      }

      let toPlusOne, nextFrom = null;
      if (isEven(i)) {
        toPlusOne = ipValue.polylineEdge.p1;
        nextFrom = nextIp.polylineEdge.p2;
      } else {
        toPlusOne = ipValue.polygonEdge.p2;
        nextFrom = nextIp.polylineEdge.p2;  
      }

      if (!pointsMatch(toPlusOne.p, nextFrom.p)) {
        let stillAdding = true;
        while (stillAdding) {
          outPoly.push(toPlusOne.p);
          console.log(toPlusOne);
          if (toPlusOne.nextPoint === null) stillAdding = false;
        }
      }
      ip = nextIpNode;
    } while (pointsMatch(nextIp.p, outPoly[0]))

    outPoly.push(nextIp.p);
    outPoly.push(outPoly[0]);
    console.log(outPoly);

  }
  return outPolys
}

function isEven(n) {
  return n === 0 || !!(n && !(n % 2));
}

function pointsMatch(p1, p2) {
  return p1[0] === p2[0] && p1[1] === p2[1]
}

module.exports = index;
