module.exports = function removeVariableDeclarator(variableName, path, api) {
  var j = api.jscodeshift;

  j(path)
    .find(j.VariableDeclarator, {
      id: {
        type: 'Identifier',
        name: variableName
      }
    })
    .forEach(extendDeclaration => {
      var declarations = extendDeclaration.parent.value.declarations;
      var indexOfDeclarator = declarations.indexOf(extendDeclaration.value);

      declarations.splice(indexOfDeclarator, 1);

      if (declarations.length === 0) {
        j(extendDeclaration.parent).remove();
      }
    });
}
