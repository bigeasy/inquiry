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

Inquiry is a **tiny** library, under 1k minified and gzipped, that can perform
**complex** searches on complicated **nested** collections JavaScript object
graphs.

Inquiry is a **functional** library that builds a reusable JavaScript function
from a path expression.

The path expression language supports **parameters**, **expressions**, and
**sub-queries**.

Get yourself one.

```
$ npm install inquiry
```

## Getting Help

If you have a general question or need help, [please ask
me under the release discusssion](https://github.com/bigeasy/inquiry/issues/2),
it's a make shift forum.

If you have a bug or other issue please open a new issue.

One of the goals of Inquiry is to be tiny, so let's talk before submitting pull
requests for new features. I enjoy being able to say it is less than 1k.

## Paths

Paths are forward slash delimited. The path part begins right after the slash
and ends at the first unescaped forward slash, open square bracket, open curly
brace; `/`, `` [ ``, `{`.

```javascript
var abe = $q('/presidents/15/firstName')(object).pop();
```

The initial slash is optional. Paths always begin at the root object.

```javascript
var abe = $q('presidents/15/firstName')(object).pop();
```

This allows you to put most things in your paths, you only need to escape the
aforementioned terminators, a period `.` if it appears at the start of the path
part, the asterisk `` * ``, and the percent sign `%` which I'm reserving for a
JSON pointer implementation.

```javascript
var object = { "don't you love punctuation?": { "yes!": 1, "no": 0 } };
var yes = $q("don't you love punctuation?/yes!")(object).pop();
```

Escape using a backtick `` ` ``. We use a backtick and not a backslash, because
then you'd have to double those backslashes up in a JavaScript string, which
would lead to [leaning toothpick
syndrome](http://en.wikipedia.org/wiki/Leaning_toothpick_syndrome).

```javascript
var object = { "forward/slash": { "curly{brace": 1, "square[bracket": 2 } };
var a = $q('forward`/slash/curly`{brace')(object).pop();
```

Paths can have a dot `.` for self refernece and two dots `..` to reference the
parent just like file paths. Below is a silly example. Parent paths are more
useful in predicates and sub-queries.

```javascript
var abe = $q('presidents/14/../15/./firstName')(object).pop();
```

## Invocation

**Now that you have a notion of what a path looks like, let's talk about
invocation.**

Inquiry is a function compiler. Inquiry compiles a path expression into a
JavaScript function.

```javascript
var $q = require('inquiry');

var firstNameByLastName = $q('presidents{$.lastName = $1}/firstName');

ok(byLastName(object, 'Lincoln').pop() == 'Abraham');
ok(firstNames(object, 'Washington').pop() == 'George');
```

Inquiry is all functional like that. You can then call that JavaScript function
however many times you'd like. You can pass the function to another function as
a parameter.

However, the Inquiry compiler is quick enough that you can simply compile and
invoke in a one liner.

```javascript
var $q = require('inquiry');

var abe = $q('presidents{$.lastName == $1}/firstName')(object, 'Lincoln');
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
ok( $q('presidents/15')(object).pop().lastName == 'Lincoln' );
```

If it is not all digits, we assume that we want to gather the property for every
element in the array. This gathers values into the result array.

```javascript
ok( $q('presidents/lastName')(object)[15] == 'Lincoln' );
```

You can, of course, invoke Inquiry against an array directly. The path will be
applied to each element in the array.

```javascript
ok( $q('lastName')(object.presidents).shift() == 'Washington' );
ok( $q('15/lastName')(object.presidents).shift() == 'Lincoln' );
```

Note that we **do not** use brackets `[]` to indicate an array element. Brackets
are used to define sub-query predicates.

## JavaScript Predicates

Curly braces indicate JavaScript
[predicates](http://stackoverflow.com/questions/3230944/what-does-predicate-mean-in-the-context-of-computer-science).
A JavaScript predicate is simply a JavaScript expression that is compiled to a
function that returns a boolean. If the JavaScript expression that evaluates to
`true`, the path is included in the result set.

Each step in the path can include a single JavaScript predicate.

A predicate expression references the current object using the varaible `$`.

```javascript
var abe = $q('{$.lastName == "Lincoln"}')(object.presidents[15]).pop();
```

When a predicate expression is used with an array, it is tested against all the
members of the array.

```javascript
var abe = $q('presidents{$.lastName == "Lincoln"}')(object).pop();
```

A predicate expression references arguments using the special variables `$1`
through `$256`, each variable representing an argument by position.

```javascript
var abe = $q('presidents{$.lastName == $1}')(object, 'Lincoln').pop();
```

You can negate a JavaScript predicate using an exclamation point `!`.

```javascript
var abe = $q('presidents!{$.lastName != "Lincoln"}')(object).pop();
```

A predicate expression can reference the index of an array using the special
variable `$i`.

```javascript
var abe = $q('presidents{$i == 15}')(object).pop();
```

When you invoke Inquiry directly against an array, you apply a JavaScript
predicate by defining it immediately.

```javascript
var abe = $q('{$i == 15}')(object.presidents).pop();
```

## Sub-Query Predicates

Square brackets define sub-query
[predicates](http://stackoverflow.com/questions/3230944/what-does-predicate-mean-in-the-context-of-computer-science).
A sub-query predicate is a query that is performed in the context of each
object that matches the path, current object or against each object in an array
if the object that matches the path is an array. If the sub-query returns any
objects at all, the predicate is considered true and the object matches.

```javascript
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
var tagged = $q('instances[tags/key]')(datacenter);
ok(tagged.length == 2);
```

In the above, for each `instance` the sub-query looks for `tags/key`. This
matches any of the `instance` objects who's `tags` array has an object with a
`key` property, regardless of value.

You can nest JavaScript predicates inside sub-query predicates.

```javascript
var server = $q('instances[tags{$.key == "name" && $.value == $1}]')(datacenter, 'server').pop();
```

In the above, for each `instance` object we look in the `tags` array for a
`name` property with the value "server."

You can use parent operator `..` to compare against a parent in a sub-query
predicate, or multiple parent operators `../..` to compare against other
ancestors. It's just like `..` in file paths.

***However***, Inquiry will dive into an array so, so to get back out of an
array, you need to use `../..`. Use `..` to go to the other array elements and
`../..` to go up to the object that contains the array.

If you go up beyond the root, bad things happen. Don't do it.

The following will get the tags of all instances that have a `running` property.

```javascript
var tags = $q('instances/tags[../../running]')(instances);
ok(tags.length == 2);
```

Granted, the above is not terribly useful since it returns the tags, but not the
instance itself, so the tags have no context. Really useful queries of parents
and siblings require capturing the properties of the object at the current
path with the properties of a parent or sibling.

A sub-query predicate can reference the context of query that invoked it using
the variable `$$`. This variable references the context object of the outer
query at when the sub-query predicate was invoked. The variable `$$i` contains
the index of the context object of the outer query when the sub-query predicate
was invoked.

Here we look for any president that shares a first name with any another president.

```javascript
var dup = $q('presidents[..{$.firstName == $$.firstName && $i != $$i}]')(object);
ok(dup.length == 7);
ok(dup[dup.length - 1].firstName = 'James');
```

We compared the first name of the outer president with the first names of all the other
presidents, excluding the outer president himself by his index.

Here we look for a president that does not share a first name with any other
president.

```javascript
var uniq = $q('presidents![..{$.firstName == $$.firstName && $i != $$i}]')(object);
ok(uniq.length == 9);
ok(uniq[uniq.length - 1].firstName == 'Abraham');
```

If you're wondering, yes, you can nest deeper than a single sub-query; a `$$$`
variable and a `$$$i` variable will be created.

When you invoke Inquiry directly against an array, you apply a JavaScript
predicate by defining it immediately.

```javascript
var uniq = $q('![..{$.firstName == $$.firstName && $i != $$i}]')(object.presidents);
ok(uniq.length == 9);
ok(uniq[uniq.length - 1].firstName == 'Abraham');
```

## Errors

Inquiry is a minimal path language for maximum effect. Error reporting is
minimal, too. If you give it a bad pattern, it will raise an exception, but it
doesn't offer much in the way of suggestions to fix the pattern. Diagnostics of
that sort would be expensive.

Most of your patterns will be simple and obvious, so you're not going to want to
pay for the complexity of details diagnostics. If you're having trouble with a
complicated pattern, try building it incrementally, adding the bits and pieces
to the pattern so you'll see when it breaks.

## Change Log

Changes for each release.

### Version 0.0.2

Thu Jun 20 21:35:33 UTC 2013

 * Note that brackets are not for arrays. #32.
 * Add invocation against arrays to `README.md`. #42.
 * Reduced to under 1k minified and gzipped.
 * Complete test of all `README.md` examples. #41.
 * Replace parameters with doubled dollar signs. #43.
 * Test the `README.md` examples. #41.
 * Negate predicates. #36.
 * Implement sub-query predicate parameters. #40.
 * Implement multiple predicates. #26.
 * Test searching against nested arrays. #25.
 * Test parent operator against an array. #33.
 * Test that paths can continue past predicates. #35.
 * Test coverage of AMD bandages. #37.
 * Rewrite sub-query documentation. #28.
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
