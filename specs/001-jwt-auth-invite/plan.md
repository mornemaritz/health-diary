# Implementation Plan: JWT Auth Invite

## Technical Context

- Language: .NET
- Hosting: No constraints
- Authentication: JWT (access & refresh tokens)
- Registration: Invite-only via unique link
- Rate Limiting: 5 attempts/min/IP for registration and login
- Scalability: Up to 10,000 users, 100 req/sec
- Email delivery: Out of scope
- Constitution: See below

## Constitution Check

- Code must be readable, maintainable, documented
- Automated tests required for all critical paths
- Consistent API/UX, standardized error messages
- Performance targets must be defined and met
- Dependencies must be maintained and security-vetted
- Sensitive data handled per best practices
- All changes via PR, CI checks required
- Releases versioned semantically
- Major changes require migration plan

## Phase 0: Research

- All technical unknowns and clarifications from spec are resolved
- No outstanding NEEDS CLARIFICATION
- Best practices for .NET JWT authentication, invite-only registration, and rate limiting will be referenced in research.md

## Next Steps

- Phase 1: Generate data-model.md, contracts/, quickstart.md
- Phase 1: Update agent context
- Re-evaluate Constitution Check post-design
