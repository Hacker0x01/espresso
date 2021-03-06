# CAUTION: Please be advised that this project is still under active development.
Because of the nature of this project (reverse engineering CoffeeScript patterns in JavaScript), I don't
think that it'll be likely that this tool will ever be ready to convert every CoffeeScript codebase to
ES6. It should be used as a helpful tool, and the changes should still be reviewed.

# Espresso
A quick shot of ES6 instead that old Coffee.

This is a command line tool for converting CoffeeScript files into their ES6 equivalents*.

*As close as possible, anyway.

Available through NPM

```bash
npm install espresso-transformer
```

Using as CLI:
Espresso will look for `.coffee` files if a directory is passed in as the first argument, and write the new `.es6` files to the same directory.

(Given there is a directory called coffeescript)
```bash
espresso coffeescript/
```

To add the JSX transformer:

```bash
espresso coffeescript/ --jsx
```

To change which files to look for:

```bash
espresso coffeescript/ --match .coffeescript
```

To change the file type being written after transformation:

```
espresso coffeescript/ --extension .js
```

---

## Transformers

Core (default) transformer includes:
- CommonJS `require`s -> ES2015 `import`s
- CommonJS `module.exports` -> ES2015 `export default`
- CoffeeScript fat arrow function => ES2015 fat arrow function
- ES5 property function -> ES2015 object method

JSX transformer includes:
- React.DOM elements -> JSX element
- React component factory -> JSX element

TODO:
- [ ] React.createElement


## Up and Running (Development)
After cloning this repo:

```bash
npm install
npm link
espresso --help
```
