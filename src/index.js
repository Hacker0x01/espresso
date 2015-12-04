module.exports = espresso;

"use strict";

require("babel-register")();

var coffeeScript = require("coffee-react");
var jsCodeShift = require("jscodeshift");
var requireToImportTransform = require("./transforms/require-to-import");
var moduleExportsToExportTransform = require("./transforms/module-exports-to-export");
var implicitVariableDeclarationTransform = require('./transforms/implicit-variable-declaration')
var classMethodTransform = require("./transforms/class-method");
var backboneClassTransform = require("./transforms/backbone-classes");
var defaultParamsTransform = require("./transforms/default-params");
var indexOfTransform = require("./transforms/index-of");
var stringInterpolationTransform = require("./transforms/string-interpolation");
var fatArrowTransform = require("./transforms/fat-arrow");
var forLoopsTransform = require("./transforms/for-loops");
var jsxTransform = require("./transforms/jsx");

function espresso(content, opts) {
  var newContent = coffeeScript.compile(content, { bare: true });
  var api = { jscodeshift: jsCodeShift };

  if (opts.requireToImport) {
    newContent = requireToImportTransform({ source: newContent }, api);
  }

  if (opts.moduleExportsToExport) {
    newContent = moduleExportsToExportTransform({ source: newContent }, api);
  }

  if (opts.classMethod) {
    newContent = classMethodTransform({ source: newContent }, api);
  }

  if (opts.backboneClass) {
    newContent = backboneClassTransform({ source: newContent }, api);
  }

  if (opts.stringInterpolation) {
    newContent = stringInterpolationTransform({ source: newContent }, api);
  }

  if (opts.defaultParams) {
    newContent = defaultParamsTransform({ source: newContent }, api);
  }

  if (opts.indexOf) {
    newContent = indexOfTransform({ source: newContent }, api);
  }

  if (opts.fatArrow) {
    newContent = fatArrowTransform({ source: newContent }, api);
  }

  if (opts.forLoops) {
    newContent = forLoopsTransform({ source: newContent }, api);
  }

  if (opts.jsx) {
    newContent = jsxTransform({ source: newContent }, api);
  }

  if (opts.implicitVariableDeclaration) {
    newContent = implicitVariableDeclarationTransform({ source: newContent }, api)
  }

  return newContent;
}
