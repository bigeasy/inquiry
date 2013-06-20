#!/usr/bin/env node

var inquiry = require("../..");
require("proof")(6, function (equal) {
  var object;
  object = { firstName: "Abraham", lastName: "Lincoln" };
  equal(inquiry("[.{$.firstName == 'Abraham'}]")(object).pop().lastName, 'Lincoln', 'select by property');
  equal(inquiry("[{$.firstName == 'Abraham'}]")(object).pop().lastName, 'Lincoln', 'select by property no dot');
  object = require('./presidents');
  equal(inquiry("/presidents[.{$.firstName == 'Andrew'}]")(object).pop().lastName, 'Jackson', 'select by property many');
  equal(inquiry("/presidents[{$.firstName == 'Andrew'}]")(object).pop().lastName, 'Jackson', 'select by property many no dot');
  equal(inquiry("/presidents[{$.firstName == 'Andrew'}]/lastName")(object).pop(), 'Jackson', 'select by property many no dot continue');
  equal(inquiry("/presidents[{$.firstName == 'Horatio'}]")(object).length, 0, 'select by property many no dot continue');
});
