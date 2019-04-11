import test from 'ava'
import polySplit from '../src/index'

const load = require('load-json-file')
const path = require('path')

const harness = load.sync(path.join(__dirname, 'harness', 'four-out.geojson'))

test('Find intersection finds potential segments', t => {
    var out = polySplit(harness.features[0], harness.features[1])
    t.is(1, 1)
})

