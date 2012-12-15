#!/usr/bin/env node

var inquiry = require("../..");
require("proof")(3, function (equal) {
  var object = { name: "George" };
  equal(inquiry("/n*")(object).pop(), "George", "select by end star");
  equal(inquiry("/n*e")(object).pop(), "George", "select by middle star");
  equal(inquiry("/*e")(object).pop(), "George", "select by start star");
});
