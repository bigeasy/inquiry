require("proof")(3, function (assert) {
  var inquiry = require('..');
  var object = require('./presidents');
  assert(inquiry('/presidents/15')(object).pop().lastName, 'Lincoln');
  assert(inquiry('/presidents/lastName')(object)[15], 'Lincoln');
  object = {
    items: [ [ { name: 'a', value: 1 }, { name: 'b', value: 2 } ],
             [ { name: 'a', value: 3 }, { name: 'b', value: 4 } ] ]
  }
  assert(inquiry('/items{$.name == "b"}/value')(object), [ 2, 4 ], 'nested arrays');
});
