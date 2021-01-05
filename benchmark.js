var Suite = require('benchmark').Suite
var polygonsplit = require('./dist/polygonsplit')
const loadJsonFile = require('load-json-file')
const path = require('path')
const turf = require('@turf/turf')

const fixture = loadJsonFile.sync(path.join(__dirname, 'test', 'harness', 'in', 'new-test.geojson'))

new Suite('Benchmark')
  .add('polygonsplit', () => {
    polygonsplit(fixture.features[0], fixture.features[1])
  })
  .add('alternate-approach', () => {
    alernateApproach(fixture.features[0], fixture.features[1])
  })
  .on('cycle', function (event) {
    console.log(event.target.toString())
  })
  .on('error', function (e) {
    throw e.target.error
  })
  .run({'async': true})


function alernateApproach(poly, line) {
  const polyAsLine = turf.polygonToLine(poly)
  const unionedLines = turf.union(polyAsLine, line)
  const polygonized = turf.polygonize(unionedLines)
  polygonized['features'].filter(ea => 
    turf.booleanPointInPolygon(turf.pointOnFeature(ea), poly)
  )
}
