# Running locally

Everything runs in containers via `podman compose` — nothing installs on the
host. With the stack up, Postgres holds the data; one app container serves
both the API and the built UI. Compose sets `LOCAL_USER=karl` so the browser
gets a working identity without a proxy (change it there).

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
proxy injects in-cluster. The server resolves identity as: header →
`LOCAL_USER` fallback → 401. Compose sets `LOCAL_USER=karl`, so the local
stack is authenticated out of the box and everything you add is stored in
Postgres as `karl`. Never set `LOCAL_USER` in-cluster — there the proxy path
must 401 without a real header.

The SPA picks the browser-local storage adapter only when the API is
unreachable entirely (e.g. `vite dev` without the backend), so UI-only mode
still works but keeps data in the browser.

## Layout

| Piece | Where |
|---|---|
| Thin API (storage adapter over Postgres, whoami) | `server/index.ts` |
| SPA | `src/`, built to `dist/` by Vite, served from the app container |
| Storage adapter interface + local fallback | `src/storage.ts` |
| Stack definition | `compose.yaml`, `Containerfile` |
