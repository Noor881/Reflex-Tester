# Project Intelligence (auto-generated)

## Known issues

- Never use eval(), exec(), or Function() with user input
- Sanitize ALL user input before database queries — prevent SQL injection
- Don't use innerHTML — use textContent or sanitized rendering
- Don't store passwords in plain text — use bcrypt, argon2, or scrypt
- Use parameterized queries — never string concatenation for SQL
- Never store session tokens in localStorage — use httpOnly cookies
- Don't swallow errors silently — empty catch blocks hide bugs
- Don't fetch data inside render loops or hot paths
- Always validate data on the SERVER — client validation is for UX only
- Don't expose database errors to clients — map to user-friendly messages

## Project patterns

- Don't commit node_modules, __pycache__, build/, dist/ — add to .gitignore
- Use meaningful commit messages in imperative mood: "Add feature" not "Added feature"
- Always pull before push to avoid conflicts
- Remove unused imports, variables, and dead code
- Keep functions under 50 lines and single-responsibility
- Handle edge cases: empty arrays, empty strings, null, undefined, 0, NaN
- Use constants for magic numbers and strings
- Implement rate limiting on login endpoints to prevent brute force
- Hash passwords with cost factor ≥12 (bcrypt) or memory ≥64MB (argon2)
- Always wrap async/await in try/catch

## Architectural decisions

- Optimized Reflex
