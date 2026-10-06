; Comments and descriptions
;--------------------------

(comment) @comment

; Literals
;---------

(string_value) @string

(description (string_value) @string.documentation)

(escape_sequence) @string.escape

(int_value) @number

(float_value) @number.float

(boolean_value) @boolean

(null_value) @constant.builtin

(enum_value) @constant

; Types
;------

(named_type (name) @type)

(scalar_type_definition name: (name) @type.definition)
(object_type_definition name: (name) @type.definition)
(interface_type_definition name: (name) @type.definition)
(union_type_definition name: (name) @type.definition)
(enum_type_definition name: (name) @type.definition)
(input_object_type_definition name: (name) @type.definition)

(scalar_type_extension name: (name) @type)
(object_type_extension name: (name) @type)
(interface_type_extension name: (name) @type)
(union_type_extension name: (name) @type)
(enum_type_extension name: (name) @type)
(input_object_type_extension name: (name) @type)

; Properties and parameters
;--------------------------

(field name: (name) @property)
(field (alias (name) @property))
(field_definition name: (name) @property)
(object_field name: (name) @property)
(enum_value_definition (enum_value) @constant)

(argument name: (name) @variable.parameter)
(input_value_definition name: (name) @variable.parameter)

; Operations, fragments and variables
;------------------------------------

(operation_definition name: (name) @function)
(fragment_name (name) @function)

(variable (name) @variable)
"$" @variable

; Directives
;-----------

(directive name: (name) @attribute)
(directive "@" @attribute)

(directive_definition name: (name) @attribute)
(directive_definition "@" @attribute)

(executable_directive_location) @constant.builtin
(type_system_directive_location) @constant.builtin

; Keywords
;---------

(operation_type) @keyword

[
  "fragment"
  "scalar"
  "type"
  "interface"
  "union"
  "enum"
  "input"
  "extend"
  "directive"
  "schema"
  "on"
  "repeatable"
  "implements"
] @keyword

; Punctuation
;------------

[ "(" ")" "[" "]" "{" "}" ] @punctuation.bracket

[ "|" "&" ":" ] @punctuation.delimiter

"=" @operator

"..." @punctuation.special
"!" @punctuation.special
