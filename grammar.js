/**
 * GraphQL grammar, targeting the September 2025 edition of the specification
 * plus fragment arguments (experimental).
 *
 * @see https://spec.graphql.org/September2025/
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

export default grammar({
  name: "graphql",

  extras: ($) => [/[\s\uFEFF]/, ",", $.comment],

  word: ($) => $.name,

  supertypes: ($) => [
    $._definition,
    $._selection,
    $._value,
    $._type,
    $._directive_location,
  ],

  rules: {
    document: ($) => repeat($._definition),

    _definition: ($) =>
      choice(
        // Executable
        $.operation_definition,
        $.fragment_definition,
        // Type system
        $.schema_definition,
        $.scalar_type_definition,
        $.object_type_definition,
        $.interface_type_definition,
        $.union_type_definition,
        $.enum_type_definition,
        $.input_object_type_definition,
        $.directive_definition,
        // Extensions
        $.schema_extension,
        $.scalar_type_extension,
        $.object_type_extension,
        $.interface_type_extension,
        $.union_type_extension,
        $.enum_type_extension,
        $.input_object_type_extension,
      ),

    // ---------------------------------------------------------------------
    // Executable definitions
    // ---------------------------------------------------------------------

    operation_definition: ($) =>
      choice(
        $.selection_set,
        seq(
          optional(field("description", $.description)),
          field("operation_type", $.operation_type),
          optional(field("name", $.name)),
          optional($.variable_definitions),
          optional($.directives),
          $.selection_set,
        ),
      ),

    operation_type: (_) => choice("query", "mutation", "subscription"),

    variable_definitions: ($) => seq("(", repeat1($.variable_definition), ")"),

    variable_definition: ($) =>
      seq(
        optional(field("description", $.description)),
        field("variable", $.variable),
        ":",
        field("type", $._type),
        optional($.default_value),
        optional($.directives),
      ),

    default_value: ($) => seq("=", $._value),

    selection_set: ($) => seq("{", repeat1($._selection), "}"),

    _selection: ($) => choice($.field, $.inline_fragment, $.fragment_spread),

    field: ($) =>
      seq(
        optional($.alias),
        field("name", $.name),
        optional($.arguments),
        optional($.directives),
        optional($.selection_set),
      ),

    alias: ($) => seq($.name, ":"),

    arguments: ($) => seq("(", repeat1($.argument), ")"),

    argument: ($) => seq(field("name", $.name), ":", field("value", $._value)),

    fragment_spread: ($) =>
      seq(
        "...",
        $.fragment_name,
        optional($.arguments), // fragment arguments (experimental)
        optional($.directives),
      ),

    inline_fragment: ($) =>
      seq(
        "...",
        optional($.type_condition),
        optional($.directives),
        $.selection_set,
      ),

    fragment_definition: ($) =>
      seq(
        optional(field("description", $.description)),
        "fragment",
        $.fragment_name,
        optional($.variable_definitions), // fragment arguments (experimental)
        $.type_condition,
        optional($.directives),
        $.selection_set,
      ),

    fragment_name: ($) => $.name,

    type_condition: ($) => seq("on", $.named_type),

    // ---------------------------------------------------------------------
    // Values
    // ---------------------------------------------------------------------

    _value: ($) =>
      choice(
        $.variable,
        $.int_value,
        $.float_value,
        $.string_value,
        $.boolean_value,
        $.null_value,
        $.enum_value,
        $.list_value,
        $.object_value,
      ),

    variable: ($) => seq("$", $.name),

    int_value: (_) => token(seq(optional("-"), choice("0", /[1-9][0-9]*/))),

    float_value: (_) => {
      const integer = seq(optional("-"), choice("0", /[1-9][0-9]*/));
      const fraction = seq(".", /[0-9]+/);
      const exponent = seq(/[eE]/, optional(/[+-]/), /[0-9]+/);
      return token(
        seq(integer, choice(seq(fraction, optional(exponent)), exponent)),
      );
    },

    string_value: ($) =>
      choice(
        $._block_string,
        seq(
          '"',
          repeat(
            choice(
              alias(token.immediate(prec(1, /[^"\\\r\n]+/)), $.string_content),
              $.escape_sequence,
            ),
          ),
          token.immediate('"'),
        ),
      ),

    // Block strings are a single token. A triple quote can only appear when
    // escaped as `\"""`; one or two quotes may appear unescaped.
    _block_string: (_) =>
      token(
        seq(
          '"""',
          repeat(
            choice(
              /[^"\\]/,
              /\\/,
              '\\"""',
              /"[^"\\]/,
              /""[^"\\]/,
              /"\\/,
              /""\\/,
            ),
          ),
          '"""',
        ),
      ),

    escape_sequence: (_) =>
      token.immediate(
        seq(
          "\\",
          choice(/["\\/bfnrt]/, /u[0-9A-Fa-f]{4}/, /u\{[0-9A-Fa-f]+\}/),
        ),
      ),

    boolean_value: (_) => choice("true", "false"),

    null_value: (_) => "null",

    enum_value: ($) => $.name,

    list_value: ($) => seq("[", repeat($._value), "]"),

    object_value: ($) => seq("{", repeat($.object_field), "}"),

    object_field: ($) =>
      seq(field("name", $.name), ":", field("value", $._value)),

    // ---------------------------------------------------------------------
    // Directives
    // ---------------------------------------------------------------------

    directives: ($) => repeat1($.directive),

    directive: ($) => seq("@", field("name", $.name), optional($.arguments)),

    // ---------------------------------------------------------------------
    // Types
    // ---------------------------------------------------------------------

    _type: ($) => choice($.named_type, $.list_type, $.non_null_type),

    named_type: ($) => $.name,

    list_type: ($) => seq("[", $._type, "]"),

    non_null_type: ($) => seq(choice($.named_type, $.list_type), "!"),

    // ---------------------------------------------------------------------
    // Type system definitions
    // ---------------------------------------------------------------------

    schema_definition: ($) =>
      seq(
        optional(field("description", $.description)),
        "schema",
        optional($.directives),
        $._root_operation_types,
      ),

    _root_operation_types: ($) =>
      seq("{", repeat1($.root_operation_type_definition), "}"),

    root_operation_type_definition: ($) =>
      seq($.operation_type, ":", $.named_type),

    scalar_type_definition: ($) =>
      seq(
        optional(field("description", $.description)),
        "scalar",
        field("name", $.name),
        optional($.directives),
      ),

    object_type_definition: ($) =>
      prec.right(
        seq(
          optional(field("description", $.description)),
          "type",
          field("name", $.name),
          optional($.implements_interfaces),
          optional($.directives),
          optional($.fields_definition),
        ),
      ),

    interface_type_definition: ($) =>
      prec.right(
        seq(
          optional(field("description", $.description)),
          "interface",
          field("name", $.name),
          optional($.implements_interfaces),
          optional($.directives),
          optional($.fields_definition),
        ),
      ),

    union_type_definition: ($) =>
      seq(
        optional(field("description", $.description)),
        "union",
        field("name", $.name),
        optional($.directives),
        optional($.union_member_types),
      ),

    enum_type_definition: ($) =>
      prec.right(
        seq(
          optional(field("description", $.description)),
          "enum",
          field("name", $.name),
          optional($.directives),
          optional($.enum_values_definition),
        ),
      ),

    input_object_type_definition: ($) =>
      prec.right(
        seq(
          optional(field("description", $.description)),
          "input",
          field("name", $.name),
          optional($.directives),
          optional($.input_fields_definition),
        ),
      ),

    implements_interfaces: ($) =>
      seq(
        "implements",
        optional("&"),
        $.named_type,
        repeat(seq("&", $.named_type)),
      ),

    fields_definition: ($) => seq("{", repeat1($.field_definition), "}"),

    field_definition: ($) =>
      seq(
        optional(field("description", $.description)),
        field("name", $.name),
        optional($.arguments_definition),
        ":",
        field("type", $._type),
        optional($.directives),
      ),

    arguments_definition: ($) =>
      seq("(", repeat1($.input_value_definition), ")"),

    input_fields_definition: ($) =>
      seq("{", repeat1($.input_value_definition), "}"),

    input_value_definition: ($) =>
      seq(
        optional(field("description", $.description)),
        field("name", $.name),
        ":",
        field("type", $._type),
        optional($.default_value),
        optional($.directives),
      ),

    union_member_types: ($) =>
      seq("=", optional("|"), $.named_type, repeat(seq("|", $.named_type))),

    enum_values_definition: ($) =>
      seq("{", repeat1($.enum_value_definition), "}"),

    enum_value_definition: ($) =>
      seq(
        optional(field("description", $.description)),
        $.enum_value,
        optional($.directives),
      ),

    directive_definition: ($) =>
      seq(
        optional(field("description", $.description)),
        "directive",
        "@",
        field("name", $.name),
        optional($.arguments_definition),
        optional("repeatable"),
        "on",
        $.directive_locations,
      ),

    directive_locations: ($) =>
      seq(
        optional("|"),
        $._directive_location,
        repeat(seq("|", $._directive_location)),
      ),

    _directive_location: ($) =>
      choice($.executable_directive_location, $.type_system_directive_location),

    executable_directive_location: (_) =>
      choice(
        "QUERY",
        "MUTATION",
        "SUBSCRIPTION",
        "FIELD",
        "FRAGMENT_DEFINITION",
        "FRAGMENT_SPREAD",
        "INLINE_FRAGMENT",
        "VARIABLE_DEFINITION",
        "FRAGMENT_VARIABLE_DEFINITION", // experimental
      ),

    type_system_directive_location: (_) =>
      choice(
        "SCHEMA",
        "SCALAR",
        "OBJECT",
        "FIELD_DEFINITION",
        "ARGUMENT_DEFINITION",
        "INTERFACE",
        "UNION",
        "ENUM",
        "ENUM_VALUE",
        "INPUT_OBJECT",
        "INPUT_FIELD_DEFINITION",
      ),

    // ---------------------------------------------------------------------
    // Type system extensions
    //
    // Every extension must add *something*; a bare `extend type Foo` is
    // invalid.
    // ---------------------------------------------------------------------

    schema_extension: ($) =>
      prec.right(
        seq(
          "extend",
          "schema",
          choice(
            seq(optional($.directives), $._root_operation_types),
            $.directives,
          ),
        ),
      ),

    scalar_type_extension: ($) =>
      seq("extend", "scalar", field("name", $.name), $.directives),

    object_type_extension: ($) =>
      prec.right(
        seq(
          "extend",
          "type",
          field("name", $.name),
          choice(
            seq(
              $.implements_interfaces,
              optional($.directives),
              optional($.fields_definition),
            ),
            seq($.directives, optional($.fields_definition)),
            $.fields_definition,
          ),
        ),
      ),

    interface_type_extension: ($) =>
      prec.right(
        seq(
          "extend",
          "interface",
          field("name", $.name),
          choice(
            seq(
              $.implements_interfaces,
              optional($.directives),
              optional($.fields_definition),
            ),
            seq($.directives, optional($.fields_definition)),
            $.fields_definition,
          ),
        ),
      ),

    union_type_extension: ($) =>
      seq(
        "extend",
        "union",
        field("name", $.name),
        choice(
          seq($.directives, optional($.union_member_types)),
          $.union_member_types,
        ),
      ),

    enum_type_extension: ($) =>
      prec.right(
        seq(
          "extend",
          "enum",
          field("name", $.name),
          choice(
            seq($.directives, optional($.enum_values_definition)),
            $.enum_values_definition,
          ),
        ),
      ),

    input_object_type_extension: ($) =>
      prec.right(
        seq(
          "extend",
          "input",
          field("name", $.name),
          choice(
            seq($.directives, optional($.input_fields_definition)),
            $.input_fields_definition,
          ),
        ),
      ),

    // ---------------------------------------------------------------------
    // Lexical
    // ---------------------------------------------------------------------

    description: ($) => $.string_value,

    name: (_) => /[_A-Za-z][_0-9A-Za-z]*/,

    comment: (_) => token(seq("#", /[^\r\n]*/)),
  },
});
