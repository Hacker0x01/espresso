module.exports = implicitVariableDeclaration

var findParentOfType = require('../utils/find-parent-of-type')
var parentHasType = require('../utils/parent-has-type')

function implicitVariableDeclaration (file, api) {
  var j = api.jscodeshift
  var root = j(file.source)

  var VAR_DECLARATION = {
    expression: {
      type: 'AssignmentExpression'
    }
  }

  var ASSIGN_EXP = {
    operator: '=',
    left: {
      type: 'Identifier'
    }
  }

  var variables = []
  root
  .find(j.VariableDeclaration)
  .filter(function (p) {
    return p.node.declarations[0].init === null
  })
  .forEach(function (p) {
    variables = variables.concat(p.node.declarations.map(function (variable) {
      return variable.id.name
    }))
  })
  .remove()

  var changed = !! variables.length

  root
  .find(j.ExpressionStatement, VAR_DECLARATION)
  .filter(function (p) {
    return p.node.expression.left.type === 'Identifier'
  })
  .forEach(function (p) {
    var matchIndex = variables.indexOf(p.node.expression.left.name)

    if (matchIndex > -1) {
      variables.splice(matchIndex, 1)

      if (findParentOfType(p, 'IfStatement')) {
        findParentOfType(p, 'IfStatement').insertBefore(j.variableDeclaration('var', [j.variableDeclarator(j.identifier(p.node.expression.left.name), null)]))
      } else {
        p.replace(j.variableDeclaration('var', [j.variableDeclarator(j.identifier(p.node.expression.left.name), p.node.expression.right)]))
      }
    }
  })

  root
  .find(j.AssignmentExpression)
  .filter(function (p) {
    return p.node.left.type === 'Identifier' && !p.node.parenthesizedExpression && p.parent.node.type !== 'SequenceExpression'
  })
  .forEach(function (p) {
    if (p.parent.node.type === 'AssignmentExpression' && variables.indexOf(p.parent.node.left.name) > -1) {
      var matchIndex = variables.indexOf(p.parent.node.left.name)
      variables.splice(matchIndex, 1)

      if (parentHasType(p.parent, 'SequenceExpression')) {
        parentHasType(p, 'BlockStatement').insertBefore(
          j.variableDeclaration('var', [j.variableDeclarator(j.identifier(p.parent.node.left.name), null)])
        )
      } else {
        p.parent.replace(j.variableDeclaration('var', [j.variableDeclarator(j.identifier(p.parent.node.left.name), p.parent.node.right)]))
      }
    } else if (variables.indexOf(p.node.left.name) > -1) {
      var match = variables.indexOf(p.node.left.name)
      variables.splice(match, 1)

      if (findParentOfType(p, 'ExportDeclaration')) {
        findParentOfType(p, 'ExportDeclaration').insertBefore(j.variableDeclaration('var', [j.variableDeclarator(j.identifier(p.node.left.name), null)]))
      } else {
        p.replace(j.variableDeclaration('var', [j.variableDeclarator(j.identifier(p.node.left.name), p.node.right)]))
      }
    }
  })

  root
  .find(j.VariableDeclaration)
  .forEach(function (p) {
    var varName = p.node.declarations[0].id.name
    root
    .find(j.ImportDeclaration)
    .forEach(function (importPath) {
      var name = importPath.node.specifiers[0].local.name
      if (name === varName) {
        var importIdent = j.identifier(name + 'Import')
        var varIdent = p.node.declarations[0].init.arguments[0]
        importPath.node.specifiers[0].local = importIdent

        if (name === varIdent.name) {
          varIdent.name = importIdent.name
        }
      }
    })
  })

  root
  .find(j.AssignmentExpression, ASSIGN_EXP)
  .filter(function (p) {
    return variables.indexOf(p.node.left.name) > -1 && p.node.parenthesizedExpression
  })
  .forEach(function (p) {
    var matchIndex = variables.indexOf(p.node.left.name)
    variables.splice(matchIndex, 1)
    parentHasType(p, 'BlockStatement').insertBefore(j.variableDeclaration('var', [j.variableDeclarator(j.identifier(p.node.left.name), null)]))
  })

  if (changed) {
    return root.toSource()
  }

  return null
}
