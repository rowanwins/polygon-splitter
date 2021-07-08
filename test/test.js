import test from 'ava'
import load from 'load-json-file'
import write from 'write-json-file'
import path from 'path'
import fs from 'fs'

import polySplit from '../src/index'

const directories = {
  in: path.join(__dirname, 'harness', 'in') + path.sep,
  out: path.join(__dirname, 'harness', 'out') + path.sep
}

const fixtures = fs.readdirSync(directories.in).map(filename => {
  return {
    filename,
    name: path.parse(filename).name,
    geojson: load.sync(path.join(directories.in, filename))
  }
})

test('Find intersection finds potential segments', t => {
  fixtures.forEach(fixture => {
    var out = polySplit(fixture.geojson.features[0], fixture.geojson.features[1])

    if (process.env.REGEN) write.sync(path.join(directories.out, fixture.filename), out)

    t.deepEqual(out, load.sync(directories.out + fixture.filename), fixture.name)
  })
})

