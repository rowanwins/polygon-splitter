(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.polysplit = factory());
}(this, (function () { 'use strict';

    var tinyqueue = TinyQueue;
    var _default = TinyQueue;

    function TinyQueue(data, compare) {
        if (!(this instanceof TinyQueue)) return new TinyQueue(data, compare);

        this.data = data || [];
        this.length = this.data.length;
        this.compare = compare || defaultCompare;

        if (this.length > 0) {
            for (var i = (this.length >> 1) - 1; i >= 0; i--) this._down(i);
        }
    }

    function defaultCompare(a, b) {
        return a < b ? -1 : a > b ? 1 : 0;
    }

    TinyQueue.prototype = {

        push: function (item) {
            this.data.push(item);
            this.length++;
            this._up(this.length - 1);
        },

        pop: function () {
            if (this.length === 0) return undefined;

            var top = this.data[0];
            this.length--;

            if (this.length > 0) {
                this.data[0] = this.data[this.length];
                this._down(0);
            }
            this.data.pop();

            return top;
        },

        peek: function () {
            return this.data[0];
        },

        _up: function (pos) {
            var data = this.data;
            var compare = this.compare;
            var item = data[pos];

            while (pos > 0) {
                var parent = (pos - 1) >> 1;
                var current = data[parent];
                if (compare(item, current) >= 0) break;
                data[pos] = current;
                pos = parent;
            }

            data[pos] = item;
        },

        _down: function (pos) {
            var data = this.data;
            var compare = this.compare;
            var halfLength = this.length >> 1;
            var item = data[pos];

            while (pos < halfLength) {
                var left = (pos << 1) + 1;
                var right = left + 1;
                var best = data[left];

                if (right < this.length && compare(data[right], best) < 0) {
                    left = right;
                    best = data[right];
                }
                if (compare(best, item) >= 0) break;

                data[pos] = best;
                pos = left;
            }

            data[pos] = item;
        }
    };
    tinyqueue.default = _default;

    function compareEdges(edge1, edge2) {
      if (edge1.minX > edge2.minX) return 1
      if (edge1.minX < edge2.minX) return -1

      if (edge1.minY > edge2.minY) return 1
      if (edge1.minY < edge2.minY) return -1
      return 1
    }

    class Edge {

      constructor(p1, p2, edgeType, index) {
        this.p1 = p1;
        this.p2 = p2;
        this.edgeType = edgeType;
        this.originalIndex = index;

        this.minX = Math.min(p1.p[0], p2.p[0]);
        this.minY = Math.min(p1.p[1], p2.p[1]);

        this.maxX = Math.max(p1.p[0], p2.p[0]);
        this.maxY = Math.max(p1.p[1], p2.p[1]);

        this.intersectionPoints = [];
      }

    }

    class Point {

      constructor(p) {
        this.p = p;
        this.nextPoint = null;
        this.prevPoint = null;
        this.visited = false;

        this.intersectionPoints = [];
      }
    }

    function fillQueue(polygon, line, polyEdges, lineEdges, polylineBbox, polygonEdgeQueue) {
      var i, ii, j, polygonSet, p1, p2, e = null;

      const linegeom = line.type === 'Feature' ? line.geometry : line;

      let linecoords = linegeom.coordinates;
      const lineLength = linecoords.length - 1;

      p1 = new Point(linecoords[0]);
      for (i = 0; i < lineLength; i++) {
        p2 = new Point(linecoords[i + 1]);
        p1.nextPoint = p2;
        p2.prevPoint = p1;
        lineEdges.push(new Edge(p1, p2, 'polyline', i));

        polylineBbox[0] = Math.min(polylineBbox[0], p1.p[0]);
        polylineBbox[1] = Math.min(polylineBbox[1], p1.p[1]);
        polylineBbox[2] = Math.max(polylineBbox[2], p1.p[0]);
        polylineBbox[3] = Math.max(polylineBbox[3], p1.p[1]);

        p1 = p2;
      }

      polylineBbox[0] = Math.min(polylineBbox[0], linecoords[lineLength][0]);
      polylineBbox[1] = Math.min(polylineBbox[1], linecoords[lineLength][1]);
      polylineBbox[2] = Math.max(polylineBbox[2], linecoords[lineLength][0]);
      polylineBbox[3] = Math.max(polylineBbox[3], linecoords[lineLength][1]);

      const polygeom = polygon.type === 'Feature' ? polygon.geometry : polygon;

      let polycoords = polygeom.coordinates;

      const polyLength = polycoords.length;

      for (i = 0, ii = polyLength; i < ii; i++) {
        polygonSet = polycoords[i];
        const tempArray = [];
        p1 = new Point(polygonSet[0]);
        tempArray.push(p1);

        for (j = 1; j < polygonSet.length; j++) {
          p2 = new Point(polygonSet[j]);
          p1.nextPoint = p2;
          p2.prevPoint = p1;

          e = new Edge(p1, p2, 'polygon', j - 1);
          e.intersectPolylineBbox = edgeIntersectsBbox(e, polylineBbox);
          polyEdges.push(e);
          polygonEdgeQueue.push(e);

          p1 = p2;
        }
        e = new Edge(p1, tempArray[0], 'polygon', j - 1);
        e.intersectPolylineBbox = edgeIntersectsBbox(e, polylineBbox);
        polyEdges.push(e);
        polygonEdgeQueue.push(e);

        p2.nextPoint = tempArray[0];
        tempArray[0].prevPoint = p2.prevPoint;
      }
    }

    function edgeIntersectsBbox(edge, bbox) {
      if (edge.maxX < bbox[0]) return false
      if (edge.minX > bbox[2]) return false
      if (edge.maxY < bbox[1]) return false
      if (edge.minY > bbox[3]) return false
      return true
    }

    let ip = 0;

    class IntersectionPoint {

      constructor(p, edge1, edge2) {
        this.p = p;
        this.polylineEdge = edge1;
        this.polygonEdge = edge2;
        this.isPolylineHeadingIn = isEven(ip);
        this.visited = false;
        this.pair = null;
        this.ip = ip;
        ip = ip + 1;

        this.polygonEdge.intersectionPoints.push(this);
      }
    }

    function isEven(n) {
      return n % 2 === 0
    }

    function findIntersectionPoints(polygonEdges, lineEdges, intersectingPoints) {
      let i, ii, iii;
      let count = lineEdges.length;
      let polyCount = polygonEdges.length;

      for (i = 0; i < count; i++) {
        let lineEdge = lineEdges[i];
        for (ii = 0; ii < polyCount; ii++) {
          const potentialEdge = polygonEdges[ii];
          if (!potentialEdge.intersectPolylineBbox) continue

          if (potentialEdge.maxX < lineEdge.minX || potentialEdge.minX > lineEdge.maxX) continue
          if (potentialEdge.maxY < lineEdge.minY || potentialEdge.minY > lineEdge.maxY) continue
          const intersection = getEdgeIntersection(lineEdge, potentialEdge);
          if (intersection !== null) {
            for (iii = 0; iii < intersection.length; iii++) {
              var ip = new IntersectionPoint(intersection[iii], lineEdge, potentialEdge);
              intersectingPoints.push(ip);

            }
          }
        }
      }

    }

    var EPSILON = 1e-9;

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

    function getEdgeIntersection(lineEdge, potentialEdge, noEndpointTouch) {
      var va = [lineEdge.p2.p[0] - lineEdge.p1.p[0], lineEdge.p2.p[1] - lineEdge.p1.p[1]];
      var vb = [potentialEdge.p2.p[0] - potentialEdge.p1.p[0], potentialEdge.p2.p[1] - potentialEdge.p1.p[1]];

      var e = [potentialEdge.p1.p[0] - lineEdge.p1.p[0], potentialEdge.p1.p[1] - lineEdge.p1.p[1]];
      var kross = crossProduct(va, vb);
      var sqrKross = kross * kross;
      var sqrLenA  = dotProduct(va, va);
      var sqrLenB  = dotProduct(vb, vb);

      if (sqrKross > 0) {

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

    function index (polygon, line) {
      const intersections = [];
      const polygonEdges = [];
      const polylineEdges = [];
      const polygonEdgeQueue = new tinyqueue(null, compareEdges);
      const polylineBbox = [Infinity, Infinity, Infinity, Infinity];

      fillQueue(polygon, line, polygonEdges, polylineEdges, polylineBbox, polygonEdgeQueue);

      const sortedPolygonEdges = [];
      while (polygonEdgeQueue.length) sortedPolygonEdges.push(polygonEdgeQueue.pop());

      findIntersectionPoints(polygonEdges, polylineEdges, intersections);

      for (var i = 0; i < intersections.length; i++) {
        if (i % 2 === 0) intersections[i].pair = intersections[i + 1];
        else intersections[i].pair = intersections[i - 1];
      }

      let outPoly = [];
      const outPolys = [outPoly];

      const crossbackMap = new Map();

      for (let index = 0; index < polygonEdges.length; index++) {
        const edge = polygonEdges[index];
        const firstPoint = edge.p1;
        outPoly.push(firstPoint.p);

        if (edge.intersectionPoints.length > 0) {
          edge.intersectionPoints.forEach(function (firstIntersection) {
            outPoly.push(firstIntersection.p);
            const pair = firstIntersection.pair;

            crossbackMap.set(pair.polygonEdge.originalIndex, {
              usedIn: outPoly
            });

            if (crossbackMap.has(firstIntersection.polygonEdge.originalIndex)) {
              const m = crossbackMap.get(firstIntersection.polygonEdge.originalIndex);
              outPoly = m.usedIn;

              if (firstIntersection.isPolylineHeadingIn) {
                let linePoint = firstIntersection.polylineEdge.p2;
                const target = pair.polylineEdge.p1;
                addLinePointsForwards(linePoint, target, outPoly);
              } else {
                let linePoint = firstIntersection.polylineEdge.p1;
                const target = pair.polylineEdge.p2;
                addLinePointsBackwards(linePoint, target, outPoly);
              }
            } else {
              const newOutPoly = [];
              outPolys.push(newOutPoly);
              outPoly = newOutPoly;
              outPoly.push(pair.p);

              if (firstIntersection.isPolylineHeadingIn) {
                let linePoint = firstIntersection.polylineEdge.p2;
                const target = pair.polylineEdge.p1;
                addLinePointsForwards(linePoint, target, outPoly);
              } else {
                let linePoint = firstIntersection.polylineEdge.p1;
                const target = pair.polylineEdge.p2;
                addLinePointsBackwards(linePoint, target, outPoly);
              }
            }
            outPoly.push(firstIntersection.p);
          });
        }
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

    function addLinePointsForwards (linePoint, target, outPoly) {
      let condition = linePoint === target;
      while (condition) {
        outPoly.push(linePoint.p);
        linePoint = linePoint.nextPoint;
        if (linePoint === null) condition = false;
        else if (linePoint !== target) condition = false;
      }
    }

    function addLinePointsBackwards (linePoint, target, outPoly) {
      let condition = linePoint === target;
      while (condition) {
        outPoly.push(linePoint.p);
        linePoint = linePoint.prevPoint;
        if (linePoint === null) condition = false;
        else if (linePoint !== target) condition = false;
      }
    }

    return index;

})));
