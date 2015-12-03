module.exports = requireToImport;

var findParentOfType = require("../utils/find-parent-of-type");

function requireToImport(file, api) {
  var j = api.jscodeshift;
  var root = j(file.source);

  var REQUIRE = {
    callee: {
      type: "Identifier",
      name: "require"
    }
  };

  root
    .find(j.CallExpression, REQUIRE)
    .forEach(p => {
      var parentCall = p.parent.node.type === "CallExpression" ? p.parent : false;
      var parentExpStat = findParentOfType(p, "ExpressionStatement");

      if (parentCall) {
        var importIdent = j.identifier(`${parentExpStat.node.expression.left.name}Import`);
        var origIdent = parentExpStat.node.expression.left;

        parentExpStat.replace(
          j.importDeclaration([j.importDefaultSpecifier(importIdent)], p.node.arguments[0])
        );

        parentExpStat.insertAfter(
          j.variableDeclaration("var", [j.variableDeclarator(origIdent, j.callExpression(parentCall.node.callee, [importIdent]))])
        );
      } else {
        var specifiers = [];

        if (parentExpStat.node.expression.left)
          specifiers = [j.importDefaultSpecifier(parentExpStat.node.expression.left)];

        parentExpStat.replace(
          j.importDeclaration(specifiers, p.node.arguments[0])
        );
      }
    });

  return root.toSource();
}
