module.exports = espresso

'use strict'

require('babel-register')();

var coffeeScript = require('coffee-react')
var jsCodeShift = require('jscodeshift')
var requireToImportTransform = require('./transforms/require-to-import')
var moduleExportsToExportTransform = require('./transforms/module-exports-to-export')
// var implicitVariableDeclarationTransform = require('./transforms/implicit-variable-declaration')
var classMethodTransform = require('./transforms/class-method')
var fatArrowTransform = require('./transforms/fat-arrow')
var forLoopsTransform = require('./transforms/for-loops')
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

  if (opts.classMethod) {
    newContent = classMethodTransform({ source: newContent }, api)
  }

  if (opts.fatArrow) {
    newContent = fatArrowTransform({ source: newContent }, api)
  }

  // if (opts.implicitVariableDeclaration) {
  //   newContent = implicitVariableDeclarationTransform({ source: newContent }, api)
  // }

  if (opts.forLoops) {
    newContent = forLoopsTransform({ source: newContent }, api)
  }

  if (opts.jsx) {
    newContent = jsxTransform({source: newContent}, api)
  }

  return newContent
}
