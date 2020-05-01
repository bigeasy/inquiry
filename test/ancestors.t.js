require("proof")(5, function (equal) {
  var inquiry = require("..");
  var object = require('./presidents'), result;
  result = inquiry("/presidents/../presidents/15")(object);
  equal(result.length, 1, 'array parent count');
  equal(result.pop().lastName, 'Lincoln', 'array parent value');
  result = inquiry("/presidents/14/../15")(object);
  equal(result.length, 1, 'array element parent count');
  equal(result.pop().lastName, 'Lincoln', 'array element parent value');
  equal(inquiry("/presidents[..{$.lastName == 'Buchanan' && $i == $$i - 1}]")(object).pop().lastName, 'Lincoln', 'predicates');
});
