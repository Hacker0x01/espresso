module.exports = function(file, api) {
  var j = api.jscodeshift;
  var removeVariableDeclarator = require('../utils/remove-variable-declarator');
  var isConstructor = bodyElement =>
    bodyElement.type === "FunctionDeclaration";

  var isPrototypeMethod = bodyElement =>
    bodyElement.type === "ExpressionStatement" &&
        bodyElement.expression.left &&
        bodyElement.expression.left.type === "MemberExpression" &&
        bodyElement.expression.left.object.type === "MemberExpression" &&
        bodyElement.expression.left.object.property.name === "prototype";

  var transformConstructorBody = (bodyElement, superClass) => {
    j(bodyElement)
      .find(j.AssignmentExpression, {
        left: {
          type: 'MemberExpression',
          object: {
            type: 'ThisExpression'
          }
        },
        right: {
          type: 'CallExpression',
          callee: {
            type: 'Identifier',
            name: 'bind'
          }
        }
      })
      .replaceWith(exp =>
        j.assignmentExpression(
          '=',
          exp.value.left,
          j.callExpression(
            j.memberExpression(
              exp.value.right.arguments[0],
              j.identifier('bind')
            ),
            exp.value.right.arguments.slice(1)
          )
        )
      );

    j(bodyElement)
      .find(j.ReturnStatement, {
        argument: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: {
              type: 'MemberExpression',
              object: {
                type: 'MemberExpression',
                object: { type: 'Identifier' },
                property: { type: 'Identifier', name: '__super__' }
              },
              property: { type: 'Identifier', name: 'constructor' }
            },
            property: { type: 'Identifier', name: 'apply' }
          },
          arguments: [
            { type: 'ThisExpression' },
            { type: 'Identifier', name: 'arguments' }
          ]
        }
      })
      .replaceWith(exp =>
        j.expressionStatement(
          j.callExpression(
            j.memberExpression(
              j.memberExpression(
                superClass,
                j.identifier('prototype')
              ),
              j.identifier('apply')
            ),
            exp.value.argument.arguments
          )
        )
      );

    return bodyElement;
  };

  return j(file.source)
    .find(j.CallExpression, {
      callee: {
        type: "FunctionExpression"
      }
    })
    .filter(exp =>
       exp.value.callee.params.length === 1 &&
       exp.value.callee.params[0].name === "superClass")
    .replaceWith(exp => {
      var callee = exp.value.callee;
      var superClass = exp.value.arguments[0];
      var newBody = [];

      callee.body.body.forEach(bodyElement => {
        var property;

        if (isConstructor(bodyElement) && bodyElement.body.body.length > 1) {
          property = j.property(
            "init",
            j.identifier("constructor"),
            j.functionExpression(
              null,
              [],
              transformConstructorBody(bodyElement.body, superClass)
            )
          );
        } else if (isPrototypeMethod(bodyElement)) {
          property = j.property(
            "init",
            j.identifier(bodyElement.expression.left.property.name),
            bodyElement.expression.right
          );
        }

        if (property) {
          if (property.value.type === "FunctionExpression") {
            property.method = true;
          }

          newBody.push(property);
        }
      });

      removeVariableDeclarator("extend", exp.scope.path, api);
      removeVariableDeclarator("hasProp", exp.scope.path, api);
      removeVariableDeclarator("bind", exp.scope.path, api);

      return j.callExpression(
        j.memberExpression(superClass, j.identifier("extend")),
        [
          j.objectExpression(newBody)
        ]
      );
    })
    .toSource();
};
