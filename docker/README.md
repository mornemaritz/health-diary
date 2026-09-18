# Health Diary Docker Setup

This directory contains the Docker configuration for the Health Diary application.

## Services

- **postgres**: PostgreSQL 16 database
- **health-diary-be**: .NET 8 backend API
- **health-diary**: React frontend (Vite)
- **nginx**: Reverse proxy with SSL support

## Quick Start

1. Copy the environment template:

   ```bash
   cp ../.env.example ../.env
   ```

2. Edit `.env` and update the secrets (especially for production):

   ```bash
   # Generate a new PostgreSQL password
   openssl rand -base64 48
   
   # Generate a new JWT secret key
   openssl rand -hex 64
   ```

3. Start all services:

   ```bash
   docker compose up -d
   ```

4. Run database migrations:

   ```bash
   docker compose exec health-diary-be dotnet ef database update
   ```

5. Access the application:
   - Frontend: https://localhost:8443
   - API: https://localhost:8443/api

## Development

For development with hot-reload:

```bash
# Start only the database
docker compose up -d postgres

# Run backend locally
cd ../health-diary-be/src
dotnet run

# Run frontend locally (in another terminal)
cd ../health-diary-ui
npm run dev
```

## Nginx Configuration

The nginx configuration includes:

- SSL/TLS termination
- Automatic HTTP to HTTPS redirect
- API proxy to backend on `/api` path
- Frontend proxy on `/` path
- WebSocket support
- Security headers

## Volumes

- `health-diary-postgres-data`: PostgreSQL data persistence

## Environment Variables

See `../.env.example` for available configuration options.

## Health Checks

- **postgres**: `pg_isready` check every 10s
- **health-diary-be**: HTTP check on `/health` endpoint every 30s

## Logs

View logs for all services:

```bash
docker compose logs -f
```

View logs for a specific service:

```bash
docker compose logs -f health-diary-be
```

## Files

- `../docker-compose.yml` - Compose file defining all services
- `nginx/nginx.conf` - Nginx main config
- `nginx/conf.d/default.conf` - Server configuration (HTTP->HTTPS, TLS termination, proxy to app and API)
- `/etc/letsencrypt/` - Expected to contain SSL certificates (mounted into nginx container)

Self-signed certs (for local testing)

```bash
mkdir -p docker/nginx/certs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout docker/nginx/certs/privkey.pem \
  -out docker/nginx/certs/fullchain.pem \
  -subj "/C=US/ST=State/L=Local/O=Dev/CN=localhost"
```

Start services:

```bash
# from repo root
docker compose up --build
```

Notes

- The nginx config expects the app to listen on port `3000` inside the container (the Dockerfile exposes 3000 and runs `serve -s dist`)
- For production, use real TLS certificates (Let's Encrypt or your CA). Place them in `docker/nginx/certs/` or mount another volume.
- If you need to add additional proxy headers or set a basePath, adjust `conf.d/default.conf` accordingly.
