module.exports = espresso

var coffeeScript = require('coffee-react')
var jsCodeShift = require('jscodeshift')
var requireToImportTransform = require('./transforms/require-to-import')
var coreTransform = require('./transforms/core')
var jsxTransform = require('./transforms/jsx')

function espresso (content, opts) {
  var newContent = coffeeScript.compile(content, {bare: true})
  var api = {jscodeshift: jsCodeShift}

  if (opts.requireToImport) {
    newContent = requireToImportTransform({ source: newContent }, api)
  }

  if (opts.core) {
    newContent = coreTransform({source: newContent}, api)
  }

  if (opts.jsx) {
    newContent = jsxTransform({source: newContent}, api)
  }

  return newContent
}
