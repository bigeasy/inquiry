<a href="http://www.flickr.com/photos/pjern/5878353945/" title="Information Please by pjern, on Flickr"><img src="http://farm6.staticflickr.com/5234/5878353945_0c07d304fd_b.jpg" width="850" height="566" alt="Information Please"></a>

# Inqury [![Build Status](https://secure.travis-ci.org/bigeasy/inquiry.png?branch=master)](http://travis-ci.org/bigeasy/inquiry) [![Coverage Status](https://coveralls.io/repos/bigeasy/inquiry/badge.png?branch=master)](https://coveralls.io/r/bigeasy/inquiry) [![NPM version](https://badge.fury.io/js/inquiry.png)](http://badge.fury.io/js/inquiry)

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

hickory = $q('/p*{$.lastName == $1}')(object, "Jackson").pop();

console.log("Found: " hickory.firstName + " " + hickory.lastName);
```

## Paths

Paths are forward slash delimited. The path part begins right after the slash
and ends at the first unescaped forward slash, open square bracket, open curly
brace; `/`, `` [ ``, `{`.

```javascript
var abe = $q('/presidents/16/firstName')(presidents).pop();
```

This allows you to put most things in your paths, you only need to escape the
aforementioned terminators, a period `.` if it appears at the start of the path
part, the asterisk `` * ``, and the percent sign `%` which I'm reserving for a
JSON pointer implementation.

```javascript
var object = { "don't you love punctuation?": { "yes!": 1, "no": 0 } };
var yes = $q("/don't you love punctuation?/yes!")(object).pop();
```

Escape using a backtick `` ` ``. We use a backtick and not a backslash, because
then you'd have to double those backslashes up in a JavaScript string, which
would lead to [leaning toothpick
syndrome](http://en.wikipedia.org/wiki/Leaning_toothpick_syndrome).

```javascript
var object = { "forward/slash": { "curly{brace": 1, "square[bracket": 2 } };
var a = $q('/forward`/slash/curly`{brace')(object).pop();
```

Paths can have a dot `.` for self refernece and two dots `..` to reference the
parent just like file paths. Below is a silly example. Parent paths are more
useful in predicates and sub-queries.

```javascript
var abe = $q('/presidents/./15/../16/firstName')(presidents).pop();
```

## One Wildcard Per Property

In a path, you're allowed one and only one wildcard represented by a star
`` * ``.

Wildcards help to make verbose queries terse.

```javascript
var instances = $('reservationSet/reservation/instanceSet/instance')(object);
```

A few wildcards and the path is under control, but still readable.

```javascript
var instances = $('r*Set/reservation/i*Set/instance')(object);
```

You're only allowed one wildcard per property name. Wildcards are used to tame
verbosity, not for pattern matching. There is no good way to pattern match
against property names in inquiry. You're expected to know the structure of the
JSON you're querying.

## JSON Pointer

You can also [JSON
pointer](http://tools.ietf.org/html/draft-pbryan-zyp-json-pointer-02) which is
simply URL encoded path parts.

```javascript
var object = { "@#$%^&": { ">": 0, "%3E": 1 } };
equal($q("%40%23%24%25%5E%26/%3E")(object).pop(), 0, 'encoded');
equal($q("%40%23%24%25%5E%26/`%3E")(object).pop(), 1, 'escaped encoding');
```

I imagine this might be helpful if you want to add paths to URLs, but I've not
found a use case in the wild. If you do find, one [drop me a
line](https://github.com/bigeasy/inquiry/issues/12).

## Predicates

Curly braces indicate predicates. Each step in the path can include a single
predicate contianing a predicate expression. The predicate expression is simply
a JavaScript expression that is compiled to a function that returns a boolean.

A predicate expression references the current object using the varaible `$`.

```javascript
var abe = $('{$.firstName == "Lincoln"}')(presidents[15]).pop();
```

When a predicate expression is used with an array, it is tested against all the
members of the array.

```javascript
var abe = $('/presidents{$.lastName == "Lincoln"}')(presidents).pop();
```

A predicate expression references arguments using the special variables `$1`
through `$256`, each variable representing an argument by position.

```javascript
var abe = $('/presidents{$.lastName == $1}')(presidents, 'Lincoln').pop();
```
A predicate expression can reference the index of an array using the special
variable `$i`.

```javascript
var abe = $('/presidents{$i == 15}')(presidents).pop();
```

## Arrays

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

Square brackets define sub-queries. Sub-queries are evaluated against the
current object or against each object in an array if current object is an array.

A sub-query is evaluated as a predicate. If the sub-query matches one or more
objects in the object context, the predicate is true for the current object.

```javascript
var instance = $('/instances[tag{$.key = "name" && $.value = $1}]')(instances, "server").pop();
```

**TODO**: Going back up is not yet implemented. Read past this bit.

```javascript
var abe = $('/presidents[..{$i == $$i - 1}].lastName == "Buchanan"]')(presidents).pop();
```

Or maybe...

```javascript
var abe = $('/presidents[$('../' + ($i - 1)).lastName == "Buchanan"]')(presidents).pop();
```

Also...

```javascript
var abe = $('/presidents[$(..[$i == $1], $i - 1).lastName == "Buchanan"]')(presidents).pop();
var abe = $('/presidents[..{$i == $1 && $.lastName == "Buchanan"}]')(presidents).pop();
```

But, that is a scan, when it can be an index, so...

```javascript
var abe = $('/presidents[$(../$1, $i - 1).lastName == "Buchanan"]')(presidents).pop();
```

But, `$1` is very much a valid path identifier. Quote it? Certinaly, JSON path
will escape the dollar sign.

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

### Version 0.0.2

 * Test coverage with Istanbul and Coveralls.
 * Use `in` operator instead of comparing to `undefined`. #30.
 * Apply self operator `.` to arrays. #31.
 * Implement JSON pointer.
 * Fix select `null` and zero. #29.
 * Escape special characters. #20.
 * Implement parent `..` operator. #27.
 * Implement sub-queries. #15.
 * Apply wildcards after an array. #22.
 * Update `t/sizes` minification report for Bash 3.0. #23.
 * Added `.js` suffix to test file names. #24.
 * Apply predicate to every member of array. #21.

### Version 0.0.1

Released: Sun Jul 22 19:47:59 UTC 2012.

 * Path passes through all elements in array. #18.
 * Select array element by index. #17.
 * Implement arguments. #11.
 * Select by wildcard. #10.
 * Build on Windows. #9.
 * Build on Travis CI. #5.
 * Upgrade to Proof 0.0.15. #8. #6.
 * Convert to a function compiler. #7.
 * Return an array always. #3.

### Version 0.0.0

Released: Thu Jun 28 15:16:23 UTC 2012.

 * Select property by name. #1.
