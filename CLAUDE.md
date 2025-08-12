# AI Agent Execution Guidelines

Guidelines for AI agent autonomous task execution and decision-making.

## 1. Core Principles
- **Autonomous Execution**: Act immediately with minimal confirmation
- **Quality Maintenance**: Uphold code quality and consistency via automated checks
- **Prioritize Existing**: Edit existing files over creating new ones
- **Fact-Checking**: Verify information sources, avoid speculation
- **Language**: All responses to users must be in **Japanese**
- **Sync Policy**: Changes to `CLAUDE.md` must be mirrored in `CLAUDE_ja.md`
- **Context Compression**: Use English for CLAUDE.md to minimize token usage

## 2. Execution Rules
### Immediate Execution (No confirmation)
- **Code**: Bug fixes, refactoring, performance improvements
- **Files**: Modify/update existing files
- **Tests**: Unit/integration tests (TDD approach)
- **Dependencies**: Add/update/remove packages

### Confirmation Required
- **File System**: Create/delete files
- **Major Changes**: Architecture, folder structure
- **External Integration**: New APIs, libraries
- **Critical Changes**: Security, DB schema, production

## 3. Development Workflow
- **TDD Cycle**: Red (fail) → Green (minimal) → Refactor (improve)
- **Change Management**: Separate structural changes from behavioral changes in commits
- **Commits**: Single logical unit, all tests pass, zero warnings
- **Implementation**: Simple first → test coverage → refactor

## 4. Quality Standards
- **Design**: Single Responsibility Principle, loose coupling
- **Code**: DRY principle, avoid hardcoding (use constants/env vars)
- **Error Handling**: Propose 3 alternatives if unable to execute; complete partial tasks and specify remaining work

## 5. Execution Constraints
- **Web Search**: Forbidden; use `gemini --prompt "WebSearch: <query>"`
- **vitest**: Use `npx vitest run [file]` only (no interactive modes)
- **Dev Server**: Prohibited; use static checks (`npm run build`, `npm run lint`, `npx tsc --noEmit`)
- **Docker Requirement**: All npm operations, playwright tests, and screenshots must execute in Docker containers
  - playwright: `docker exec hime-sagashi-playwright-mcp-1 npx playwright test [file]`
  - screenshots: `docker exec hime-sagashi-playwright-mcp-1 node /workspace/screenshot-manager.js take <URL> <basename>`
- **Storage**: Screenshots saved as `screenshot/YYYYMMDD_HHmmssSSS_basename.png`

## 6. Completion Reports
- **Partial**: "## Execution Complete\n### Changes\n- [details]\n### Next Steps\n- [actions]"
- **Full**: "May the Force be with you."

## 7. Custom Commands
Available in `.claude/commands/`: **claude-update** (update guidelines), **pr-create** (automated PR). Commands execute in **Japanese** for users, English for docs.
