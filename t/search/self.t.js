#!/usr/bin/env node

var inquiry = require("../..");
require("proof")(2, function (equal) {
  var object = require('./presidents');
  equal(inquiry("/presidents/./15")(object).pop().lastName, 'Lincoln', 'single dot');
  equal(inquiry("/presidents/./15/.")(object).pop().lastName, 'Lincoln', 'dot at end');
});
