require("proof")(4, prove)

function prove (okay) {
    var inquiry = require("../..")
    var object, result
    object = { firstName: "Abraham", lastName: "Lincoln" }
    okay(inquiry('/.>{ $.lastName + ", " + $.firstName }')(object), [ 'Lincoln, Abraham' ], 'transform')
    okay(inquiry('/.>{ $.nothing }')(object), [], 'transform empty')
    okay(inquiry('/.>{ [ $.firstName, $.lastName ] }')(object), [ 'Abraham', 'Lincoln' ], 'transform array')
    okay(inquiry('>{ [ $.firstName, $.lastName ] }')(object), [ 'Abraham', 'Lincoln' ], 'transform assume root')
}
