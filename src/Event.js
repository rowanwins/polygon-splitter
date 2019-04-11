import {signedArea} from './utils'

export default class Event {

    constructor (coords) {
        this.x = coords[0]
        this.y = coords[1]

        this.otherEvent = null
        this.isLeftEndpoint = null
        this.segment = null
    }

    isOtherEndOfSegment(eventToCheck) {
        return this === eventToCheck.otherEvent
    }

    isSamePoint(eventToCheck) {
        return this.x === eventToCheck.x && this.y === eventToCheck.y
    }

    isBelow (p) {
        return this.isLeftEndpoint ?
            signedArea(this, this.otherEvent, p) > 0 :
            signedArea(this.otherEvent, p, this) > 0
    }

    isAbove (p) {
        return !this.isBelow(p);
    }
}

