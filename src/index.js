module.exports = espresso

var coffeeScript = require('coffee-react')
var jsCodeShift = require('jscodeshift')
var requireToImportTransform = require('./transforms/require-to-import')
var moduleExportsToExportTransform = require('./transforms/module-exports-to-export')
var implicitVariableDeclarationTransform = require('./transforms/implicit-variable-declaration')
var coreTransform = require('./transforms/core')
var jsxTransform = require('./transforms/jsx')

function espresso (content, opts) {
  var newContent = coffeeScript.compile(content, {bare: true})
  var api = {jscodeshift: jsCodeShift}

  if (opts.requireToImport) {
    newContent = requireToImportTransform({ source: newContent }, api)
  }

  if (opts.moduleExportsToExport) {
    newContent = moduleExportsToExportTransform({ source: newContent }, api)
  }

  if (opts.implicitVariableDeclaration) {
    newContent = implicitVariableDeclarationTransform({ source: newContent }, api)
  }

  if (opts.core) {
    newContent = coreTransform({source: newContent}, api)
  }

  if (opts.jsx) {
    newContent = jsxTransform({source: newContent}, api)
  }

  return newContent
}
