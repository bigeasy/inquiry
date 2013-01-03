#!/usr/bin/env node

var inquiry = require("../..");
require("proof")(4, function (equal) {
  var object = { name: "George" };
  equal(inquiry("/n*")(object).pop(), "George", "select by end star");
  equal(inquiry("/n*e")(object).pop(), "George", "select by middle star");
  equal(inquiry("/*e")(object).pop(), "George", "select by start star");
  equal(inquiry('/presidents/l*')(require('./presidents'))[15], 'Lincoln');
});
