module.exports = requireToImport

var findParentOfType = require('../utils/find-parent-of-type')

function requireToImport (file, api) {
  var j = api.jscodeshift
  var root = j(file.source)

  var REQUIRE = {
    callee: {
      type: 'Identifier',
      name: 'require'
    }
  }

  requiresTransformed = root
  .find(j.CallExpression, REQUIRE)
  .forEach(function (p) {
    var parentCall = p.parent.node.type === 'CallExpression' ? p.parent : false
    var parentExpStat = findParentOfType(p, 'ExpressionStatement')

    if (parentCall) {
      var importIdent = j.identifier(parentExpStat.node.expression.left.name + 'Import')
      var origIdent = parentExpStat.node.expression.left

      parentExpStat.replace(
        j.importDeclaration([j.importDefaultSpecifier(importIdent)], p.node.arguments[0])
      )

      parentExpStat.insertAfter(
        j.variableDeclaration('var', [j.variableDeclarator(origIdent, j.callExpression(parentCall.node.callee, [importIdent]))])
      )
    } else {
      parentExpStat.replace(
        j.importDeclaration([j.importDefaultSpecifier(parentExpStat.node.expression.left)], p.node.arguments[0])
      )
    }
  })
  .size() > 0

  if (requiresTransformed) {
    return root.toSource()
  }

  return null
}
