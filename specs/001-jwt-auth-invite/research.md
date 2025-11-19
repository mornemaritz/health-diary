# Phase 0 Research: Authentication with JWTs, Access & Refresh Tokens (Invite-Only Registration)

## Research Tasks & Findings

### 1. Performance and Scale Targets
- **Decision:** Support up to 10,000 users and 100 requests/sec (per feature spec).
- **Rationale:** Matches explicit requirements in feature spec; higher targets in plan template are not required for this feature.
- **Alternatives considered:** Higher scale (1000 req/s, 100k users) rejected due to lack of business need and increased complexity/cost.

### 2. Memory Constraints
- **Decision:** No explicit memory constraint; follow .NET and hosting best practices (<100MB is a reasonable default for small REST APIs).
- **Rationale:** Spec does not require a specific memory limit; default is sufficient for planned scale.
- **Alternatives considered:** Tighter limits rejected due to risk of premature optimization.

### 3. JWT Authentication Best Practices (.NET REST API)
- **Decision:** Use Microsoft.AspNetCore.Authentication.JwtBearer for access/refresh tokens; store refresh tokens securely (e.g., DB, Redis).
- **Rationale:** Official Microsoft library is well-supported and secure; storing refresh tokens allows for revocation and tracking.
- **Alternatives considered:** Stateless refresh tokens rejected due to inability to revoke/track.

### 4. Invite-Only Registration Links (.NET)
- **Decision:** Store invite links as single-use tokens in DB with expiration; validate on registration.
- **Rationale:** DB-backed tokens allow expiration, single-use, and auditability.
- **Alternatives considered:** Stateless links rejected due to lack of control and security.

### 5. Rate Limiting Registration/Login (.NET REST API)
- **Decision:** Use middleware (e.g., AspNetCoreRateLimit) to enforce per-IP limits (5 attempts/minute).
- **Rationale:** Middleware is configurable, robust, and widely used.
- **Alternatives considered:** Custom implementation rejected due to maintenance burden.

### 6. Secure Password Reset Links (.NET)
- **Decision:** Store password reset tokens in DB with expiration and single-use; validate on reset.
- **Rationale:** DB-backed tokens allow secure, auditable resets.
- **Alternatives considered:** Stateless links rejected for same reasons as invite links.

### 7. Entity Framework Core + PostgreSQL for Authentication
- **Decision:** Use EF Core with migrations for user/auth tables; follow Microsoft identity patterns.
- **Rationale:** EF Core is standard for .NET data access; migrations ensure schema consistency.
- **Alternatives considered:** Dapper/raw SQL rejected for maintainability and lack of identity integration.

---

All "NEEDS CLARIFICATION" items resolved. Ready for Phase 1: Design & Contracts.
