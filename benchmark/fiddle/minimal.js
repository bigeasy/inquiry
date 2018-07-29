var inquiry = require('..')
var Benchmark = require('benchmark')
var assert = require('assert')

var suite = new Benchmark.Suite('async', { /*minSamples: 100*/ })

var object = require('../t/search/presidents')

var q = inquiry('/presidents/3')

function inq (object) {
    return q(object).shift()
}

function raw (object) {
    return object.presidents[3]
}

for (var i = 1; i <= 4; i++)  {
    suite.add({
        name: 'inquiry ' + i,
        fn: function () {
            assert(inq(object).lastName, 'Madison')
        }
    })

    suite.add({
        name: 'raw ' + i,
        fn: function () {
            assert(raw(object).lastName, 'Madison')
        }
    })
}

suite.on('cycle', function(event) {
    console.log(String(event.target));
})

suite.on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
})

suite.run()
