export function _debugIntersectionPoints(points) {
  if (process.env.NODE_ENV !== 'development') return
  const map = window.map
  console.log(points)
  const pLayerGroup = L.layerGroup([]).addTo(map)
  L.NumberedDivIcon = createNumberDiv()

  points.forEach(function (p, index) {
    L.marker([p.p[1], p.p[0]], {
      icon: new L.NumberedDivIcon({
        number: index.toString()
      })
    }).addTo(pLayerGroup)
  })
  // debugger
  pLayerGroup.remove()
}

export function _debugFillSection(startPoint, endPoint, fillPoint) {
  if (process.env.NODE_ENV !== 'development') return
  const map = window.map
  const pLayerGroup = L.layerGroup([]).addTo(map)
  L.circleMarker([startPoint.p[1], startPoint.p[0]], {
    color: 'green'
  }).addTo(pLayerGroup)

  L.circleMarker([endPoint.p[1], endPoint.p[0]], {
    color: 'red'
  }).addTo(pLayerGroup)

  L.circleMarker([fillPoint.p[1], fillPoint.p[0]]).addTo(pLayerGroup)
  debugger
  pLayerGroup.remove()
}

function createNumberDiv() {
  return L.Icon.extend({
    options: {
      number: '',
      iconSize: new L.Point(25, 25),
      className: 'leaflet-div-icon'
    },
    createIcon: function () {
      var div = document.createElement('div')
      var numdiv = document.createElement('div')
      numdiv.setAttribute('class', 'number')
      numdiv.innerHTML = this.options['number'] || ''
      div.appendChild(numdiv)
      this._setIconStyles(div, 'icon')
      return div
    }
  })
}
