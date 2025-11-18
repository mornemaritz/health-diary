# Quickstart: JWT Auth Invite

## Prerequisites

- .NET SDK installed
- Database configured (see data-model.md)
- Environment variables for JWT secret, token expiry, etc.

## Setup

1. Clone the repository and checkout branch `001-jwt-auth-invite`
2. Install dependencies: `dotnet restore`
3. Apply database migrations: `dotnet ef database update`
4. Configure environment variables:
   - JWT_SECRET
   - ACCESS_TOKEN_EXPIRY
   - REFRESH_TOKEN_EXPIRY
   - RATE_LIMIT_SETTINGS

## Running the API

- Start the API: `dotnet run --project src/HealthDiary.Api.csproj`
- API will be available at `http://localhost:5000`

## Usage

- Admin generates invite link via `/admin/invite`
- Invited user registers via `/auth/register` with invite token
- User logs in via `/auth/login` to receive access and refresh tokens
- User refreshes access token via `/auth/refresh`
- Authenticated user accesses protected endpoints with access token

## Testing

- Run unit tests: `dotnet test tests/HealthDiary.Tests.csproj`
- Ensure all tests pass before merging changes

## Reference

- See [data-model.md](./data-model.md) for entities
- See [contracts/api-contracts.md](./contracts/api-contracts.md) for API details
