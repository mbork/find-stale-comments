---
paths:
  - "tests/**/*"
---

# Testing

Test framework: `node:test` (built-in).

Most tests are **unit tests** that test individual functions exported from `index.ts`. They use
fixture files from `tests/fixtures/`: `.patch` files are parsed by `parse-diff` and passed to the
detection logic; `.ante.*` files provide the old file content. Neither `simple-git` nor
`parse-diff` need to be mocked.

A small number of **integration tests** cover the full pipeline: each creates a temporary git repo,
writes and stages files, runs the script, and asserts on its output.

## Fixture files

Fixtures live in `tests/fixtures/` and are **not committed** — they are listed in `.gitignore`.
Each fixture consists of two files:

- A `.patch` file (unified diff), parsed by `parse-diff` and passed to the detection logic.
- An `.ante.*` file (the "old" file content), used as the pre-change file in tests.

Fixtures are generated from **source pairs** in `tests/source/`: for each test case there is a
`<name>.ante.<ext>` file (old content) and a `<name>.post.<ext>` file (new/staged content).
These source pairs **are committed** and are the source of truth for what each fixture represents.

Run `npm run fixtures` to regenerate. The generator (`tests/generate-fixtures.ts`):

1. Copies each `.ante.*` file from `tests/source/` to `tests/fixtures/`.
2. Runs `git diff --no-index` on the ante/post pair and saves the output as a `.patch` file.

## Test coverage

Run `npm run coverage` to check test coverage.

## Fixture utils

The `tests/fixture-utils.ts` module contains function useful in more than one test file.
