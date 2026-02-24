# OneCompany Design (Approved)

Date: 2026-02-23

## Decisions

- Product mode: hybrid (web + automation/MCP)
- Delivery strategy: CLI first
- Stack: TypeScript
- Repository pattern: monorepo + plugin-like flows
- Takeover v0.1 scope: local directory only
- Interaction model: guided interactive wizard
- Knowledge base: markdown docs in repo

## Architecture

- `apps/cli`: menu and guided prompts
- `packages/core`: shared domain logic, templates, scanners, flow runners
- `packages/flow-new-project`: new project orchestration wrapper
- `packages/flow-takeover`: takeover analysis wrapper
- `packages/flow-iterate`: iteration orchestration wrapper
- `packages/skills-catalog`: role -> skills mapping + task-based routing

## Required docs per project

- `docs/00-project-brief.md`
- `docs/01-architecture.md`
- `docs/02-prd.md`
- `docs/03-task-board.md`
- `docs/04-dev-log.md`
- `docs/05-change-log.md`

## Workflow

1. Brainstorm and clarify goals/constraints
2. Write implementation plan
3. Execute with role-appropriate skill bundle
4. Apply quality gates before completion
5. Finalize branch/release notes
