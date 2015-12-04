module.exports = moduleExportsToExport;

function moduleExportsToExport(file, api) {
  var j = api.jscodeshift;
  var root = j(file.source);

  var MODULE_EXPORTS = {
    expression: {
      type: "AssignmentExpression",
      left: {
        type: "MemberExpression",
        object: { name: "module" },
        property: { name: "exports" }
      }
    }
  };

  root
    .find(j.ExpressionStatement, MODULE_EXPORTS)
    .replaceWith(p => j.exportDeclaration(true, p.node.expression.right));


  root
    .find(j.ImportDeclaration)
    .filter(importPath => importPath.value.specifiers.length === 1)
    .forEach(importPath => {
      j(importPath.scope.path)
        .find(j.VariableDeclarator, {
          id: {
            type: "Identifier",
            name: importPath.value.specifiers[0].local.name
          }
        })
        .forEach(declaratorPath => {
          var declarationPath = declaratorPath.parent;
          var declarations = declarationPath.value.declarations;
          var indexOfDeclarator = declarations.indexOf(declaratorPath.value);

          declarations.splice(indexOfDeclarator, 1);

          if (declarations.length === 0) {
            j(declarationPath).remove();
          }
        });
    });

  return root.toSource();
}
