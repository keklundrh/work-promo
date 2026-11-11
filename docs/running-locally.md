# Running locally

Everything runs in containers via `podman compose` — nothing installs on the
host. Postgres holds the data; one app container serves both the API and the
built UI.

## Prerequisites

- Podman with a running machine (`podman machine list`)

## Run

```bash
podman compose up -d --build
```

Then open <http://localhost:8080>.

First start pulls the Postgres image and builds the app image (a few minutes).
Data persists in the `pgdata` volume across restarts.

## Stopping

```bash
podman compose down        # keeps data
podman compose down --volumes   # also wipes the database
```

## Identity

The app trusts the `x-forwarded-user` header, exactly what the OpenShift OAuth
proxy injects in-cluster. Compose sets `USER_HEADER=x-forwarded-user`, and
docker/podman do not inject it — so locally the API reports "unauthenticated"
unless you send the header yourself. The SPA picks the local (browser) storage
adapter whenever the API does not answer, so the UI still works without the
backend.

To exercise the authenticated path locally:

```bash
curl -H 'x-forwarded-user: yourname' http://localhost:8080/api/whoami
```

## Layout

| Piece | Where |
|---|---|
| Thin API (storage adapter over Postgres, whoami) | `server/index.ts` |
| SPA | `src/`, built to `dist/` by Vite, served from the app container |
| Storage adapter interface + local fallback | `src/storage.ts` |
| Stack definition | `compose.yaml`, `Containerfile` |
