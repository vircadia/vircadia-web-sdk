
# Vircadia Web SDK Coding Standard


## File Locations

The source code is kept in the `/src` directory.

Unit and integration tests are kept in the `/tests` directory.
- Test files have the same relative path and file name as the source code files they test.
- Unit tests have file extensions `.unit.test.js`.
- Integration tests have file extensions `.integration.test.js`.


## General Rules

The [Vircadia Coding Standard](https://github.com/vircadia/vircadia/blob/master/CODING_STANDARD.md) should be followed, where
applicable.


## Linting Rules

A quite strict set of TypeScript and ESLint rules is configured to help avoid common pitfalls and ensure a consistent style to
aid maintenance:
- `tsconfig.json`
- `.eslintrc.js`


## TypeScript Conventions

### Private, protected, and public

In public API code, JavaScript's `#` should be used for private members so that their privacy is enforce at runtime.

In internal SDK code, TypeScript's `private`, `protected`, and `public` modifiers should be used because they are more
expressive and it is OK to enforce their semantics at compile time.

### Document Return Types

Methods' return types should always be explicitly specified even if TypeScript can automatically determine the return type from
the current code &mdash; the code may change and any changes in the return type shoulds be flagged.

### Unused function parameters

**TODO**


## Implementation Patterns

### File Code Order

Code in a file should be ordered as follows:
- Imports. In directory order then alphabetical order.
- Public types.
- Private types.

`class {`
- JSDoc for types.
- Public static items.
- Private static items.
- Private member variables.
- Constructor.
- Public property setters and getters.
- Public methods.
- Public slots.
- Public signals' getters for.
- Private methods.
- Private slots.
- Private signals' getters for.

`}`
- Exports.

JSDoc directly adjacent to `type` statements isn't recognized, hence why it is included inside the `class { ... }` or other
top-level block.

Signals and slots, here, refer to the Qt-style signals and slots implemented by `Signal` in the `/domain` library files.

### Following the C++

Code in the `/domain` library and associated API files should follow C++ equivalent code per
[DOMAIN.md](/src/domain/DOMAIN/md).
