#!/usr/bin/env node

require("proof")(34, function (assert) {
  var $q = require("../.."), object = require('./presidents'), result;

  var hickory = $q('/p*{$.lastName == $1}')(object, "Jackson").pop();
  assert(hickory.lastName, 'Jackson', 'old hickory');
  var abe = $q('/presidents/15/firstName')(object).pop();
  assert(abe, 'Abraham', 'paths');
  var abe = $q('presidents/15/firstName')(object).pop();
  assert(abe, 'Abraham', 'paths');

  ! function () {
    var abe = $q('presidents/14/../15/./firstName')(object).pop();
    assert(abe, 'Abraham', 'self and parent');
  } ()

  ! function () {
    var object = { "forward/slash": { "curly{brace": 1, "square[bracket": 2 } };
    var a = $q('"forward/slash"/"curly{brace"')(object).pop();
    assert(a, 1, 'escape');
  } ()

  ! function () {
    var object = { "don't you love punctuation?": { 'yes!': 1, 'no': 0 } };
    var yes = $q("don't you love punctuation?/yes!")(object).pop();
    assert(yes, 1, 'punctuation');
  } ()

  ! function () {
    var abe = $q('                        \
        presidents / 15 / firstName       \
    ')(object).pop();
    assert(abe == 'Abraham', 'clarity')
  } ()

  ! function () {
    var object = { ' a ': { 'b': 1 } };
    assert($q(' " a " / b ')(object).pop(), 1, 'quote space');
  } ()

  ! function () {
    var object = { '\na\n': { 'b': 1 } };
    assert($q(' "\\na\\n" / b ')(object).pop(), 1, 'quote new lines');
  } ()

  ! function () {
    var object = { '"a"': { 'b': 1 } };
    assert($q(' ' + JSON.stringify('"a"') + ' / b ')(object).pop(), 1, 'JSON.stringify part');
  } ()

  ! function () {
    var firstNameByLastName = $q('presidents{$.lastName == $1}/firstName');

    assert(firstNameByLastName(object, 'Lincoln').pop() == 'Abraham', 'invocation one');
    assert(firstNameByLastName(object, 'Washington').pop() == 'George', 'invocation two');

    var abe = $q('presidents{$.lastName == $1}/firstName')(object, 'Lincoln');
    assert(abe == 'Abraham', 'invocation three');
  } ()

  ! function () {
    var object = { "@#$%^&": { ">": 0, "%3E": 1 } };
    assert($q("%40%23%24%25%5E%26/%3E")(object).pop(), 0, 'encoded');
    assert($q("%40%23%24%25%5E%26/%253E")(object).pop(), 1, 'escaped encoding');
  } ()

  ! function () {
    assert( $q('presidents/15')(object).pop().lastName == 'Lincoln', 'index' );
    assert( $q('presidents/lastName')(object)[15] == 'Lincoln', 'map' );
    assert( $q('lastName')(object.presidents).shift() == 'Washington', 'against array' );
    assert( $q('15/lastName')(object.presidents).shift() == 'Lincoln', 'against array element' );
  } ()

  ! function () {
    var abe = $q('{$.lastName == "Lincoln"}')(object.presidents[15]).pop();
    assert(abe.lastName, 'Lincoln', 'JavaScript against object');
    abe = $q('presidents{$.lastName == "Lincoln"}')(object).pop();
    assert(abe.lastName, 'Lincoln', 'JavaScript against array');
    abe = $q('presidents{$.lastName == $1}')(object, 'Lincoln').pop();
    assert(abe.lastName, 'Lincoln', 'JavaScript arguments');
    abe = $q('presidents!{$.lastName != "Lincoln"}')(object).pop();
    assert(abe.lastName, 'Lincoln', 'JavaScript negated');
    abe = $q('presidents{$i == 15}')(object).pop();
    assert(abe.lastName, 'Lincoln', 'JavaScript index');
    abe = $q('{$i == 15}')(object.presidents).pop();
    assert(abe.lastName, 'Lincoln', 'JavaScript index');
  } ()

  var datacenter = {
    instances: [{
      id: 1,
      running: true,
      tags: [{
        key: 'name', value: 'server'
      }, {
        key: 'arch', value: 'i386'
      }]
    }, {
      id: 2,
      tags: [{
        key: 'name', value: 'balancer'
      }, {
        key: 'arch', value: 'x86_64'
      }]
    }, {
      id: 3,
      running: true,
      tags: []
    }]
  };

  ! function () {
    var tagged = $q('instances[tags/key]')(datacenter);
    assert(tagged.length == 2, 'tagged');
  } ()

  ! function () {
    var server = $q('instances[tags{$.key == "name" && $.value == $1}]')(datacenter, 'server').pop();
    assert(server.id, 1, 'nest JavaScript in sub-query');
    var tags = $q('instances/tags[../../running]')(datacenter);
    assert(tags.length == 4, 'parent');
  } ()

  ! function () {
    var dup = $q('presidents[..{$.firstName == $$.firstName && $i != $$i}]')(object);
    assert(dup.length == 7, 'reference outer context length');
    assert(dup[dup.length - 1].firstName = 'James', 'referece outer context');
  } ()

  ! function () {
    var uniq = $q('presidents![..{$.firstName == $$.firstName && $i != $$i}]')(object);
    assert(uniq.length == 9, 'negated reference outer context length');
    assert(uniq[uniq.length - 1].firstName == 'Abraham', 'negated reference outer context');
  } ()

  ! function () {
    var uniq = $q('![..{$.firstName == $$.firstName && $i != $$i}]')(object.presidents);
    assert(uniq.length == 9, 'negated reference outer context against array length');
    assert(uniq[uniq.length - 1].firstName == 'Abraham',
       'negated reference outer context against array length');
  } ()
});
