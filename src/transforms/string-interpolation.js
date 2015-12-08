const transformExpressionsIntoTemplates = (root, j) =>
  root
    .find(j.BinaryExpression, { operator: "+" })
    .filter(exp => {
      var left = exp.value.left;
      var right = exp.value.right;

      var stringRight = right.type === "Literal" && typeof right.value === "string";
      var stringLeft = left.type === "Literal" && typeof left.value === "string";
      var binaryExpressionLeft = left.type === "BinaryExpression";

      var involvesStrings = stringLeft || (stringRight && !binaryExpressionLeft)
      var involvesTemplates = exp.value.left.type === "TemplateLiteral" ||
        exp.value.right.type === "TemplateLiteral";

      return involvesStrings || involvesTemplates;
    })
    .replaceWith(exp => {
      var quasisFromLiteral = (literal) =>
        j.templateElement({ cooked: literal.value, raw: literal.rawValue }, false);
      var left = exp.value.left;
      var right = exp.value.right;
      var stringRight = right.type === "Literal" && typeof right.value === "string";
      var stringLeft = left.type === "Literal" && typeof left.value === "string";

      var quasis = [];
      var expressions = [];

      if (stringLeft) {
        quasis.push(quasisFromLiteral(left));
      } else if (left.type === "TemplateLiteral") {
        quasis.push.apply(quasis, left.quasis);
        expressions.push.apply(expressions, left.expressions);
      } else {
        quasis.push(j.templateElement({ cooked: '', raw: '' }, false));
        expressions.push(left);
      }

      if (stringRight) {
        quasis.push(quasisFromLiteral(right));
      } else if (right.type === "TemplateLiteral") {
        quasis.push.apply(quasis, right.quasis);
        expressions.push.apply(expressions, right.expressions);
      } else {
        if (quasis.length === 0)
          quasis.push(j.templateElement({ cooked: '', raw: '' }, false));

        expressions.push(right);
      }

      return j.templateLiteral(quasis, expressions);
    })
    .size() > 0;

module.exports = function(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  var expressionsChanged = true;

  while (expressionsChanged) {
    if (!transformExpressionsIntoTemplates(root, j)) {
      expressionsChanged = false;
    }
  }

  return root
    .toSource();
};
