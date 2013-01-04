#!/usr/bin/env node

var inquiry = require("../..");
require("proof")(1, function (equal) {
  var object = { firstName: "Abraham", lastName: "Lincoln" };
  equal(inquiry("{$.firstName = $1}")(object, 'Abraham').pop().lastName, 'Lincoln', 'select by property');
});
