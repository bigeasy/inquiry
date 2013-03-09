#!/usr/bin/env node

var inquiry = require("../..");
require("proof")(2, function (equal) {
  var object = require('./presidents');
  equal(inquiry("/presidents/14/../15")(object).pop().lastName, 'Lincoln', 'silly example');
  equal(inquiry("/presidents[..{$.lastName == 'Buchannan' && $i == $1 - 1}($i)]")(object).pop().lastName, 'Lincoln', 'predicates');
});
