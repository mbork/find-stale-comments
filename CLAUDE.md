# find-stale-comments

## What this project does
Git pre-commit hook script that detects when code was changed without updating the corresponding comment.
Intentionally language-agnostic - does not parse syntax, but it treats a comment as corresponding to the code between itself and the first empty line below it.
When no comments are "stale", outputs nothing and exits with status 0.
When one or more comments are stale, outputs a human-readable report and exits with status 1.

## Architecture
A simple `index.ts` script.  No transpilation, uses Node.js native type stripping.

## Commands

### Running
```bash
node index.ts
```

### Testing
```bash
npm run fixtures  # generate fixtures, must be run once before testing and then after modifying `source/`
npm test          # run all tests
npm run coverage  # check test coverage, text output
npm run coverage-report  # check test coverage, open report for a human in the browser
```

### Code quality
```bash
npm run lint       # check code style
npm run typecheck  # check for TypeScript errors
```
A `PostToolUse` hook runs these automatically after each change.
If there are any Eslint errors, run `npm run lint -- --fix` and fix remaining issues yourself.
If there are any type errors, fix them yourself.

## Coding conventions
Assume Node.js v24 or later, and use new Node.js features freely.
Use native Node.js features whenever possible.
Type everything, avoid `any`, avoid `// @ts-ignore` (fix the type errors).
Use ESM in both code and tests.
Make functions unit-testable.
