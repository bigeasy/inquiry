#!/usr/bin/env node

var inquiry = require("../../index");
require("proof")(1, function (equal) {
  var object = { name: "Alan" };
  equal(inquiry(object, "/name"), "Alan", "select by name");
});
