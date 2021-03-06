module.exports = classMethod;

function classMethod(file, api) {
  var j = api.jscodeshift;
  var root = j(file.source);

  var CLASS_METHOD = {
    value: {
      type: "FunctionExpression"
    }
  };

  root
    .find(j.Property, CLASS_METHOD)
    .replaceWith(p => {
      var prop = j.property(
        p.node.kind,
        p.node.key,
        j.functionExpression(
          null,
          p.node.value.params,
          p.node.value.body
        )
      );

      prop.method = true;
      return prop;
    });

  return root.toSource();
}
