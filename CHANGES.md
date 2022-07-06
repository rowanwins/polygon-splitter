# 0.0.11
- Fix up some handling for those rings (outer and holes) that aren't intersected by the split line.
- Add output geojson validation for test files

# 0.0.10
- Fix up packaging of dependencies

# 0.0.9
- Fix another infinite loop case with holes back to outer ring

# 0.0.8
- Fix bug with finding the first intersection

# 0.0.7
- Fix bug on constructing outputs, resolves issue #8
- Add more tests related to testing winding order of inputs

# 0.0.6
- Fix bug on constructing outputs, resolves issue #7
- Add more tests related to testing winding order of inputs

# 0.0.5
- Fix result if there is no intersections
- Fix small bug when walking output

# 0.0.4
- Fix multipolygon output structure
- Ensure dist files are ES5 compatible

# 0.0.3
- Major enhancements to algorithm getting it to a functional state
