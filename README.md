# tree-sitter-graphql

[Tree-sitter](https://tree-sitter.github.io) grammar for GraphQL, following the
[September 2025 specification](https://spec.graphql.org/September2025/).

Supported:

- Executable documents (operations, fragments, descriptions on operations,
  fragments and variables)
- Type system definitions and extensions, `@oneOf`, `repeatable` directives
- Block strings and full unicode escapes
- Fragment arguments (experimental, as in graphql-js 17 / Relay)
- Schema coordinates, as a separate grammar in [`schema_coordinate/`](schema_coordinate)

## Development

```sh
npm install
npx tree-sitter generate
npx tree-sitter test
```

Corpus tests live in `test/corpus`, highlight tests in `test/highlight`. See
[CHANGELOG.md](CHANGELOG.md) for notes on node shapes and known limits.

Thanks to [dralletje/tree-sitter-graphql](https://github.com/dralletje/tree-sitter-graphql)
for the original inspiration.
