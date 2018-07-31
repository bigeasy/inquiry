var inquiry = require('../..')
var Benchmark = require('benchmark')
var assert = require('assert')
var Evaluator = require('prolific.evaluator')

var suite = new Benchmark.Suite('async', { /*minSamples: 100*/ })

var object = require('../../t/search/presidents')

var q = inquiry('/presidents/3')

var w = inquiry('>{ $.presidents[3] }')

var e = Evaluator.create('$.presidents[3]')

function inq (object) {
    return q(object).shift()
}

function transform (object) {
    return w(object).shift()
}

function evaluator (object) {
    return e(object)
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
        name: 'transform ' + i,
        fn: function () {
            assert(transform(object).lastName, 'Madison')
        }
    })

    suite.add({
        name: 'evaluator ' + i,
        fn: function () {
            assert(evaluator({ json: object }).lastName, 'Madison')
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
