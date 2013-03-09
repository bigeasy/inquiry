#!/usr/bin/env node

var inquiry = require("../..");
require("proof")(4, function (equal) {
  var object;
  object = { firstName: "Abraham", lastName: "Lincoln" };
  equal(inquiry("[.{$.firstName == 'Abraham'}]")(object).pop().lastName, 'Lincoln', 'select by property');
  equal(inquiry("[{$.firstName == 'Abraham'}]")(object).pop().lastName, 'Lincoln', 'select by property no dot');
  object = require('./presidents');
  equal(inquiry("/presidents[.{$.firstName == 'Abraham'}]")(object).pop().lastName, 'Lincoln', 'select by property many');
  equal(inquiry("/presidents[{$.firstName == 'Abraham'}]")(object).pop().lastName, 'Lincoln', 'select by property many no dot');
});
