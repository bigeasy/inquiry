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

Inquiry is a **tiny** library that can perform **complex** searches on
complicated **nested** collections JavaScript object graphs. 

Inquiry is a **functional** library that builds a reusable JavaScript function
from a path expression.

The path expression language supports **parameters**, **expressions**, and
**sub-queries**. 

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

## Invocation

**Now that you have a notion of what a path looks like, let's talk about
invocation.**

Inquiry is a function compiler. Inquiry compiles a path expression into a
JavaScript function.

```javascript
var $q = require('inquiry');

var firstNameByLastName = $q('/presidents{$.lastName = $1}/firstName');

ok(byLastName(presidents, 'Lincoln').pop() == 'Abraham');
ok(firstNames(presidents, 'Washington').shift() == 'George');
```

Inquiry is all functional like that. You can then call that JavaScript function
however many times you'd like. You can pass the function to another function as
a parameter.

However, the Inquiry compiler is quick enough that you can simply compile and
invoke in a one liner.

```javascript
var $q = require('inquiry');

var abe = $q('/presidents{$.lastName = $1}/firstName')(presidents, 'Lincoln');
ok(abe == 'Abraham');
```

## One Wildcard Per Property

In a path, you're allowed one and only one wildcard represented by a star
`` * ``.

Wildcards help to make verbose queries terse.

```javascript
var instances = $q('reservationSet/reservation/instanceSet/instance')(object);
```

A few wildcards and the path is under control, but still readable.

```javascript
var instances = $q('r*Set/reservation/i*Set/instance')(object);
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

## Arrays

Arrays are a special case. When we visit an array, if the path step is all
digits, we simply use that path step as an index.

```javascript
ok( $q('/presidents/15')(presidents).pop().lastName == 'Lincoln' );
```

If it is not all digits, we assume that we want to gather visit the property for
every element in the array. This gathers values into the result array.

```javascript
ok( $q('/presidents/lastName')(presidents)[15] == 'Lincoln' );
```

## JavaScript Predicates

Curly braces indicate JavaScript
[predicates](http://stackoverflow.com/questions/3230944/what-does-predicate-mean-in-the-context-of-computer-science).
A JavaScript predicate is simply a JavaScript expression that is compiled to a
function that returns a boolean. If the JavaScript expression that evaluates to
`true`, the path is included in the result set.

Each step in the path can include a single JavaScript predicate.

A predicate expression references the current object using the varaible `$`.

```javascript
var abe = $q('{$.firstName == "Lincoln"}')(presidents[15]).pop();
```

When a predicate expression is used with an array, it is tested against all the
members of the array.

```javascript
var abe = $q('/presidents{$.lastName == "Lincoln"}')(presidents).pop();
```

A predicate expression references arguments using the special variables `$1`
through `$256`, each variable representing an argument by position.

```javascript
var abe = $q('/presidents{$.lastName == $1}')(presidents, 'Lincoln').pop();
```

You can negate a JavaScript predicate using an exclamation point `!`.

```javascript
var abe = $q('/presidents!{$.lastName != $1}')(presidents, 'Lincoln').pop();
```

A predicate expression can reference the index of an array using the special
variable `$i`.

```javascript
var abe = $q('/presidents{$i == 15}')(presidents).pop();
```

You can also pass parameters into JavaScript predicates. If parameters are
passed into the JavaScript predicate, the variables `$1` through `$256` are
overwritten to hold the values for the scope of the JavaScript predicate.

```javascript
var abe = $q('/predicates{$1 == $2}($.lastName, $1)')(presidents, 'Lincoln').pop();
```

This scoping is not useful by itself, but it is quite useful in constructing
complicated sub-query predicates.

## Sub-Query Predicates

Square brackets define sub-query 
[predicates](http://stackoverflow.com/questions/3230944/what-does-predicate-mean-in-the-context-of-computer-science).
A sub-query predicate is a query that is performed in the context of each
object that matches the path, current object or against each object in an array
if the object that matches the path is an array. If the sub-query returns any
objects at all, the predicate is considered true and the object matches.

```javascript
var instances = [{
  id: 1,
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
  tags: []
}];
var tagged = $q('/instances[tags/name]')(instances, "server");
ok(tagged.length == 2);
```

In the above, for each `instance` the sub-query looks for `tags/name`. This
matches any of the `instance` objects who's `tags` array has an object with a
`name` property, regardless of value. 

You can nest JavaScript predicates inside sub-query predicates.

```javascript
var server = $q('/instances[tags{$.name == $1}]')(instances, 'server').pop();
```

In the above, for each `instance` object we look in the `tags` array for a
`name` property with the value "server."

## Parents and Siblings in Sub-Queries

You can use parent operator `..` to compare against a parent in a sub-query
predicate, or multiple parent operators `../..` to compare against other
ancestors. It's just like `..` in file paths.

When comparing against parents and siblings you're going to want to used a
parameterized JavaScript predicate to capture values in the current context into
a new scope. **(At the time of writing, I can't think of a meaningful example
that uses the parent `..` operator without also using a parameterized JavaScript
predicate. Suggestions are welcome.)**

Here we look for any president that shares a first name with any another president.

```javascript
var dup = $q('/presidents[..{$.lastName == $1 && $i != $2}($.firstName, $i)]')(presidents).pop();
ok(dup.length == 7);
ok(dup[dup.length - 1].firstName = 'James');
```

Here we look for a president that does not share a first name with any other
president.

```javascript
var uniq = $q('/presidents[..!{$.lastName == $1 && $i != $2}($.firstName, $i)]')(presidents).pop();
ok(uniq.length == 9);
ok(uniq[uniq.length - 1].firstName = 'Abraham');
```

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
