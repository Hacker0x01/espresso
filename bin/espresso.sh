#! /usr/bin/env node

'use strict'

var nomnom = require('nomnom')
var fs = require('fs')
var path = require('path')
var glob = require('glob')
var minimatch = require('minimatch')

var espresso = require('../src/index.js')

var opts = nomnom
  .script('espresso')
  .options({
    path: {
      position: 0,
      help: 'Files or directory to transform',
      required: true
    },
    match: {
      abbr: 'm',
      help: 'File extensions to target in directory',
      default: '.coffee'
    },
    extension: {
      abbr: 'ext',
      help: 'The extension for transformed files, i.e. .js OR .es6',
      default: '.es6'
    },
    requireToImport: {
      flag: true,
      help: 'Convert require statements to ES2015 import statements',
      default: true
    },
    stringInterpolation: {
      flag: true,
      help: 'Convert concatenated strings to template literals',
      default: true
    },
    backboneClass: {
      flag: true,
      help: 'Convert Backbone classes to .extend calls',
      default: true
    },
    classMethod: {
      flag: true,
      help: 'Convert compatible function declarations to ES2015 class methods',
      default: true
    },
    fatArrow: {
      flag: true,
      help: 'Convert CoffeeScript fat arrow methods to ES2015 fat arrow methods',
      default: true
    },
    moduleExportsToExport: {
      flag: true,
      help: 'Convert module.exports statements to ES2015 exports statements',
      default: true
    },
    implicitVariableDeclaration: {
      flag: true,
      help: 'Convert implicit variable declarations (`var Foo;`) to explicit variable declarations',
      default: true
    },
    forLoops: {
      flag: true,
      help: 'Convert CoffeeScript for..in loops to ES2015 for..of loops (or forEach if the index is used)',
      default: true
    },
    jsx: {
      flag: true,
      help: 'Transform any available React.DOM or Components to JSX',
      default: false
    },
    outDir: {
      abbr: 'o',
      default: 'js'
    }
  })
  .parse()

var files = glob.sync(opts.path, {
  nodir: true
})

files.forEach(function (file) {
  if (minimatch(path.basename(file), opts.match)) {
    console.log('-----------------\n', file, '\n--------------------')
    var content = fs.readFileSync(file).toString()
    var es6Content = espresso(content, opts)

    fs.writeFileSync(opts.outDir + '/' + path.basename(file, opts.match) + opts.extension, es6Content)
  }
})
console.log('Your files have been converted, disaster averted.')
