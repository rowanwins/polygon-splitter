import SplayTree from 'splaytree'
import Segment from './Segment'
import {compareSegments} from './compareSegments'

export default class SweepLine {
    constructor () {
        this.tree = new SplayTree(compareSegments)
    }

    addSegment (event) {
        const seg = new Segment(event)
        const node = this.tree.insert(seg)
        const nextNode = this.tree.next(node)
        const prevNode = this.tree.prev(node)
        if (nextNode !== null) {
            seg.segmentAbove = nextNode.key
            seg.segmentAbove.segmentBelow = seg
        }
        if (prevNode !== null) {
            seg.segmentBelow = prevNode.key
            seg.segmentBelow.segmentAbove = seg
        }
        return node.key
    }

    findSegment (seg) {
        const node = this.tree.find(seg)
        if (node === null) return null
        return node.key
    }

    removeSegmentFromSweepline (seg) {
        const node = this.tree.find(seg)
        if (node === null) return
        const nextNode = this.tree.next(node)
        const prevNode = this.tree.prev(node)

        if (nextNode !== null) {
            const nextSeg = nextNode.key
            nextSeg.segmentBelow = seg.segmentBelow
        }
        if (prevNode !== null) {
            const prevSeg = prevNode.key
            prevSeg.segmentAbove = seg.segmentAbove
        }
        this.tree.remove(seg)
    }

    testIntersect (seg1, seg2) {
        if (seg1 === null || seg2 === null) return false

        if (seg1.rightSweepEvent.isSamePoint(seg2.leftSweepEvent) ||
            seg1.rightSweepEvent.isSamePoint(seg2.rightSweepEvent) ||
            seg1.leftSweepEvent.isSamePoint(seg2.leftSweepEvent) ||
            seg1.leftSweepEvent.isSamePoint(seg2.rightSweepEvent)) return false

        const x1 = seg1.leftSweepEvent.x
        const y1 = seg1.leftSweepEvent.y
        const x2 = seg1.rightSweepEvent.x
        const y2 = seg1.rightSweepEvent.y
        const x3 = seg2.leftSweepEvent.x
        const y3 = seg2.leftSweepEvent.y
        const x4 = seg2.rightSweepEvent.x
        const y4 = seg2.rightSweepEvent.y

        const denom = ((y4 - y3) * (x2 - x1)) - ((x4 - x3) * (y2 - y1))
        const numeA = ((x4 - x3) * (y1 - y3)) - ((y4 - y3) * (x1 - x3))
        const numeB = ((x2 - x1) * (y1 - y3)) - ((y2 - y1) * (x1 - x3))

        if (denom === 0) {
            if (numeA === 0 && numeB === 0) return false
            return false
        }

        const uA = numeA / denom
        const uB = numeB / denom

        if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
            const x = x1 + (uA * (x2 - x1))
            const y = y1 + (uA * (y2 - y1))
            return {x, y}
        }
        return false
    }
}
