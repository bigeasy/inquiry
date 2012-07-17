<a href="http://www.flickr.com/photos/pjern/5878353945/" title="Information Please by pjern, on Flickr"><img src="http://farm6.staticflickr.com/5234/5878353945_0c07d304fd_b.jpg" width="850" height="566" alt="Information Please"></a>

# Inqury [![Build Status](https://secure.travis-ci.org/bigeasy/inquiry.png?branch=master)](http://travis-ci.org/bigeasy/inquiry)

A micro-JavaScript JSON path language for Node.js and the browser.

```javascript
var $q = require("inqury"), hickory, object =
  { presidents:
  [ { firstName: "George", lastName:"Washington" }
  , { firstName: "John", lastName:"Adams" }
  , { firstName: "Thomas", lastName:"Jefferson" }
  , { firstName: "James", lastName:"Madison" }
  , { firstName: "James", lastName:"Monroe" }
  , { firstName: "John", lastName:"Quincy Adams" }
  , { firstName: "Andrew", lastName:"Jackson" }
  , { firstName: "Martin", lastName:"Van Buren" }
  , { firstName: "William", lastName:"Henry Harrison" }
  , { firstName: "John", lastName:"Tyler" }
  , { firstName: "James", middleInitial:"K", lastName:"Polk" }
  , { firstName: "Zachary", lastName:"Taylor" }
  , { firstName: "Millard", lastName:"Fillmore" }
  , { firstName: "Franklin", lastName:"Pierce" }
  , { firstName: "James", lastName:"Buchanan" }
  , { firstName: "Abraham", lastName:"Lincoln" }
  ]};

hickory = $q('/p*[$.lastName == $1]')(object, "Jackson").pop();

console.log("Found: " hickory.firstName + " " + hickory.lastName);
```

## One Wildcard Per Property

In a path, you're allowed one and only one wildcard represented by a star `*`.
Wildcards help you reach deep into object trees with terse queries.

This query against a verbose data set can be simplified.

```javascript
var instances = $('reservationSet/reservation/instanceSet/instance')(object);
```

A few wildcards and the path is under control, but still readable.

```javascript
var instances = $('r*Set/reservation/i*Set/instance')(object);
```

You're only allowed one wildcard per property name. Wildcards are used to tame
verbosity, not for pattern matching. If you need to perform pattern matching
against property names, use subexpressions.

## Predicates

Square brackets indicate predicates. Each step in the path can include a single
predicate contianing a predicate expression. The predicate expression is simply
a JavaScript expression that is compile to a function.

When a predicate expression is used with an object, it is tested against that
one object. A predicate expression references the current object using the
varaible `$`.

```javascript
var abe = $('[$.firstName == "Lincoln"]')(presidents[15]).pop();
```

When a predicate expression is used with an array, it is tested against all the
members of the array.

```javascript
var abe = $('/presidents[$.lastName == "Lincoln"]')(presidents).pop();
```

A predicate expression references arguments using the special variables `$1`
thorugh `$256`, each variable representing an argument by position. 

```javascript
var abe = $('/presidents[$.lastName == $1]')(presidents, 'Lincoln').pop();
```
A predicate expression can reference the index of an array using the special
variable `$i`.

```javascript
var abe = $('/presidents[$i == 15]')(presidents).pop();
```

### Arrays

Arrays are a special case. When we visit an array, if the path step is all
digits, we simply use that path step as an index.

```javascript
equal( $('/presidents/15')(presidents).pop().lastName, 'Lincoln' );
```

If it is not all digits, we assume that we want to gather visit the property for
every element in the array. This gathers values into the result array.

```javascript
equal( $('/presidents/lastName')(presidents)[15], 'Lincoln' );
```

## Sub-Queries

**TODO** Not yet implemented.

Sub-queries can be pricy, but not as expensive as you might think.

```javascript
var abe = $('/presidents[$(..[$i == $$i - 1]).lastName == "Buchanan"]')(presidents).pop();
```

Or maybe...

```javascript
var abe = $('/presidents[$('../' + ($i - 1)).lastName == "Buchanan"]')(presidents).pop();
```

Latter is simplier and can still take advantage of once a visit.

The above shows some of the goals of the language.

 * Match property names using a "starts with" operator "+", to help keep
   patterns terse.
 * Full JavaScript evaluation in conditionals.
 * Parameterization so that patterns do not have to be created through
   catenation, making them unreadable.
 * Easy implementation as MicroJS.

Rather than attempting to map CSS selectors or XPath to JSON, I'd like to create
a new little language and utility for queries against larger JSON documents.

## Change Log

Changes for each release.

### Version 0.0.0 -  Thu Jun 28 15:16:23 UTC 2012

 * Select property by name. #1.
