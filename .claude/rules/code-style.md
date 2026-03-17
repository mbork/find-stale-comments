---
paths:
  - "**/*.ts"
---

# Code style

Avoid importing functions from modules to the global namespace.  Instead, import the module and qualify the function.  Example:
```
import path from 'node:path';
path.join();
```
is good, while
```
import {join} from 'node:path';
join();
```
is bad.

Follow the conventions in existing code and the rules in eslint.config.js when writing code.
