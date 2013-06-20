#!/usr/bin/env node

var inquiry = require("../..");
require("proof")(4, function (equal, ok) {
  var object = { name: "Alan", zero: 0, "null": null };
  equal(inquiry("/name")(object).pop(), "Alan", "select by name");
  equal(inquiry("/zero")(object).pop(), 0, "select zero");
  ok(inquiry("/null")(object).pop() === null, "select null");
  equal(inquiry("/missing")(object).length, 0, "select nothing");
});
