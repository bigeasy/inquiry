! function (definition) {
  if (typeof window != "undefined") window.inquiry = definition();
  else if (typeof define == "function") define(definition);
  else module.exports = definition();
} (function () {
  function parse (rest, fixup, nesting, stop) {
    var expression = [], slash = '/', args, struct, source, i, $;
    rest = rest.trim()
    while (rest && rest[0] != stop) {
      if (rest[0] != '/') {
        if (/^[![{]/.test(rest[0])) {
          rest = '/.' + rest;
        } else {
          rest = slash + rest;
        }
      }
      slash = '';
      $ = /^\/((?:!(?![[{])|[^\]![{/`"]|"(?:[^\\"]|\\.)*")*)((!?)([[{]))?(.*)/.exec(rest);
      if (!$) throw new Error("bad pattern");
      //struct = [ /^['"]/.test($[1].trim()) ? $[1].trim().replace(/^(['"])(.*)\1$/g, "$2").replace(/\\(.)/g, "$1") : decodeURIComponent($[1].trim()) ]
      struct = [ /^"/.exec($[1].trim()) ? JSON.parse($[1].trim()) : decodeURIComponent($[1].trim()) ]
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
        args = ['_'];
        for (i = 0; i < nesting; i++) {
          args.push(Array(i + 2).join('$'), Array(i + 2).join('$') + 'i');
        }
        args.push.apply(args, fixup)
        $ = 0; // evil reuse of `$` to count airty. for the bytes, always for the bytes
        source.replace(/\$(\d+)/g, function (_, number) { $ = Math.max($, +number) });
        for (i = 0; i < $; i++) {
          args.push('$' + (i + 1));
        }
        args.push('return ' +  source + ')');
        struct.push((function (predicate) {
          return function (candidate, vargs) {
            return predicate.apply(this, [ candidate._, candidate.o, candidate.i ].concat(vargs))
                 ? [ candidate ] : []
          }
        })(Function.apply(Function, args)), []);
        break;
      // We want to consume the contents of brackets as a sub-expression, so we
      // call ourselves recursively.
      case "[":
        struct.push((function (negate, subquery) {
          return function (candidate, args) {
            var length = subquery.call(this, candidate, [ candidate.o, candidate.i ].concat(args)).length;
            return (negate ? ! length : length) ? [ candidate ] : [];
          }
        })($[3] == '!', ($ = parse(rest, fixup, nesting + 1, "]"))[0]));
        rest = $[1].slice(1);
        break;
      default:
        struct.push(null);
      }
      expression.push(struct);
      rest = rest.trim()
    }
    return [ function (candidate, vargs) {
      var candidates = [], stack = [ candidate ],
          star,  i, j, path, object, _;
      // todo: we might be able to get: div/p/3 (third paragraph)
      // todo: we might be able to get: .{ $.tag == 'div' }/.{ $.tag == 'p' }/3 (third paragraph)
      for (i = 0; i < expression.length; i++) {
        while (stack.length) {
          candidate = stack.shift(), object = candidate.o, path = candidate.p, _ = candidate._;
          if (object[expression[i][0]] !== (void(0))) {
            candidates.push({ o: object[expression[i][0]], _: [ expression[i][0] ].concat(_), p: [ object ].concat(path) });
          } else if (expression[i][0] == '.') {
            candidates.push(candidate);
          } else if (expression[i][0] == '..') {
            path = path.slice();
            candidates.unshift({ o: path.shift(), _: _.slice(1), p: path, i: 0 });
          } else if (Array.isArray(object)) {
            for (j = object.length - 1; j > -1; --j) {
              stack.unshift({ o: object[j], _: [ j, expression[i][0] ].concat(_), p: [ object ].concat(path) });
            }
          } else if (~(star = expression[i][0].indexOf('*'))) {
            for (j in object) {
              if (j.indexOf(expression[i][0].substring(0, star)) == 0
                  && j.lastIndexOf(expression[i][0].substring(star + 1) == j.length - (expression[i][0].length - star))) {
                candidates.push({ o: object[j], _: [ j ].concat(_), p: [ object ].concat(path) });
              }
            }
          }
        }
        if (expression[i][1]) {
          while (candidates.length) {
            candidate = candidates.shift(), object = candidate.o;
            if (Array.isArray(object)) {
              for (j = object.length - 1; j > -1; --j) {
                candidates.unshift({ o: object[j], _: [ j, expression[i][0] ].concat(_), p: [ object ].concat(path), i: j });
              }
            } else {
              stack.push.apply(stack, expression[i][1].call(this, candidate, vargs))
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
  return function (query, args) {
    var func = parse(query, args || [], 1)[0];
    return function (object) { return func.call(this, { o: object, _: [], p: [], i: 0 }, [].slice.call(arguments, 1)) };
  }
});
