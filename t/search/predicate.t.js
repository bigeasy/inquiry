#!/usr/bin/env node

var inquiry = require("../..");
require("proof")(4, function (equal) {
  var object;
  object = { firstName: "Abraham", lastName: "Lincoln" };
  equal(inquiry("{$.firstName == 'Abraham'}")(object).pop().lastName, 'Lincoln', 'rooted');
  object = require('./presidents');
  equal(inquiry("/presidents{$.firstName == 'Abraham'}")(object).pop().lastName, 'Lincoln', 'array');
  equal(inquiry("/presidents/.{$.firstName == 'Abraham'}")(object).pop().lastName, 'Lincoln', 'array as self');
  equal(inquiry("/presidents/.{$.firstName == 'Abraham'}/lastName")(object).pop(), 'Lincoln', 'array as self');
});
