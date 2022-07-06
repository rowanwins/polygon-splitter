import test from 'ava'
import load from 'load-json-file'
import write from 'write-json-file'
import path from 'path'
import fs from 'fs'
import glob from 'glob'
import rewind from '@turf/rewind'
import GeojsonEquality from 'geojson-equality'
import polySplit from '../src/index'
import {check} from '@placemarkio/check-geojson'

const directories = {
  in: path.join(__dirname, 'harness', 'in') + path.sep,
  out: path.join(__dirname, 'harness', 'out') + path.sep
}

const files = glob.sync(`${directories.in}/*.geojson`, {})

const fixtures = files.map(filename => {
  const parsed = path.parse(filename)
  return {
    filename: parsed.base,
    name: parsed.name,
    geojson: load.sync(filename)
  }
})

test('Check outputs E2E', t => {
  fixtures.forEach(fixture => {
    var out = polySplit(fixture.geojson.features[0], fixture.geojson.features[1])

    try {
      check(JSON.stringify(out))
      t.pass(`Valid geojson generated - ${fixture.name}`)
    } catch (e) {
      t.fail(`Invalid geojson generated - ${fixture.name}`)
    }

    if (process.env.REGEN) write.sync(path.join(directories.out, fixture.filename), out)
    t.deepEqual(out, load.sync(directories.out + fixture.filename), fixture.name)
    t.deepEqual(out.geometry.coordinates.length, fixture.geojson.features[0].properties.expected)
  })
})

test('Check outputs E2E - winding on poly', t => {
  fixtures.forEach(fixture => {
    var out = polySplit(rewind(fixture.geojson.features[0]), fixture.geojson.features[1])

    t.deepEqual(out, load.sync(directories.out + fixture.filename), fixture.name)
    t.deepEqual(out.geometry.coordinates.length, fixture.geojson.features[0].properties.expected)
  })
})


test('Check outputs E2E - winding on line', t => {
  const qe = new GeojsonEquality({direction: false, precision: 5})

  fixtures.forEach(fixture => {
    var out = polySplit(fixture.geojson.features[0], rewind(fixture.geojson.features[1]))
    const res = qe.compare(out, load.sync(directories.out + fixture.filename))
    t.true(res, fixture.name)
    t.deepEqual(out.geometry.coordinates.length, fixture.geojson.features[0].properties.expected)
  })
})

test('Check outputs E2E - winding on line reversed', t => {
  const qe = new GeojsonEquality({direction: false, precision: 5})

  fixtures.forEach(fixture => {
    var out = polySplit(fixture.geojson.features[0], rewind(fixture.geojson.features[1], {
      reverse: true
    }))
    const res = qe.compare(out, load.sync(directories.out + fixture.filename))
    t.true(res, fixture.name)
    t.deepEqual(out.geometry.coordinates.length, fixture.geojson.features[0].properties.expected)
  })
})


test('Check outputs E2E - winding on both', t => {
  const qe = new GeojsonEquality({direction: false, precision: 5})

  fixtures.forEach(fixture => {
    var out = polySplit(rewind(fixture.geojson.features[0]), rewind(fixture.geojson.features[1]))
    const res = qe.compare(out, load.sync(directories.out + fixture.filename))
    t.true(res, fixture.name)
    t.deepEqual(out.geometry.coordinates.length, fixture.geojson.features[0].properties.expected)
  })
})
