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
  function truth () { return true }
  function inquiry (query) {
    var i, I, vargs, rest = query, $, index, expression = [], depth = 0, struct, source, args;
    if (query[0] != '/') {
      rest = '/.' + query;
      index = -2;
    }
    while (rest) {
      $ = /^(\s*)(.*)$/.exec(rest), index += $[1].length;
      $ = /^(\/{1,2})(\.|\.\.|[\w\*][\*\w\d]*)(\[?)(.*)/.exec(rest);
      if (!$) throw new Error(error(0));
      rest = $[4];
      struct = $.slice(1, 3);
      if ($[3]) {
        depth = 1;
        source = '';
        while ($ = /^(?:[^'"\[\]]*|'(?:[^\\']|\\.)*'|"(?:[^\\"]|\\.)*")*/.exec(rest)) {
          source += $[0];
          rest = rest.substring($[0].length);
          if (rest[0] == ']') {
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
      } else {
        struct.push(truth);
      }
      expression.push(struct);
    }
    function subexpression (test, object, vargs) {
      if (test.length) {
        return test.apply(this, [ object ].concat(vargs.slice(0, test.length - 1)));
      }
      return true;
    }
    return function (object) {
      var vargs = slice.call(arguments, 1)
        , candidates = [], candidate, stack = [ object ]
        , star, name, key, i, I, test
        ;
      for (i = 0, I = expression.length; i < I; i++) {
        name = expression[i][1], test = expression[i][2];
        while (stack.length) {
          object = stack.shift();
          if (name == '.') {
            candidates.push(object);
          } else if (~(star = name.indexOf('*'))) {
            for (key in object) {
              if (key.indexOf(name.substring(0, star)) == 0
                  && key.lastIndexOf(name.substring(star + 1) == key.length - (name.length - star))) {
                candidates.push(object[key]);
                break;
              }
            }
          } else if (object[name]) {
            candidates.push(object[name]);
          } else if (Array.isArray(object)) {
            stack.unshift.apply(stack, object);
          }
        }
        while (candidates.length) {
          candidate = candidates.shift();
          if (subexpression(test, candidate, vargs)) {
            stack.push(candidate);
          }
        }
      }
      return stack;
    }
  }
  return inquiry;
});
