#!/usr/bin/env node

var inquiry = require("../..");
require("proof")(3, function (equal) {
  var object = require('./presidents');
  equal(inquiry("/presidents/./15")(object).pop().lastName, 'Lincoln', 'single dot');
  equal(inquiry("/presidents/./15/.")(object).pop().lastName, 'Lincoln', 'dot at end');
  equal(inquiry("/ presidents / . / 15 / . ")(object).pop().lastName, 'Lincoln', 'dot at end spaced');
});
