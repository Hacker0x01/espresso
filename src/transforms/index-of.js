module.exports = function(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  root
    .find(j.CallExpression, {
      callee: {
        type: "MemberExpression",
        object: {
          type: "Identifier",
          name: "indexOf"
        },
        property: {
          type: "Identifier",
          name: "call"
        }
      }
    })
    .replaceWith(exp =>
      j.callExpression(
        j.memberExpression(
          exp.value.arguments[0],
          j.identifier("indexOf")
        ),
        [
          exp.value.arguments[1]
        ]
      )
    );

  root
    .find(j.VariableDeclaration)
    .filter(exp =>
      exp.value.declarations.filter(declarator =>
        declarator.id.name === "indexOf"
      ).length === 1
    )
    .forEach(exp => {
      var declarations = exp.value.declarations;
      var indexOfIndexOfDeclarator = declarations.findIndex(
        declarator => declarator.id.name === "indexOf"
      );

      declarations.splice(indexOfIndexOfDeclarator, 1);
    });

  return root
    .toSource();
};
