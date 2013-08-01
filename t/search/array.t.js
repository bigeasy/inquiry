#!/usr/bin/env node

var inquiry = require('../..');
require("proof")(3, function (equal, deepEqual) {
  var object = require('./presidents');
  equal(inquiry('/presidents/15')(object).pop().lastName, 'Lincoln');
  equal(inquiry('/presidents/lastName')(object)[15], 'Lincoln');
  object = {
    items: [ [ { name: 'a', value: 1 }, { name: 'b', value: 2 } ],
             [ { name: 'a', value: 3 }, { name: 'b', value: 4 } ] ]
  }
  deepEqual(inquiry('/items{$.name == "b"}/value')(object), [ 2, 4 ], 'nested arrays');
});
