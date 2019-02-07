import test from 'ava'
import polySplit from '../src/index'

const load = require('load-json-file')
const path = require('path')
const isClockwise = require('@turf/boolean-clockwise').default

const harness = load.sync(path.join(__dirname, 'harness', 'four-out.geojson'))
const output = load.sync(path.join(__dirname, 'harness', 'outputs', 'four-out.geojson'))

test('Find intersection finds potential segments', t => {
  var out = polySplit(harness.features[0].geometry.coordinates, harness.features[1].geometry.coordinates)
  t.deepEqual(out, output)
  t.is(1, 1)
})

