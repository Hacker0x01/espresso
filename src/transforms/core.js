module.exports = core

var findParentOfType = require('../utils/find-parent-of-type')
var parentHasType = require('../utils/parent-has-type')

function core (file, api) {
  var j = api.jscodeshift
  var root = j(file.source)

  var CLASS_METHOD = {
    value: {
      type: 'FunctionExpression'
    }
  }
  var FUNCTION_BIND = {
    callee: {
      type: 'FunctionExpression'
    },
    arguments: [
      { type: 'ThisExpression' }
    ]
  }

  root
  .find(j.Property, CLASS_METHOD)
  .replaceWith(function (p) {
    var prop = j.property(p.node.kind, p.node.key, j.functionExpression(null, p.node.value.params, p.node.value.body))
    prop.method = true
    return prop
  })

  root
  .find(j.CallExpression, FUNCTION_BIND)
  .replaceWith(function (p) {
    return j.arrowFunctionExpression([], p.node.callee.body.body[0].argument.body)
  })
  .find(j.Identifier, {name: '_this'})
  .replaceWith(j.identifier('this'))

  return root.toSource()
}
