var Suite = require('benchmark').Suite
var polysplit = require('./dist/polysplit')

new Suite('Single Segment')
  .add('kwc', () => {
    polysplit()
  })
  .on('cycle', function (event) {
    console.log(event.target.toString())
  })
  .on('error', function (e) {
    throw e.target.error
  })
  .on('complete', function () {
    console.log('- Fastest is ' + this.filter('fastest').map('name') + '\n')
  })
  .run({'async': true})
