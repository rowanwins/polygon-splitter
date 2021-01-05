## polygon-splitter
A small (<10kb minified) javascript library for splitting geojson polygons by a polyline.

Works with
- Concave polygons
- Polygons with holes
- Single & Multi-part geometries

### Install
````
npm install polygon-splitter
````

### API
Accepts either a geojson `Feature` or `Geometry` (inc `MultiPolygon` and `MultiLineString`).

```js
import polygonSplitter from 'polygon-splitter'
// or
const polygonSplitter = require('polygon-splitter')

const polygon = {
    "type": "Polygon",
    "coordinates": [[[0, 0],[10, -10], [20, 0], [10, 10], [0, 0]]]
}

const polyline = {
    "type": "LineString",
    "coordinates": [[20, 10], [5, 0], [20, -10]]
}
const output = polygonSplitter(polygon, polyline)
```

### Performance

Splitting a polygon with a hole into 4 pieces.
Compared with an approach [outlined here](http://kuanbutts.com/2020/07/07/subdivide-polygon-with-linestring/), and also another [one described here](https://gis.stackexchange.com/a/344277)
````
polygon-splitter x 228,391 ops/sec ±0.63% (88 runs sampled)
alternate approach x 2,052 ops/sec ±3.60% (78 runs sampled)
alternate approach 2 x 900 ops/sec ±3.60% (78 runs sampled)
````

### Describing the algorithm
This is basically my own implementation of this algorithm. If you're interested in the details it's probably best to read to the source code.
Some key points of understanding
- Each intersection point will be used in two output polygons so we'll need to keep track of how many times we visit each intersection point in constructing the output
- The algorithm works by switching back and forth walking along the polyline and polygon to collect an output polygon
- An output polygon must contain at least one stretch from the linestring, and at least one stretch from the polgon, but it might also contain many, so we'll use a while loop to just keep going till we get back to the start
- For each intersection point we mark whether the polyline is heading into the polygon or not, this is helpful for knowing which we need to walk the polyline in constructing the output (eg it could be backwards or forwards).


### Acknowledgements
Thanks to mourner for the most excellent [robust-predicates library](https://github.com/mourner/robust-predicates).

Thanks for my employer [FrontierSI](http://frontiersi.com.au/) for freeing up some of my time to finish off this algorithm.