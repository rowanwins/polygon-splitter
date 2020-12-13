import test from 'ava'
import {fillQueue} from '../src/fillQueue'
import {compareEdges} from '../src/compareEdges'

const load = require('load-json-file')
const path = require('path')
const TinyQueue = require('tinyqueue')

const polyqueue = new TinyQueue(null, compareEdges)
const polylineBbox = [Infinity, Infinity, -Infinity, -Infinity]
const lineEdges = []
const polyEdges = []
const harness = load.sync(path.join(__dirname, 'harness', 'diamond.geojson'))

fillQueue(
  harness.features[0].geometry.coordinates,
  harness.features[1].geometry.coordinates,
  polyEdges,
  lineEdges,
  polylineBbox,
  polyqueue
)

test('Fill Queue sorts polygon segments correctly', t => {
  t.is(polyqueue.length, 4)

  const firstSeg = polyqueue.pop()
  t.deepEqual(firstSeg.p1.p, [0, 0])
  t.deepEqual(firstSeg.p2.p, [10, -10])

  const secondSeg = polyqueue.pop()
  t.deepEqual(secondSeg.p1.p, [10, 10])
  t.deepEqual(secondSeg.p2.p, [0, 0])
})

test('Fill queue sorts polyline segments correctly', t => {
  t.is(lineEdges.length, 2)
})

test('Bounding Box of line is correct', t => {
  t.deepEqual(polylineBbox, [15, -10, 20, 10])
})
