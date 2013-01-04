#!/usr/bin/env node

var inquiry = require("../..");
require("proof")(2, function (equal) {
  var object;
  object = { firstName: "Abraham", lastName: "Lincoln" };
  equal(inquiry("[.{$.firstName = 'Abraham'}]")(object).pop().lastName, 'Lincoln', 'select by property');
  object = require('./presidents');
  equal(inquiry("/presidents[.{$.firstName = 'Abraham'}]")(object).pop().lastName, 'Lincoln', 'select by property');
});
