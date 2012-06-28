# Inqury 

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

hickory = $q(object, '/p+[$.lastName == $1]/$', "Jackson").pop();

console.log("Found: " hickory.firstName + " " + hickory.lastName);
```

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
