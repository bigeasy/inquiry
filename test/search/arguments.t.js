#!/usr/bin/env node

var inquiry = require("../..");
require("proof")(2, function (equal) {
  var object = { firstName: "Abraham", lastName: "Lincoln" };
  equal(inquiry("{$.firstName == $1}")(object, 'Abraham').pop().lastName, 'Lincoln', 'select by property');
  equal(inquiry("{$.firstName == firstName}", [ "firstName" ])(object, 'Abraham').pop().lastName, 'Lincoln', 'select by property');
});
