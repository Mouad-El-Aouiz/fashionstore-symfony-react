# FashionStore API

REST API for the FashionStore React storefront, built with Symfony 7.4, Doctrine
ORM, and PostgreSQL 16.

## Requirements

- Docker Desktop with Docker Compose

## Local setup

From `backend-symfony` in PowerShell:

```powershell
Copy-Item .env.example .env
docker compose up --build -d
```

The API starts at `http://localhost:8001`. PostgreSQL is available at
`127.0.0.1:5433`. Mailpit receives local mail at `http://localhost:8025`; the API
uses its SMTP service internally. The database, development credentials, and
automatically generated JWT keys are for local use only. Configure production
secrets, SMTP, PostgreSQL, and a restricted CORS origin before deployment.
If port 8000 is already in use, change `APP_PORT` in `.env` and set
`VITE_API_URL` in `frontend/.env` to the corresponding API URL.

The React app should use the same-origin `/api` path. Vite proxies this path to
`http://localhost:8001` during development. This keeps authentication cookies
on the frontend's origin and avoids cookie restrictions when the app is opened
through either `localhost` or `127.0.0.1`. If the API is deployed on a separate
origin, configure that origin explicitly and use HTTPS for both services.
`GET http://localhost:8001/api/health` checks the API and PostgreSQL connection.
The development PHP server runs four workers so concurrent frontend requests
do not block session verification behind product or cart requests. OPcache is
enabled for these workers with timestamp validation so edits remain visible
without restarting the container. Symfony debug output is disabled in this
local container to avoid the extra per-request overhead; application errors
remain available in the container logs.

The complete Symfony directory is bind-mounted into the app container. Backend
code, Composer dependencies, Symfony runtime files, and development JWT keys
are visible in the local workspace and shared with the container. The database
remains in its persistent Docker volume. Generated files and private keys are
excluded from version control.

After changing Composer dependencies, update the local `vendor` directory and
restart the app:

```powershell
docker run --rm -v "${PWD}:/app" -w /app composer:2 install --no-interaction
docker compose restart app
```

Rebuild the app image after changing its Dockerfile.

## API capabilities

- JWT registration, email confirmation, login, refresh, profile, and password changes
- Product and category browsing, search, filters, sorting, and pagination
- Authenticated wishlist and stock-checked cart
- Order history, detail, cancellation, and tracking
- Checkout currently displays that payment will be available in a future version.

The browser authentication flow stores access and refresh tokens only in
`HttpOnly` cookies. Access tokens expire after 15 minutes; refresh tokens rotate
and expire after 7 days. A separate, non-sensitive `SESSION_HINT` cookie lets
the frontend skip authentication calls for visitors and only attempt refresh
when a session may exist; it is not an authentication credential.
State-changing API requests require a CSRF token. Use HTTPS in production so
authentication cookies are marked `Secure`, and restrict
the configured CORS origin to the deployed frontend when using a separate API
origin. When running behind a
reverse proxy, configure Symfony's trusted proxies so it detects HTTPS correctly.

## Configuration

Set `DATABASE_URL`, `JWT_SECRET_KEY`, `JWT_PUBLIC_KEY`, `JWT_PASSPHRASE`,
`MAILER_DSN`, and `FRONTEND_URL` in the environment. Keep real credentials out
of version control.
