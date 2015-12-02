module.exports = function(file, api) {
  const j = api.jscodeshift;

  return j(file.source)
    .find(j.FunctionExpression)
    .filter(exp => exp.value.params.length > 0)
    .forEach(exp => {
      var body = exp.value.body.body;
      var ifStatements = body.filter(bodyItem =>
        bodyItem.type === "IfStatement"
      );
      var params = exp.value.params;

      params.forEach((param, indexOfParam) => {
        var paramIsNullIfStatement = ifStatements
          .find(ifStatement => {
            var test = ifStatement.test;
            var testLeft = test.left;
            var testRight = test.right;
            var consequent = ifStatement.consequent;

            return ifStatement.test.type === "BinaryExpression" &&
                test.operator === "==" &&
                testLeft.type === "Identifier" &&
                testLeft.name === param.name &&
                testRight.type === "Literal" &&
                testRight.value === null &&
                consequent.body.length === 1 &&
                consequent.body[0].type === "ExpressionStatement" &&
                consequent.body[0].expression.left.type === "Identifier" &&
                consequent.body[0].expression.left.name === param.name
          });
        var indexOfparamIsNullIfStatement = body.indexOf(paramIsNullIfStatement);

        if (typeof paramIsNullIfStatement === "undefined") return;

        body.splice(indexOfparamIsNullIfStatement, 1);
        exp.value.params[indexOfParam] = j.assignmentPattern(
          param,
          paramIsNullIfStatement.consequent.body[0].expression.right
        );
      });
    })
    .toSource();
};
