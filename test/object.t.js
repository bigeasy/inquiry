require("proof")(4, function (assert) {
  var inquiry = require("..");
  var object = { name: "Alan", zero: 0, "null": null };
  assert(inquiry("/name")(object).pop(), "Alan", "select by name");
  assert(inquiry("/zero")(object).pop(), 0, "select zero");
  assert(inquiry("/null")(object).pop() === null, "select null");
  assert(inquiry("/missing")(object).length, 0, "select nothing");
});
