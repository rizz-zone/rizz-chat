# Drizzle ORM Notes

## Duplicate Package / Cross-Package Type Errors

**Symptom:** Type errors when one package uses a function/type from another package that is based on a drizzle type — types appear structurally identical but TypeScript rejects them.

**Cause:** drizzle-orm has many peer dependencies. If they fall out of sync across packages, pnpm deduplicates incorrectly and resolves **two separate copies** of drizzle-orm. TypeScript treats these as unrelated — a type from copy A is not assignable to copy B even if they look the same.

**Diagnose:**
```bash
pnpm why drizzle-orm
```
Look for more than one resolved location.

**Fix:**
- Align all drizzle peer deps (`@libsql/client`, etc.) to matching versions across all packages
- Use pnpm catalog entries (`pnpm-workspace.yaml` `catalog:`) to pin shared deps
- Run `pnpm install` after to deduplicate

**Note:** This is easy to misdiagnose as a schema or logic bug. If cross-package drizzle types refuse to line up with no obvious reason, check for duplication first.
