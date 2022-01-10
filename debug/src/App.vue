<template>
  <div id="map"></div>
</template>

<script>
import data from '../../test/harness/in/zigzag.geojson'
import splitPoly from '../../src/index'

import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import marker2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import rewind from '@turf/rewind'

// Hack to get the markers into Vue correctly
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: marker2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
})

let map = null
let buffered = null
export default {
  name: 'app',
  mounted () {
    
    const layer = L.geoJSON(data, {
      weight: 10,
      fillOpacity: 0,
    })

    let map = window.map = L.map('map', {
      crs: L.CRS.Simple
    }).fitBounds(layer.getBounds())  

    layer.addTo(map)

    const poly = rewind(data.features[0])
    const line = rewind(data.features[1])
    // const line = data.features[1]

    const out = splitPoly(poly, line)
    L.geoJSON(out, {
      fillOpacity: 0.2,
      weight: 3,
      color: '#1bfa06'
    }).addTo(map)

  },
  methods: {

  }
}
</script>

<style>
    html, body, #app, .ivu-col, #map {
      height: 100%;
      margin: 0px;
    }
    .sidebar{
      padding: 50px;
    }
  .leaflet-div-icon {
    border: 2px solid;
    border-radius:  60%;
  }

  .leaflet-marker-icon .number{
    position: relative;
    top: 4px;
    font-size: 12px;
    width: 2 6px;
    height: 2 6px;
    text-align: center;
  }
</style>
