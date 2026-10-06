/**
 * GraphQL Schema Coordinates (September 2025 edition, section 3.17).
 *
 * A coordinate is not a GraphQL document, so it is its own grammar.
 *
 * @see https://spec.graphql.org/September2025/#sec-Schema-Coordinates
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

export default grammar({
  name: "graphql_schema_coordinate",

  // The spec says no whitespace is allowed inside a coordinate.
  extras: (_) => [],

  word: ($) => $.name,

  rules: {
    source_file: ($) =>
      seq(optional(/\r?\n/), $._schema_coordinate, optional(/\r?\n/)),

    _schema_coordinate: ($) =>
      choice(
        $.directive_argument_coordinate,
        $.directive_coordinate,
        $.argument_coordinate,
        $.member_coordinate,
        $.type_coordinate,
      ),

    type_coordinate: ($) => field("type", $.name),

    member_coordinate: ($) =>
      seq(field("type", $.name), ".", field("member", $.name)),

    argument_coordinate: ($) =>
      seq(
        field("type", $.name),
        ".",
        field("member", $.name),
        "(",
        field("argument", $.name),
        ":",
        ")",
      ),

    directive_coordinate: ($) => seq("@", field("directive", $.name)),

    directive_argument_coordinate: ($) =>
      seq(
        "@",
        field("directive", $.name),
        "(",
        field("argument", $.name),
        ":",
        ")",
      ),

    name: (_) => /[_A-Za-z][_0-9A-Za-z]*/,
  },
});
