!function (definition) {
  if (typeof module == "object" && module.exports) module.exports = definition();
  else if (typeof define == "function") define(definition);
  else window.inquiry = definition();
} (function () {
  var slice = [].slice;
  function die () {
    console.log.apply(console, slice.call(arguments, 0));
    return process.exit(1);
  }
  function say () { return console.log.apply(console, slice.call(arguments, 0)) }
  function error (index) { return "invalid syntax at: " + index }
  function subsexpression (rest, struct) {
    return rest.substring(1);
  }
  function subquery (test) {
    return function () {
      return test.apply(this, arguments).length;
    }
  }
  function parse (query, stop) {
    var i, I, vargs, rest = query, $, index, expression = [], depth = 0, struct, source, args;
    if (query[0] != '/') {
      if (query[0] != '.') {
        rest = '/.' + query;
        index = -2;
      } else {
        rest = '/' + query;
        index = -1;
      }
    }
    while (rest && rest[0] != stop) {
      // Skip leading whitespaces.
      $ = /^(\s*)(.*)$/.exec(rest), index += $[1].length;
      // Match one or two slashes, followed by dots or a property name, plus an
      // optional predicate or subquery opener.
      $ = /^(\/{1,2})(\.|\.\.|[\w\*][\*\w\d]*)([{[]?)(.*)/.exec(rest);
      if (!$) throw new Error(error(0));
      rest = $[4];
      struct = $.slice(1, 3);
      // Check for have a predicate or a sub-expression.
      switch ($[3]) {
      // We want to consume the contents of the curly braces that define a
      // predicate to construct a function body.
      case "{":
        // Depth is the number of curly braces we've encountered. We match curly
        // brances until it is time to pop.
        // **TODO**: Test against regular expressions. We are going to have to
        // document the one valid regular expression that we know of that we
        // cannot match: `/[/]/`.
        depth = 1;
        source = '';
        while ($ = /^(?:[^'"{}]*|'(?:[^\\']|\\.)*'|"(?:[^\\"]|\\.)*")*/.exec(rest)) {
          source += $[0];
          rest = rest.substring($[0].length);
          if (rest[0] == '}') {
            break;
          }
        }
        rest = rest.substring(1);
        depth = 0;
        source.replace(/\$(\d+)/, function ($, number) {
          depth = Math.min(depth ? depth : 256, number);
        });
        args = [ '$' ];
        for (i = 0; i < depth; i++) {
          args.push('$' + (i + 1));
        }
        args.push('return ' + source);
        struct.push(Function.apply(Function, args));
        break;
      // We want to consume the contents of brackets as a sub-expression, so we
      // call ourselves recursively.
      case "[":
        var sub = parse(rest, "]");
        struct.push(subquery(sub.shift()));
        rest = sub.shift().slice(1);
        break;
      default:
        struct.push(null);
      }
      expression.push(struct);
    }
    function subexpression (test, object, vargs) {
      if (true || test.length) {
        return test.apply(object, [ object ].concat(vargs.slice(0, test.length - 1)));
      }
      return true;
    }
    return [ function (object) {
      var vargs = slice.call(arguments, 1),
          candidates = [], candidate, stack = [ object ],
          star, name, key, i, I, test;
      for (i = 0, I = expression.length; i < I; i++) {
        name = expression[i][1], test = expression[i][2];
        while (stack.length) {
          object = stack.shift();
          if (object[name]) {
            candidates.push(object[name]);
          } else if (Array.isArray(object)) {
            stack.unshift.apply(stack, object);
          } else if (name == '.') {
            candidates.push(object);
          } else if (~(star = name.indexOf('*'))) {
            for (key in object) {
              if (key.indexOf(name.substring(0, star)) == 0
                  && key.lastIndexOf(name.substring(star + 1) == key.length - (name.length - star))) {
                candidates.push(object[key]);
                break;
              }
            }
          }
        }
        if (test) {
          while (candidates.length) {
            candidate = candidates.shift();
            if (Array.isArray(candidate)) {
              candidates.unshift.apply(candidates, candidate);
            } else if (subexpression(test, candidate, vargs)) {
              stack.push(candidate);
            }
          }
        } else {
          stack.unshift.apply(stack, candidates.splice(0));
        }
      }
      return stack;
    }, rest ];
  }
  return function (query) { return parse(query).shift() }
});
