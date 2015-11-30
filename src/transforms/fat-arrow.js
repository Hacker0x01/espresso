module.exports = fatArrow

function fatArrow (file, api) {
  var j = api.jscodeshift
  var root = j(file.source)

  var FUNCTION_BIND = {
    callee: {
      type: 'FunctionExpression'
    },
    arguments: [
      { type: 'ThisExpression' }
    ]
  }

  root
    .find(j.CallExpression, FUNCTION_BIND)
    .replaceWith(p => {
      return j.arrowFunctionExpression([], p.node.callee.body.body[0].argument.body)
    })
    .find(j.Identifier, {name: '_this'})
    .replaceWith(j.identifier('this'))

  return root.toSource()
}
