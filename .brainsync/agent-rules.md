# Project Intelligence (auto-generated)

## Known issues

- gotcha in contact.html
- Never use eval(), exec(), or Function() with user input
- Sanitize ALL user input before database queries — prevent SQL injection
- Don't use innerHTML — use textContent or sanitized rendering
- Don't store passwords in plain text — use bcrypt, argon2, or scrypt
- Use parameterized queries — never string concatenation for SQL
- Never store session tokens in localStorage — use httpOnly cookies
- Don't swallow errors silently — empty catch blocks hide bugs
- Don't fetch data inside render loops or hot paths
- Always validate data on the SERVER — client validation is for UX only

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
- Optimized Your
- decision in typing-speed-test.html
- decision in fastest-reaction-time-ever-recorded.html
- decision in genetics-vs-training-reaction-time.html
- decision in mouse-sensitivity-reaction-time.html
- decision in pro-gamer-reaction-times.html
- decision in reaction-time-age-study.html

## Recent fixes

- Fixed null crash in DOCTYPE — fixes memory leak from uncleared timers
- Fixed null crash in DOCTYPE — fixes memory leak from uncleared timers
- Fixed null crash in DOCTYPE
- Fixed null crash in DOCTYPE — offloads heavy computation off the main thread
- Fixed null crash in DOCTYPE

## How things work

- how-it-works in what-is-reaction-time.html

## 📚 Comprehensive Expert Skills (READ THESE)
> **CRITICAL:** BrainSync has pre-compiled full expert rulebooks for this project. If you are working on any of the following domains, you MUST read the corresponding `SKILL.md` file BEFORE writing code to instantly learn all proper default skills:

- **convention**: Read `.agent/skills/auto/convention/SKILL.md`
- **css**: Read `.agent/skills/auto/css/SKILL.md`
- **html**: Read `.agent/skills/auto/html/SKILL.md`
- **project**: Read `.agent/skills/auto/project/SKILL.md`
