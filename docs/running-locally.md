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

## Configuration (.env)

Compose reads a `.env` file next to `compose.yaml` automatically. Copy the
template and fill in your values — `.env` is gitignored:

```bash
cp .env.example .env
```

| Variable | Purpose |
|---|---|
| `LLM_BASE_URL` | Qwen endpoint, OpenAI-compatible base (`…/v1`) |
| `LLM_API_KEY` | Bearer key for the endpoint |
| `LLM_MODEL` | Model name the endpoint serves |
| `LOCAL_USER` | Dev identity when no proxy header is present |
| `POSTGRES_PASSWORD` | Database password (defaults match compose) |

In-cluster, the three `LLM_*` values move to an OpenShift Secret mounted as
env on the Deployment — same names, no code change.

## Layout

| Piece | Where |
|---|---|
| Thin API (storage adapter over Postgres, whoami) | `server/index.ts` |
| SPA | `src/`, built to `dist/` by Vite, served from the app container |
| Storage adapter interface + local fallback | `src/storage.ts` |
| Stack definition | `compose.yaml`, `Containerfile` |
