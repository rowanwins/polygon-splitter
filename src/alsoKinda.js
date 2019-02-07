    if (i === 1) {
      toPlusOne = nextValue.polygonEdge.p2
      do {
        outPoly.push(toPlusOne.p)
        toPlusOne = toPlusOne.nextPoint.p
      } while (pointsMatch(nextValue.p, outPoly[outPoly.length - 1]))
      outPoly.push(nextValue.p)

      toPlusOne = ipValue.polylineEdge.p2
      do {
        outPoly.push(toPlusOne.p)
        toPlusOne = toPlusOne.nextPoint.p
      } while (!pointsMatch(toPlusOne, nextValue.polylineEdge.p2.p))

    } else if (i === numberOutPolygons) { // if it's the last we only support one segment
      let outP = ipValue.polygonEdge.p1
      do {
        outPoly.push(outP.p)
        outP = outP.prevPoint
      } while (!pointsMatch(nextValue.polygonEdge.p2.p, outP.p))
      outPoly.push(nextValue.polygonEdge.p2.p)
      outPoly.push(nextValue.p)
      toPlusOne = nextValue.polylineEdge.p2
      do {
        outPoly.push(toPlusOne.p)
        toPlusOne = toPlusOne.nextPoint
      } while (!pointsMatch(toPlusOne.p, ipValue.polylineEdge.p2.p))
    }