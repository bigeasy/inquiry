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
  function inquiry (query) {
    var i, I, vargs, rest = query, $, index, expression = [];
    while (rest) {
      $ = /^(\s*)(.*)$/.exec(rest), index += $[1].length;
      $ = /^(\/{1,2})(\w[\w\d]*)(\+?)(.*)/.exec(query);
      if (!$) throw new Error(error(index));
      expression.push($); 
      rest = $[4];
    }
    return function (object) {
      var vargs = slice.call(arguments, 1);
      for (i = 0, I = expression.length; i < I; i++) {
        $ = expression.shift();
        object = object[$[2]];
      }
      return [ object ];
    }
  }
  return inquiry;
});
