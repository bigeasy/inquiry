#!/usr/bin/env node

var inquiry = require("../..");
require("proof")(1, function (equal) {
  var object = require('./presidents');
  equal(inquiry("/presidents[..{$.lastName == 'Buchannan' && $i == $1 - 1}($i)]")(object).pop().lastName, 'Lincoln', 'select by property');
});
