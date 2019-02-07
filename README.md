## polysplit
A small javascript lib for splitting polygons by a polyline.

### API
```js
polyclip(
    , // polygon
    [[-10, 10], [10, 10], [10, -10]]); // polyline
// returns [[[0, 10], [10, 10], [10, 0]]]
```

### Algorithm
This library is an implementation of the approach described in [in the concave-poly-splitter library](https://github.com/geidav/concave-poly-splitter) by David Greer. 

