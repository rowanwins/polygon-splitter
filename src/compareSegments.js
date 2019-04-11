import {signedArea} from './utils'
import {checkWhichEventIsLeft} from './compareEvents'

export function compareSegments(seg1, seg2) {
    if (seg1 === seg2) return 0

    if (signedArea(seg1.leftSweepEvent, seg1.rightSweepEvent, seg2.leftSweepEvent) !== 0 ||
        signedArea(seg1.leftSweepEvent, seg1.rightSweepEvent, seg2.rightSweepEvent) !== 0) {

        // If the segments share their left endpoints
        // use the right endpoint to sort
        if (seg1.leftSweepEvent.isSamePoint(seg2.leftSweepEvent)) return seg1.leftSweepEvent.isBelow(seg2.rightSweepEvent) ? -1 : 1;

        // If the segments have different left endpoints
        // use the left endpoint to sort
        if (seg1.leftSweepEvent.x === seg2.leftSweepEvent.x) return seg1.leftSweepEvent.y < seg2.leftSweepEvent.y  ? -1 : 1;

        // If the line segment associated to e1 been inserted
        // into S after the line segment associated to e2 ?
        if (checkWhichEventIsLeft(seg1.leftSweepEvent, seg2.leftSweepEvent) === 1) return seg2.leftSweepEvent.isAbove(seg1.leftSweepEvent) ? -1 : 1;

        // The line segment associated to e2 has been inserted
        // into S after the line segment associated to e1
        return seg1.leftSweepEvent.isBelow(seg2.leftSweepEvent) ? -1 : 1;
    }

    return checkWhichEventIsLeft(seg1.leftSweepEvent, seg2.leftSweepEvent) === 1 ? 1 : -1;

}
