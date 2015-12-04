module.exports = function(file, api) {
  const j = api.jscodeshift;

  return j(file.source)
    .find(j.VariableDeclarator, {
      init: null
    })
    .forEach(declaratorPath => {
      var assignmentCollection = j(declaratorPath.scope.path)
        .find(j.ExpressionStatement, {
          expression: {
            type: 'AssignmentExpression',
            left: {
              type: "Identifier",
              name: declaratorPath.value.id.name
            }
          }
        });

      if (assignmentCollection.size() < 1) return;

      assignmentCollection
        .replaceWith(assignmentPath =>
          j.variableDeclaration(
            'var',
            [
              j.variableDeclarator(
                declaratorPath.value.id,
                assignmentPath.value.expression.right
              )
            ]
          )
        );

      var declarationPath = declaratorPath.parent;
      var declarations = declarationPath.value.declarations;
      var indexOfDeclaration = declarations.indexOf(declaratorPath.value);

      declarations.splice(indexOfDeclaration, 1);

      if (declarations.length === 0) {
        j(declarationPath).remove();
      }

    })
    .toSource();
};
