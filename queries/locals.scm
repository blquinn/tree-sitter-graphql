; Fragments
(fragment_definition (fragment_name (name) @local.definition.type))
(fragment_spread (fragment_name (name) @local.reference))

; Variables (operations and fragment arguments)
(operation_definition) @local.scope
(fragment_definition) @local.scope

(variable_definition (variable (name) @local.definition.var))
(variable (name) @local.reference)
