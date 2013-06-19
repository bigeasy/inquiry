#!/usr/bin/env node

require("proof")(1, function (ok) {
  global.window = {};
  require('../..');
  ok(typeof window.inquiry == 'function', 'window');
  delete global.window;
});
