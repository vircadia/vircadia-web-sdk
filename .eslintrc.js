//
//  .eslintrc.js
//
//  Created by David Rowe on 24 Nov 2020.
//  Copyright 2020 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

module.exports = {

    root: true,

    extends: "eslint:recommended",

    "env": {
        "es2020": true,
        "browser": true,
        "worker": true,
        "node": true
    },

    // FIXME: Use the @babel/eslint-parser instead of the outdated babel-eslint parser.
    // Though VS Code works with the @babel/eslint-parser, Visual Studio 2019 doesn't, so the old parser is being used for now.
    "parser": "babel-eslint",

    "parserOptions": {
        "ecmaVersion": 2020,
        "sourceType": "module"
    },

    globals: {
        "module": "readonly"
    },

    rules: {
        // Current ESLint version: 6.8

        // Possible errors.
        "no-await-in-loop": "error",
        // "no-console": "error",
        "no-extra-parens": ["error", "functions"],
        // "no-loss-of-precision": "error",  // ESLint 7.1.0
        // "no-promise-executor-return": "error",  // ESLint 7.3.0
        "no-template-curly-in-string": "error",
        // "no-unreachable-loop": "error",  // ESLint 7.3.0
        // "no-unsafe-optional-chaining": "error",  // ESLint 7.15.0
        // "no-useless-backreference": "error",  // ESLint 7.0.0
        "require-atomic-updates": "error",

        // Best practices.
        "accessor-pairs": "error",
        "array-callback-return": "error",
        "block-scoped-var": "error",
        "class-methods-use-this": "error",
        "consistent-return": "error",
        "curly": "error",
        "default-case": "error",
        // "default-case-last": "error",  // ESLint 7.0.0
        "default-param-last": "error",
        "dot-location": ["error", "property"],
        "dot-notation": ["error", { "allowKeywords": false }],
        "eqeqeq": "error",
        "grouped-accessor-pairs": "error",
        "guard-for-in": "error",
        "no-caller": "error",
        "no-constructor-return": "error",
        "no-else-return": ["error", { allowElseIf: false }],
        "no-empty-function": "error",
        "no-eval": ["error"],
        "no-extend-native": "error",
        "no-extra-bind": "error",
        "no-extra-label": "error",
        "no-floating-decimal": "error",
        "no-implicit-coercion": "error",
        "no-implicit-globals": "error",
        "no-implied-eval": ["error"],
        "no-invalid-this": "error",
        "no-iterator": "error",
        "no-labels": "error",
        "no-lone-blocks": "error",
        "no-loop-func": "error",
        "no-magic-numbers": ["error", { "ignore": [-1, 0, 1, 2] }],
        "no-multi-spaces": ["error", { ignoreEOLComments: true }],
        "no-multi-str": "error",
        "no-new": "error",
        "no-new-func": "error",
        "no-new-wrappers": "error",
        "no-octal-escape": "error",
        "no-param-reassign": "error",
        "no-proto": "error",
        "no-return-assign": "error",
        "no-return-await": "error",
        "no-script-url": "error",
        "no-self-compare": "error",
        "no-sequences": "error",
        "no-throw-literal": "error",
        "no-unmodified-loop-condition": "error",
        "no-unused-expressions": "error",
        "no-useless-call": "error",
        "no-useless-concat": "error",
        "no-useless-return": "error",
        "no-void": "error",
        "prefer-named-capture-group": "error",
        "prefer-promise-reject-errors": "error",
        "prefer-regex-literals": "error",
        "radix": "error",
        "require-await": "error",
        "require-unicode-regexp": "error",
        "vars-on-top": "error",
        "wrap-iife": ["error", "outside"],
        "yoda": "error",

        // Strict mode.
        "strict": ["error", "safe"],

        // Variables
        "init-declarations": ["error", "always"],
        "no-label-var": "error",
        "no-restricted-globals": ["error", "event", "fdescribe"],
        "no-shadow": ["error", { "builtinGlobals": false }],
        "no-use-before-define": "error",

        // Stylistic issues.
        "array-bracket-newline": ["error", { "multiline": true }],
        "array-bracket-spacing": ["error", "never"],
        "array-element-newline": ["error", "consistent"],
        "block-spacing": "error",
        "brace-style": "error",
        "camelcase": "error",
        "comma-dangle": ["error", "never"],
        "comma-spacing": "error",
        "comma-style": "error",
        "computed-property-spacing": "error",
        "consistent-this": ["error", "self"],
        "eol-last": "error",
        "func-call-spacing": ["error", "never"],
        "func-style": ["error", "declaration", { "allowArrowFunctions": true }],
        "implicit-arrow-linebreak": ["error", "beside"],
        "indent": ["error", 4, { "SwitchCase": 1, "outerIIFEBody": 1 }],  // eslint-disable-line no-magic-numbers
        "jsx-quotes": ["error", "prefer-double"],
        "key-spacing": "error",
        "keyword-spacing": "error",
        "max-len": ["error", { "code": 128, "tabWidth": 4 }],
        "multiline-ternary": ["error", "always-multiline"],
        "new-cap": "error",
        "new-parens": "error",
        "newline-per-chained-call": ["error", { "ignoreChainWithDepth": 2 }],
        "no-array-constructor": "error",
        "no-continue": "error",
        "no-lonely-if": "error",
        "no-multiple-empty-lines": ["error", { "max": 2, "maxBOF": 0, "maxEOF": 0 }],
        "no-nested-ternary": "error",
        "no-new-object": "error",
        "no-plusplus": ["error", { "allowForLoopAfterthoughts": true }],
        "no-tabs": "error",
        "no-trailing-spaces": "error",
        "no-unneeded-ternary": "error",
        "no-whitespace-before-property": "error",
        "object-curly-newline": "error",
        "object-curly-spacing": ["error", "always"],
        "one-var": ["error", "never"],
        "operator-linebreak": ["error", "before"],
        "prefer-exponentiation-operator": "error",
        "prefer-object-spread": "error",
        "quotes": ["error", "double", { "allowTemplateLiterals": true }],
        "semi": ["error", "always"],
        "semi-spacing": "error",
        "semi-style": "error",
        "space-before-blocks": "error",
        "space-before-function-paren": [
            "error", {
                "anonymous": "always",
                "named": "never",
                "asyncArrow": "always"
            }
        ],
        "space-in-parens": "error",
        "space-infix-ops": "error",
        "space-unary-ops": [
            "error", {
                "words": true,
                "nonwords": false
            }
        ],
        "spaced-comment": "error",
        "switch-colon-spacing": "error",
        "template-tag-spacing": "error",
        "unicode-bom": "error",
        "wrap-regex": "error",

        // ECMAScript 6
        "arrow-body-style": ["error", "as-needed"],
        "arrow-parens": "error",
        "arrow-spacing": "error",
        "generator-star-spacing": "error",
        "no-confusing-arrow": "error",
        "no-duplicate-imports": "error",
        "no-useless-computed-key": "error",
        "no-useless-constructor": "error",
        "no-useless-rename": "error",
        "no-var": "error",
        "object-shorthand": ["error", "properties"],
        "prefer-const": "error",
        "prefer-rest-params": "error",
        "prefer-spread": "error",
        "rest-spread-spacing": "error",
        "symbol-description": "error",
        "template-curly-spacing": "error",
        "yield-star-spacing": "error"

    }
};
