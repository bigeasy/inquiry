#!/usr/bin/env node

var inquiry = require("../.."), object;
require("proof")(2, function (equal) {
  object = { "don't you love punctuation?": { "yes!": 1, "no": 0 } };
  equal(inquiry("/don't you love punctuation?/yes!")(object).pop(), 1, 'punctuated');
  object = { "forward/slash": { "curly{brace": 1, "square[bracket": 2 } };
  equal(inquiry('/forward`/slash/curly`{brace')(object).pop(), 1, 'escaped');
});
