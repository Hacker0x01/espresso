module.exports = function(file, api) {
  var j = api.jscodeshift;
  var isConstructor = (bodyElement) =>
    bodyElement.type === "FunctionDeclaration"

  var isPrototypeMethod = (bodyElement) =>
    bodyElement.type === "ExpressionStatement" &&
        bodyElement.expression.left &&
        bodyElement.expression.left.type === "MemberExpression" &&
        bodyElement.expression.left.object.type === "MemberExpression" &&
        bodyElement.expression.left.object.property.name === "prototype"

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

        if (isConstructor(bodyElement)) {
          property = j.property(
            'init',
            j.identifier('constructor'),
            j.functionExpression(
              null,
              [],
              bodyElement.body
            )
          );
        } else if(isPrototypeMethod(bodyElement)) {
          property = j.property(
            'init',
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

      return j.callExpression(
        j.memberExpression(superClass, j.identifier('extend')),
        [
          j.objectExpression(newBody)
        ]
      );
    })
    .toSource();
};
