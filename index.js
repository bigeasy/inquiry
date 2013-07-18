! function (definition) {
  if (typeof window != "undefined") window.inquiry = definition;
  else if (typeof define == "function") define(definition);
  else module.exports = definition();
} (function () {
  function parse (rest, nesting, stop) {
    var expression = [], slash = '/', args, struct, source, i, $;
    while (rest && rest[0] != stop) {
      if (rest[0] != '/') {
        if (/^[![{]/.test(rest[0])) {
          rest = '/.' + rest;
        } else {
          rest = slash + rest;
        }
      }
      slash = '';
      // Skip leading whitespaces.
      //$ = /^(\s*)(.*)$/.exec(rest), index += $[1].length;
      // Match one or two slashes, followed by dots or a property name, plus an
      // optional predicate or subquery opener.
      $ = /^\/(\.\.|\.|(?:!(?![[{])|[^\]![{/`]|`.)*)((!?)([[{]))?(.*)/.exec(rest);
      //$ = /^(\/{1,2})(\.\.|\.|(?:[^![{/`]|`.)*)((?:![|!{|[|{)?)(.*)/.exec(rest);
      if (!$) throw new Error("bad pattern");
      struct = [ decodeURIComponent($[1].replace(/`%/g, '%25')).replace(/`(.)/g, "$1") ]
      rest = $[5];
      // Check for have a predicate or a sub-expression.
      switch ($[4]) {
      // We want to consume the contents of the curly braces that define a
      // predicate to construct a function body.
      case "{":
        // Depth is the number of curly braces we've encountered. We match curly
        // braces until it is time to pop.
        // **TODO**: Test against regular expressions. We are going to have to
        // document the one valid regular expression that we know of that we
        // cannot match: `/[/]/`.
        source = $[3] + '(';
        $ = /^(((?:[^'"}]*|'(?:[^\\']|\\.)*'|"(?:[^\\"]|\\.)*")*)})/.exec(rest);
        if (!$) throw new Error("bad pattern");
        source += $[2];
        rest = rest.substring($[1].length);
        args = [];
        for (i = 0; i < nesting; i++) {
          args.push(Array(i + 2).join('$'), Array(i + 2).join('$') + 'i');
        }
        $ = 0; // evil reuse of `$` to count airty. for the bytes, always for the bytes
        source.replace(/\$(\d+)/g, function (_, number) { $ = Math.max($, +number) });
        for (i = 0; i < $; i++) {
          args.push('$' + (i + 1));
        }
        args.push('return ' +  source + ')');
        struct.push((function (predicate) {
          return function (candidate, vargs) {
            return predicate.apply(candidate.o, [ candidate.o, candidate.i ].concat(vargs));
          }
        })(Function.apply(Function, args)), []);
        break;
      // We want to consume the contents of brackets as a sub-expression, so we
      // call ourselves recursively.
      case "[":
        struct.push((function (negate, subquery) {
          return function (candidate, args) {
            var length = subquery.call(candidate.o,
              candidate, [ candidate.o, candidate.i ].concat(args)).length
            return negate ? ! length : length;
          }
        })($[3] == '!', ($ = parse(rest, nesting + 1, "]"))[0]));
        rest = $[1].slice(1);
        break;
      default:
        struct.push(null);
      }
      expression.push(struct);
    }
    return [ function (candidate, vargs) {
      var candidates = [], stack = [ candidate ],
          star, nameOrPredicate, i, j, I, path, object, params;
      for (i = 0, I = expression.length; i < I; i++) {
        nameOrPredicate = expression[i][0];
        while (stack.length) {
          candidate = stack.shift(), object = candidate.o, path = candidate.p;
          if (nameOrPredicate in object) {
            candidates.push({ o: object[nameOrPredicate], p: Array.isArray(path[0]) ? path : [ object ].concat(path) });
          } else if (nameOrPredicate == '.') {
            candidates.push(candidate);
          } else if (nameOrPredicate == '..') {
            var subpath = path.slice();
            candidates.unshift({ o: subpath.shift(), p: subpath, i: 0 });
          } else if (Array.isArray(object)) {
            for (j = object.length - 1; j > -1; --j) {
              stack.unshift({ o: object[j], p: [ object ].concat(path) });
            }
          } else if (~(star = nameOrPredicate.indexOf('*'))) {
            for (j in object) {
              if (j.indexOf(nameOrPredicate.substring(0, star)) == 0
                  && j.lastIndexOf(nameOrPredicate.substring(star + 1) == j.length - (nameOrPredicate.length - star))) {
                candidates.push({ o: object[j], p: Array.isArray(path[0]) ? path : [ object ].concat(path) });
                break;
              }
            }
          }
        }
        nameOrPredicate = expression[i][1];
        if (nameOrPredicate) {
          while (candidates.length) {
            candidate = candidates.shift(), object = candidate.o;
            if (Array.isArray(object)) {
              for (j = object.length - 1; j > -1; --j) {
                candidates.unshift({ o: object[j], p: [ object ].concat(path), i: j });
              }
            } else if (nameOrPredicate(candidate, vargs)) {
              stack.push(candidate);
            }
          }
        } else {
          stack.unshift.apply(stack, candidates.splice(0));
        }
      }
      for (j = stack.length - 1; j > -1; --j) stack[j] = stack[j].o;
      return stack;
    }, rest ];
  }
  return function (query) {
    var func = parse(query, 1)[0];
    return function (object) { return func({ o: object, p: [], i: 0 }, [].slice.call(arguments, 1)) };
  }
});
