module.exports = {
    "rules": {
        "indent": [2, 2],
        "quotes": [2, "double"],
        "linebreak-style": [2, "unix"],
        "semi": [2, "always"],
        "array-bracket-spacing": [2, "never"],
        "block-spacing": [2, "always"],
        "brace-style": [2],
        "comma-spacing": [
          2,
          {
            "before": false,
            "after": true
          }
        ],
        "computed-property-spacing": [2],
        "consistent-this": [2, "self"],
        "eol-last": [2],
        "key-spacing": [2],
        "newline-after-var": [2, "always"],
        "no-lonely-if": [2],
        "no-multiple-empty-lines": [2, {"max": 1}],
        "no-nested-ternary": [2],
        "no-spaced-func": [2],
        "no-trailing-spaces": [2],
        "no-unneeded-ternary": [2],
        "object-curly-spacing": [2, "always"],
        "one-var": [2, "never"],
        "padded-blocks": [2, "never"],
        "semi-spacing": [2],
        "space-after-keywords": [2],
        "space-before-keywords": [2],
        "space-before-blocks": [2],
        "space-before-function-paren": [2, "never"],
        "space-in-parens": [2],
        "space-infix-ops": [2],
        "space-return-throw-case": [2],
        "space-unary-ops": [2],
        "spaced-comment": [2, "always"],
        "arrow-body-style": [2],
        "arrow-parens": [2, "as-needed"],
        "arrow-spacing": [2],
        "constructor-super": [2],
        "no-arrow-condition": [2],
        "no-const-assign": [2],
        "object-shorthand": [2],
        "prefer-arrow-callback": [2],
        "prefer-const": [2],
        "prefer-spread": [2],
        "prefer-template": [2]
    },
    "env": {
        "es6": true,
        "node": true
    },
    "extends": "eslint:recommended"
};
