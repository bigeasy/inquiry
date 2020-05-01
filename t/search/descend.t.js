#!/usr/bin/env node

var inquiry = require("../..");

require("proof")(1, function (assert) {
  var object = { name: "Alan", zero: 0, "null": null };
  var object = {
    items: {
        a: { b: { c: 1 } },
        b: [{ c: 2 }],
        c: 3
    }
  }
  assert(inquiry("/items//c")(object), [ 3, 2, 1 ], "select by name");
});
