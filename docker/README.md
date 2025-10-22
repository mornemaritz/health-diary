# Docker compose + Nginx for health-diary

This folder contains a docker-compose setup and Nginx configuration to serve the `health-diary-ui` app with SSL termination.

Files added:
- `../docker-compose.yml` - Compose file that builds the `health-diary` app and runs an Nginx reverse proxy
- `nginx/nginx.conf` - Nginx main config
- `nginx/conf.d/default.conf` - Server configuration (HTTP->HTTPS, TLS termination, proxy to app)
- `nginx/certs/` - expected to contain `fullchain.pem` and `privkey.pem` mounted into the container

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
