! function (definition) {
  if (typeof module == "object" && module.exports) module.exports = definition();
  else if (typeof define == "function") define(definition);
  else window.inquiry = definition();
} (function () {
  var slice = [].slice;
/*
  function die () {
    console.log.apply(console, slice.call(arguments, 0));
    process.exit(1);
  }
  function say () { console.log.apply(console, slice.call(arguments, 0)) }
*/
  function error (index) { return "invalid syntax at: " + index }
  function parse (query, stop) {
    var i, I, vargs, rest = query, $, index, expression = [], depth = 0, struct, source, args;
    if (query[0] != '/') {
      if (/^[[{]/.test(query[0])) {
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
      $ = /^(\/{1,2})(\.\.|\.|(?:[^[{/`]|`.)*)([{[]?)(.*)/.exec(rest);
      if (!$) throw new Error(error(0));
      $[2] = decodeURIComponent($[2].replace(/`%/g, '%25')).replace(/`(.)/, "$1");
      rest = $[4];
      struct = $.slice(1, 3);
      // Check for have a predicate or a sub-expression.
      switch ($[3]) {
      // We want to consume the contents of the curly braces that define a
      // predicate to construct a function body.
      case "{":
        // Depth is the number of curly braces we've encountered. We match curly
        // braces until it is time to pop.
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
        var params = [];
        if ($ = /^\(((?:\$(?:i|\d+))(?:\s*,\s*\$(?:i|\d+))*)\)(.*)/.exec(rest)) {
          rest = $[2];
          var split = $[1].split(/\s*,\s*/);
          for (var i = 0; i < split.length; i++) {
            params.push(split[i].substring(1));
          }
        }
        depth = 0;
        source.replace(/\$(\d+)/, function ($, number) {
          depth = Math.min(depth ? depth : 256, number);
        });
        args = [ '$', '$i' ];
        for (i = 0; i < depth; i++) {
          args.push('$' + (i + 1));
        }
        args.push('return ' + source);
        struct.push((function (predicate) {
          return function (candidate, vargs) {
            return predicate.apply(candidate.object, [ candidate.object, candidate.i ].concat(vargs));
          }
        })(Function.apply(Function, args)));
        struct.push(params);
        break;
      // We want to consume the contents of brackets as a sub-expression, so we
      // call ourselves recursively.
      case "[":
        $ = parse(rest, "]");
        struct.push($[0], []);
        rest = $[1].slice(1);
        break;
      default:
        struct.push(null);
      }
      expression.push(struct);
    }
    return [ function (candidate, vargs) {
      var candidates = [], stack = [ candidate ],
          star, name, key, i, j, I, predicate, path, object, params;
      for (i = 0, I = expression.length; i < I; i++) {
        name = expression[i][1], predicate = expression[i][2], params = expression[i][3];
        while (stack.length) {
          candidate = stack.shift(), object = candidate.object, path = candidate.path;
          if (name in object) {
            candidates.push({ object: object[name], path: Array.isArray(path[0]) ? path : [ object ].concat(path) });
          } else if (name == '.') {
            candidates.push(candidate);
          } else if (Array.isArray(object)) {
            for (j = object.length - 1; j > -1; --j) {
              stack.unshift({ object: object[j], path: [ object ].concat(path) });
            }
          } else if (name == '..') {
            var subpath = path.slice();
            candidates.unshift({ object: subpath.shift(), path: subpath, i: 0 });
          } else if (~(star = name.indexOf('*'))) {
            for (key in object) {
              if (key.indexOf(name.substring(0, star)) == 0
                  && key.lastIndexOf(name.substring(star + 1) == key.length - (name.length - star))) {
                candidates.push({ object: object[key], path: Array.isArray(path[0]) ? path : [ object ].concat(path) });
                break;
              }
            }
          }
        }
        if (predicate) {
          while (candidates.length) {
            candidate = candidates.shift(), object = candidate.object;
            if (Array.isArray(object)) {
              for (j = object.length - 1; j > -1; --j) {
                candidates.unshift({ object: object[j], path: [ object ].concat(path), i: j });
              }
            } else if (params.length) {
              var args = [];
              for (j = 0; j < params.length; j++) {
                if (params[j] == 'i') {
                  args.push(candidate.i);
                } else {
                  args.push(vargs[params[j]]);
                }
              }
              if (predicate(candidate, args)) {
                stack.push(candidate);
              }
            } else if (predicate(candidate, vargs)) {
              stack.push(candidate);
            }
          }
        } else {
          stack.unshift.apply(stack, candidates.splice(0));
        }
      }
      for (i = stack.length - 1; i > -1; i--) stack[i] = stack[i].object;
      return stack;
    }, rest ];
  }
  return function (query) {
    var func = parse(query)[0];
    return function (object) { return func({ object: object, path: [], i: 0 }, slice.call(arguments, 1)) };
  }
});
