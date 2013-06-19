#!/usr/bin/env node

var inquiry = require("../..");
require("proof")(5, function (equal) {
  var object, result;
  object = { firstName: "Abraham", lastName: "Lincoln" };
  equal(inquiry("{$.firstName == 'Abraham'}")(object).pop().lastName, 'Lincoln', 'rooted');
  object = require('./presidents');
  result = inquiry("/presidents{$.firstName == 'Abraham'}")(object);
  equal(result.length, 1, 'array length');
  equal(result.pop().lastName, 'Lincoln', 'array pop');
  equal(inquiry("/presidents/.{$.firstName == 'Abraham'}")(object).pop().lastName, 'Lincoln', 'array as self');
  equal(inquiry("/presidents/.{$.firstName == 'Abraham'}/lastName")(object).pop(), 'Lincoln', 'array as self');
});
