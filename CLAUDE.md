# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tooling

Assume Node.js v24 or later, and use new Node.js features freely.

## Project purpose

`find-stale-comments` is a Git pre-commit hook script (TypeScript module run directly in Node.js, without a separate transpilation step) that detects when code was changed without updating the preceding comment. It is intentionally language-agnostic: it treats a comment as pertaining to the code between itself and the first empty line below it.

## Running

The entry point is `index.ts` (ESM module in TypeScript). It is meant to be invoked as a pre-commit hook:

```
node index.ts
```
