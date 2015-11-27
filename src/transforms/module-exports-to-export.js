module.exports = moduleExportsToExport

function moduleExportsToExport (file, api) {
  var j = api.jscodeshift
  var root = j(file.source)

  var MODULE_EXPORTS = {
    expression: {
      type: 'AssignmentExpression',
      left: {
        type: 'MemberExpression',
        object: {name: 'module'},
        property: {name: 'exports'}
      }
    }
  }

  root
    .find(j.ExpressionStatement, MODULE_EXPORTS)
    .replaceWith(function (p) {
      return j.exportDeclaration(true, p.node.expression.right)
    })

  return root.toSource()
}
