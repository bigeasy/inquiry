require("proof")(2, function (equal) {
  var inquiry = require(".."), object;
  object = { "@#$%^&": { ">": 1, "%3E": 0 } };
  equal(inquiry("%40%23%24%25%5E%26/%3E")(object).pop(), 1, 'encoded');
  equal(inquiry("%40%23%24%25%5E%26/%253E")(object).pop(), 0, 'escaped');
});
