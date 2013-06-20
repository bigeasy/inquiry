! function (definition) {
  if (typeof window != "undefined") window.inquiry = definition;
  else if (typeof define == "function") define(definition);
  else module.exports = definition();
} (function () {
  var slice = [].slice;
/*
  function die () {
    console.log.apply(console, slice.call(arguments, 0));
    process.exit(1);
  }
  function say () { console.log.apply(console, slice.call(arguments, 0)) }
*/
  function parse (query, nesting, stop) {
    var i, I, args = [], rest = query, $, index, expression = [], depth = 0, struct, source, args, slash = '/';
    while (rest && rest[0] != stop) {
      if (rest[0] != '/') {
        if (/^[![{]/.test(rest[0])) {
          rest = '/.' + rest;
          index = -2;
        } else {
          rest = slash + rest;
          index = -slash.length;
        }
      }
      slash = '';
      // Skip leading whitespaces.
      //$ = /^(\s*)(.*)$/.exec(rest), index += $[1].length;
      // Match one or two slashes, followed by dots or a property name, plus an
      // optional predicate or subquery opener.
      $ = /^(\/{1,2})(\.\.|\.|(?:!(?![[{])|[^\]![{/`]|`.)*)((!?)([[{]))?(.*)/.exec(rest);
      //$ = /^(\/{1,2})(\.\.|\.|(?:[^![{/`]|`.)*)((?:![|!{|[|{)?)(.*)/.exec(rest);
      if (!$) throw new Error("bad pattern");
      $[2] = decodeURIComponent($[2].replace(/`%/g, '%25')).replace(/`(.)/, "$1");
      rest = $[6];
      struct = $.slice(1, 3);
      // Check for have a predicate or a sub-expression.
      switch ($[5]) {
      // We want to consume the contents of the curly braces that define a
      // predicate to construct a function body.
      case "{":
        // Depth is the number of curly braces we've encountered. We match curly
        // braces until it is time to pop.
        // **TODO**: Test against regular expressions. We are going to have to
        // document the one valid regular expression that we know of that we
        // cannot match: `/[/]/`.
        depth = 1;
        source = $[4] + '(';
        $ = /^(((?:[^'"}]*|'(?:[^\\']|\\.)*'|"(?:[^\\"]|\\.)*")*)})/.exec(rest);
        if (!$) throw new Error("bad pattern");
        source += $[2];
        rest = rest.substring($[1].length);
        depth = 0;
        source.replace(/\$(\d+)/, function ($, number) {
          depth = Math.max(depth, +number);
        });
        args.length = 0;
        for (i = 0; i < nesting; i++) {
          var prefix = Array(i + 2).join('$'); 
          args.push(prefix);
          args.push(prefix + 'i');
        }
        for (i = 0; i < depth; i++) {
          args.push('$' + (i + 1));
        }
        args.push('return ' +  source + ')');
        struct.push((function (predicate) {
          return function (candidate, vargs) {
            return predicate.apply(candidate.object, [ candidate.object, candidate.i ].concat(vargs));
          }
        })(Function.apply(Function, args)), []);
        break;
      // We want to consume the contents of brackets as a sub-expression, so we
      // call ourselves recursively.
      case "[":
        struct.push((function (negate, subquery) {
          return function (candidate, args) {
            return negate ? ! subquery.call(candidate.object, candidate, [ candidate.object, candidate.i ].concat(args)).length
                          : subquery.call(candidate.object, candidate, [ candidate.object, candidate.i ].concat(args)).length;
          }
        })($[4] == '!', ($ = parse(rest, nesting + 1, "]"))[0]));
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
        name = expression[i][1], predicate = expression[i][2];
        while (stack.length) {
          candidate = stack.shift(), object = candidate.object, path = candidate.path;
          if (name in object) {
            candidates.push({ object: object[name], path: Array.isArray(path[0]) ? path : [ object ].concat(path) });
          } else if (name == '.') {
            candidates.push(candidate);
          } else if (name == '..') {
            var subpath = path.slice();
            candidates.unshift({ object: subpath.shift(), path: subpath, i: 0 });
          } else if (Array.isArray(object)) {
            for (j = object.length - 1; j > -1; --j) {
              stack.unshift({ object: object[j], path: [ object ].concat(path) });
            }
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
    var func = parse(query, 1)[0];
    return function (object) { return func({ object: object, path: [], i: 0 }, slice.call(arguments, 1)) };
  }
});
