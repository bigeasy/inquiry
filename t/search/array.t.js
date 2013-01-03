#!/usr/bin/env node

var inquiry = require('../..');
require("proof")(2, function (equal) {
  var object = require('./presidents');
  equal(inquiry('/presidents/15')(object).pop().lastName, 'Lincoln');
  equal(inquiry('/presidents/lastName')(object)[15], 'Lincoln');
});
