var Suite = require('benchmark').Suite
var polygonsplitter = require('./dist/polygonsplitter')
const loadJsonFile = require('load-json-file')
const path = require('path')
const turf = require('@turf/turf')

const fixture = loadJsonFile.sync(path.join(__dirname, 'test', 'harness', 'in', 'new-test.geojson'))

new Suite('Benchmark')
  .add('polygon-splitter', () => {
    polygonsplitter(fixture.features[0], fixture.features[1])
  })
  // .add('alternate-approach', () => {
  //   alernateApproach(fixture.features[0], fixture.features[1])
  // })
  .add('alternate-approach-2', () => {
    polygonCut(fixture.features[0].geometry, fixture.features[1].geometry)
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

function polygonCut(polygon, line, idPrefix) {
  const THICK_LINE_UNITS = 'kilometers'
  const THICK_LINE_WIDTH = 0.001
  var i, j, id, intersectPoints, lineCoords, forCut, forSelect
  var thickLineString, thickLinePolygon, clipped, polyg, intersect
  var polyCoords = []
  var cutPolyGeoms = []
  var cutFeatures = []
  var offsetLine = []
  var retVal = null

  if (((polygon.type !== 'Polygon') && (polygon.type !== 'MultiPolygon')) || (line.type !== 'LineString')) {
    return retVal
  }

  if (typeof idPrefix  === 'undefined') {
    idPrefix = ''
  }

  intersectPoints = turf.lineIntersect(polygon, line)
  if (intersectPoints.features.length === 0) {
    return retVal
  }

  lineCoords = turf.getCoords(line)
  if ((turf.booleanWithin(turf.point(lineCoords[0]), polygon) ||
      (turf.booleanWithin(turf.point(lineCoords[lineCoords.length - 1]), polygon)))) {
    return retVal
  }

  offsetLine[0] = turf.lineOffset(line, THICK_LINE_WIDTH, {units: THICK_LINE_UNITS})
  offsetLine[1] = turf.lineOffset(line, -THICK_LINE_WIDTH, {units: THICK_LINE_UNITS})

  for (i = 0; i <= 1; i++) {
    forCut = i
    forSelect = (i + 1) % 2
    polyCoords = []
    for (j = 0; j < line.coordinates.length; j++) {
      polyCoords.push(line.coordinates[j])
    }
    for (j = (offsetLine[forCut].geometry.coordinates.length - 1); j >= 0; j--) {
      polyCoords.push(offsetLine[forCut].geometry.coordinates[j])
    }
    polyCoords.push(line.coordinates[0])

    thickLineString = turf.lineString(polyCoords)
    thickLinePolygon = turf.lineToPolygon(thickLineString)
    clipped = turf.difference(polygon, thickLinePolygon)

    cutPolyGeoms = []
    for (j = 0; j < clipped.geometry.coordinates.length; j++) {
      polyg = turf.polygon(clipped.geometry.coordinates[j])
      intersect = turf.lineIntersect(polyg, offsetLine[forSelect])
      if (intersect.features.length > 0) {
        cutPolyGeoms.push(polyg.geometry.coordinates)
      }
    }

    cutPolyGeoms.forEach(function (geometry, index) {
      id = idPrefix + (i + 1) + '.' +  (index + 1)
      cutFeatures.push(turf.polygon(geometry, {id: id}))
    })
  }

  if (cutFeatures.length > 0) retVal = turf.featureCollection(cutFeatures)

  return retVal
}
