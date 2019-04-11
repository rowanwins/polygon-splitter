import TinyQueue from 'tinyqueue'
import {checkWhichEventIsLeft} from './compareEvents'

export default class EventQueue {

    constructor () {
        return new TinyQueue([], checkWhichEventIsLeft);
    }

}
