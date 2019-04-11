import EventQueue from './EventQueue'
import Sweepline from './Sweepline'

import {fillEventQueue} from './fillQueue'

import {debugEventAndSegments, debugEventAndSegment} from './debug'

export default function polygonSplit (polygon, polyline) {

    const intersectingPoints = []

    const eventQueue = new EventQueue()

    fillEventQueue(polygon, eventQueue)

    const sweepLine = new Sweepline();

    let currentSegment = null

    while (eventQueue.length) {
        const event = eventQueue.pop();

        debugEventAndSegments(event, sweepLine)

        if (event.isLeftEndpoint) {
            currentSegment = sweepLine.addSegment(event)

            debugEventAndSegment(event, currentSegment)

            const ipWithSegAbove = sweepLine.testIntersect(currentSegment, currentSegment.segmentAbove)
            if (ipWithSegAbove !== false) {
                if (options.booleanOnly) return false
                intersectingPoints.push(ipWithSegAbove)
            }

            const ipWithSegBelow = sweepLine.testIntersect(currentSegment, currentSegment.segmentBelow)
            if (ipWithSegBelow) {
                if (options.booleanOnly) return false
                intersectingPoints.push(ipWithSegBelow)
            }
        } else {

            debugEventAndSegment(event, event.segment)

            const ipWithSegBelow = sweepLine.testIntersect(event.segment.segmentAbove, event.segment.segmentBelow)
            if (ipWithSegBelow) {
                if (options.booleanOnly) return false
                intersectingPoints.push(ipWithSegBelow)
            }
            sweepLine.removeSegmentFromSweepline(event.segment)
        }
    }
    if (options.booleanOnly) return true
    return intersectingPoints
}
