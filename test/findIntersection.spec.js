import test from 'ava'
import {fillQueue} from '../src/fillQueue'
import {compareEdges} from '../src/compareEdges'
import {findEdgesWithPossibleIntersections, findIntersectionPoints} from '../src/findIntersections'

const load = require('load-json-file')
const path = require('path')
const TinyQueue = require('tinyqueue')
const ll = require('datastructures-js').linkedList()

const polyqueue = new TinyQueue(null, compareEdges)
const linequeue = new TinyQueue(null, compareEdges)
const polylineBbox = [Infinity, Infinity, -Infinity, -Infinity]
const nonIntersectingEdge = []
const potentialIntersectingEdge = []


const harness = load.sync(path.join(__dirname, 'harness', 'diamond.geojson'))

fillQueue(
  harness.features[0].geometry.coordinates,
  harness.features[1].geometry.coordinates,
  polyqueue,
  linequeue,
  polylineBbox
)

findEdgesWithPossibleIntersections(polyqueue, polylineBbox, nonIntersectingEdge, potentialIntersectingEdge)

test('Find intersection finds potential segments', t => {
  t.is(nonIntersectingEdge.length, 2)
  t.is(potentialIntersectingEdge.length, 2)
})

findIntersectionPoints(potentialIntersectingEdge, linequeue, ll)

test('Find intersecting segments', t => {
  t.is(ll._count, 2)
})
