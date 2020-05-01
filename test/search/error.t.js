#!/usr/bin/env node

require("proof")(2, function (equal) {
  var inquiry = require("../..");
  try {
    inquiry(']');
  } catch (e) {
    equal(e.message, 'bad pattern', 'bad path');
  }
  try {
    inquiry('{');
  } catch (e) {
    equal(e.message, 'bad pattern', 'bad predicate');
  }
});
