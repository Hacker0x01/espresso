const transformExpressionsIntoTemplates = (root, j) => {
  const simpleExpressionsChanged = root
    .find(j.BinaryExpression, { operator: "+", left: { type: "Literal" } })
    .filter(exp => typeof exp.value.left.value === "string")
    .replaceWith(exp =>
      j.templateLiteral(
        [
          j.templateElement({
            cooked: exp.value.left.value,
            raw: exp.value.left.rawValue
          }, false)
        ],
        [
          exp.value.right
        ]
      )
    )
    .size() > 0;

  const binaryExpressionsWithTemplatesChanged = root
    .find(j.BinaryExpression, { operator: "+", left: { type: "TemplateLiteral" } })
    .replaceWith(exp => {
      var templateLiteral = exp.value.left;

      if (exp.value.right.type === "Literal") {
        templateLiteral.quasis.push(
          j.templateElement({
            cooked: exp.value.right.value,
            raw: exp.value.right.rawValue
          }, false)
        );
      } else {
        templateLiteral.expressions.push(exp.value.right);

        if (templateLiteral.expressions.length > templateLiteral.quasis.length) {
          templateLiteral.quasis.push(j.templateElement({
            cooked: '',
            raw: ''
          }, false));
        }
      }

      return templateLiteral;
    })
    .size() > 0;

  return simpleExpressionsChanged || binaryExpressionsWithTemplatesChanged;
};

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
