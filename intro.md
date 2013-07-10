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
