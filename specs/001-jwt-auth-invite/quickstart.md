# Quickstart: JWT Auth Invite

## Prerequisites

- .NET 9 SDK
- PostgreSQL database
- Entity Framework Core
- AspNetCore.Authentication.JwtBearer
- AspNetCoreRateLimit (for rate limiting)

## Setup

1. Clone the repository and checkout the feature branch:
   ```bash
   git clone <repo-url>
   cd health-diary
   git checkout 001-jwt-auth-invite
   ```
2. Configure database connection in `appsettings.json`.
3. Apply EF Core migrations:
   ```bash
   dotnet ef database update --project health-diary-be/src/HealthDiary.Api.csproj
   ```
4. Build and run the backend API:
   ```bash
   dotnet run --project health-diary-be/src/HealthDiary.Api.csproj
   ```

## Running the API

API will be available at `http://localhost:5000`

## Usage

- Admin generates invite link via `/admin/invite`
- Invited user registers via `/register` with invite token
- User logs in via `/login` to receive access and refresh tokens
- User refreshes access token via `/token/refresh`
- Authenticated user accesses protected endpoints with access token
- Password reset via `/password-reset` and `/password-reset/confirm` endpoints

## Testing

- Run unit tests:
   ```bash
   dotnet test health-diary-be/tests/Unit/
   dotnet test health-diary-be/tests/Integration/
   ```
Ensure all tests pass before merging changes

## Reference

- See [data-model.md](./data-model.md) for entities
- See [contracts/auth.yaml](./contracts/auth.yaml) for OpenAPI contract and API details
