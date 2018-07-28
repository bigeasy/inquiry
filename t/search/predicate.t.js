#!/usr/bin/env node

var inquiry = require("../..");
require("proof")(11, function (equal) {
  var object, result;
  object = { firstName: "Abraham", lastName: "Lincoln" };
  equal(inquiry("{$.firstName == 'Abraham'}")(object).pop().lastName, 'Lincoln', 'rooted');
  object = require('./presidents');
  result = inquiry("/presidents{$.firstName == 'Abraham'}")(object);
  equal(result.length, 1, 'array length');
  equal(result.pop().lastName, 'Lincoln', 'array pop');
  result = inquiry("/presidents!{$.firstName == 'Abraham'}")(object);
  equal(result.length, 15, 'negate length');
  equal(result.pop().lastName, 'Buchanan', 'negate pop');
  equal(inquiry("/presidents/.{$.firstName == 'Abraham'}")(object).pop().lastName, 'Lincoln', 'array as self');
  equal(inquiry("/presidents/.{$.firstName == 'Abraham'}/lastName")(object).pop(), 'Lincoln', 'array as self');
  equal(inquiry("/presidents{$.firstName == 'Abraham'}{$1($.lastName)}")(object, function (lastName) {
    equal(lastName, 'Lincoln', 'called');
    return true;
  }).pop().lastName, 'Lincoln', 'multiple predicates');
  equal(inquiry("/ presidents { $.firstName == 'Abraham' } { $1($.lastName) }")(object, function (lastName) {
    equal(lastName, 'Lincoln', 'called');
    return true;
  }).pop().lastName, 'Lincoln', 'multiple predicates spaced');
});
