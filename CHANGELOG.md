# Changelog

## 0.1.0

Targets the GraphQL **September 2025** specification, plus fragment arguments
(experimental). **This release contains breaking changes to the tree shape**, so
queries written against 0.0.x need updating.

### Breaking changes

- `document` is now the root node (`source_file` removed). An empty or
  comment-only document is valid.
- Wrapper nodes removed: `definition`, `type_system_definition`,
  `executable_definition`, `type_definition`, `type_extension`, `selection`,
  `value`, `type` and `directive_location`. They are now hidden supertypes,
  so use e.g. `(object_type_definition)` directly under `(document)`.
- `implements_interfaces`, `union_member_types` and `directive_locations` are
  flat lists rather than left-recursive trees.
- `comma` is no longer a node (commas are whitespace).
- Strings: `string_value` now contains `string_content` and `escape_sequence`
  children; block strings are a single token.
- Fields are labelled: `name`, `value`, `type`, `description`, `operation_type`,
  `variable`.
- `queries/graphql/highlights.scm` moved to `queries/highlights.scm` and uses
  standard capture names (`@variable.parameter`, `@attribute`, `@type.definition`,
  `@string.documentation`, ...). Directives are no longer captured as `@type`.

### Fixed

- Multiple directives on a field (`a @include(if: $x) @skip(if: $y)`).
- String escapes (`\"`, `\n`, `\uXXXX`, `\u{...}`) and block strings containing
  quotes or `\"""`; comments/whitespace could previously match inside strings.
- `extend schema` with several root operations or only directives.
- `extend input` no longer accepts repeated field blocks; bare `extend type A`
  (nothing extended) is now rejected.
- Keywords (`type`, `on`, `query`, ...) can be used as field, argument and enum
  value names (`word` rule).
- Numbers are single tokens.

### Added

- Descriptions on operations, fragments and variable definitions.
- Fragment arguments: `fragment F($x: Int) on T`, `...F(x: 1)`,
  `FRAGMENT_VARIABLE_DEFINITION` (experimental).
- `schema_coordinate/`: a separate grammar for schema coordinates.
- `locals`, `tags`, `folds` and `indents` queries, highlight tests.
- Bindings for C, Go, Node, Python, Rust and Swift (tree-sitter 0.26).

### Notes

- `type A` followed by `{` is always read as a fields block, per the spec's
  lookahead restriction; an anonymous query cannot directly follow a type
  definition with no fields.
- The lexer does not reject a number immediately followed by a name
  (`1a`); validation like that is left to the GraphQL implementation.
