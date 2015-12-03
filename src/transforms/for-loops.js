module.exports = function(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  root
    .find(j.ForStatement, { update: { type: "UpdateExpression" } })
    .filter(exp => exp.value.body.body[0].type === "ExpressionStatement")
    .replaceWith(exp => {
      var oldBody = exp.value.body;
      var key = oldBody.body[0].expression.left.name;
      var left = j.variableDeclaration("let", [j.identifier(key)]);
      var newBody = exp.value.body;
      var oldKeyExpression = newBody.body.shift().expression;
      var right = oldKeyExpression.right.object;

      return j.forOfStatement(left, right, exp.value.body);
    });

  root
    .find(j.ForStatement, { update: { type: "AssignmentExpression" } })
    .replaceWith(exp => {
      var newBody = exp.value.body;
      var oldKeyExpression = newBody.body.shift().expression;
      var indexIdentifier = oldKeyExpression.right.property;
      var keyIdentifier = oldKeyExpression.left;

      return j.expressionStatement(
       j.callExpression(
         j.memberExpression(
           keyIdentifier,
           j.identifier("forEach")
         ),
         [
           j.arrowFunctionExpression(
             [
               keyIdentifier,
               indexIdentifier
             ],
             newBody
           )
         ]
       )
     );
    });

  return root.toSource();
};
