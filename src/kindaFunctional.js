  for (var i = 0; i < numberOutPolygons; i++) {
    if (outPolys.length === 1) {
      ip = ll.head()
    }
    let ipValue = ip.getValue()
    let nextIp, nextIpNode

    let outPoly = []
    let ii = i
    do {
      ipValue = ip.getValue()
      outPoly.push(ipValue.p)

      ipValue.isVisited = true
      nextIpNode = ip.getNext()
      nextIp = nextIpNode.getValue()

      if (pointsMatch(outPoly[0], nextIp.p)) {
        outPoly.push(nextIp.p)
        nextIpNode = nextIpNode.getNext()
        nextIp = nextIpNode.getValue()
      }
      let toPlusOne, nextFrom
      if (ii % 2 === 0) {
        toPlusOne = ipValue.polylineEdge.p1.nextPoint
        nextFrom = nextIp.polylineEdge.p1
      } else {
        toPlusOne = ipValue.polygonEdge.p1
        nextFrom = nextIp.polygonEdge.p2
      }
      // console.log(ipValue.p, toPlusOne.p, nextFrom.p)
      do {
        outPoly.push(toPlusOne.p)
        toPlusOne = toPlusOne.nextPoint
        if (toPlusOne === null) {
          break
        }
      } while (!pointsMatch(outPoly[outPoly.length - 1], nextFrom.p))
      ip = nextIpNode
      ii = ii + 1
    } while (pointsMatch(nextIp.p, outPoly[0]) || nextIpNode.getNext() !== null)
    outPoly.push(nextIp.p)

    let finalVertices = []
    if (i === 0) {
      let next = ll.head().getValue().polygonEdge.p2
      do {
        // console.log('NEXT', next.p)
        finalVertices.push(next.p)
        next = next.nextPoint
        if (next === null) break
      } while (!pointsMatch(next, nextIp.polygonEdge.p2))
      finalVertices.push(next.p)
    } else {
      let next = ipValue.polylineEdge.p2
      do {
        finalVertices.push(next.p)
        next = next.nextPoint
        if (next === null) break
      } while (!pointsMatch(next,  ipValue.polylineEdge.p1))
    }

    outPoly = outPoly.concat(finalVertices.reverse())
    outPoly.push(outPoly[0])
    outPolys.push(outPoly)
    // console.log(outPoly)
  }