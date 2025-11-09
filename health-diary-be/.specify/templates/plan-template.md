# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

**Language/Version**: c# 13, dotnet9
**Primary Dependencies**: Entity Framework Core  
**Storage**: PostgreSql  
**Testing**: xUnit
**Target Platform**: Linux server
**Project Type**: REST API  
**Performance Goals**: 1000 req/s
**Constraints**: <200ms p95, <100MB memory
**Scale/Scope**: 1k users


## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Code Quality:** All planned code MUST follow style guides, be documented, and avoid anti-patterns. Code review is required for all merges.
- **Testing Standards:** Automated tests MUST be planned for all critical paths, with explicit coverage targets. All tests MUST pass before merge.
- **User Experience Consistency:** API/UX changes MUST be reviewed for consistency and backward compatibility. Response and error formats MUST be standardized.
- **Performance Requirements:** Performance goals and thresholds MUST be explicit. Plans MUST block regressions and define measurable targets.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Option 2: Web application (when "frontend" + "backend" detected)
src/
├── models/
├── services/
├── infrastructure/
└── api/

tests/
├── contract/
├── integration/
└── unit/
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
