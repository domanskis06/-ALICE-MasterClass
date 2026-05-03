# ALICE MasterClass (student web app)

Angular application for the ALICE MasterClass student experience, served in the browser.

## Prerequisites

- [Node.js](https://nodejs.org) (LTS recommended)

## Setup

```bash
git clone https://gitlab.cern.ch/alice-masterclass/alice-masterclass-js.git
cd alice-masterclass-js
npm install
```

## Run locally

Development server with the `web` environment (API defaults to `http://localhost:8000/api/v1/`):

```bash
npm start
```

Equivalent:

```bash
npm run ng:serve
```

Then open the URL shown in the terminal (typically [http://localhost:4200](http://localhost:4200)).

## Build

```bash
npm run build          # default configuration
npm run build:dev      # dev environment
npm run build:prod     # production (runs `make-prod.mjs` first)
```

Output is written to `dist/`.

## Tests

### Unit tests (Karma)

```bash
npm test
```

Requires a Chrome/Chromium installation (set `CHROME_BIN` if the binary is not on `PATH`).

### End-to-end tests (Playwright)

First-time browser download:

```bash
npx playwright install chromium
```

**Smoke E2E** (Angular only; `api-stub` fakes `check_session` — no Django):

```bash
npm run e2e
```

Interactive UI:

```bash
npm run e2e:ui
```

**E2E with real Django** (`npm run e2e:django`): starts Django + `ng serve`, seeds data, runs tests under `e2e/django/` against the real `PUT /api/v1/check_session/` endpoint.

Requirements:

- Sibling checkout: [alice-masterclass-django](../alice-masterclass-django) next to this folder (same parent as `alice-masterclass-js`).
- Python 3 with Django dependencies. Easiest: a venv inside the Django repo (used automatically if it exists):

```bash
cd ../alice-masterclass-django
python3 -m venv .venv-e2e
. .venv-e2e/bin/activate
pip install -r requirements.txt
python manage.py migrate --noinput
deactivate
cd ../alice-masterclass-js
npm run e2e:django
```

The start script uses `../alice-masterclass-django/.venv-e2e/bin/python` when present, or `E2E_PYTHON` if set. Optional `E2E_SESSION_PASSWORD` (default `playwright-e2e`) must match between the [seed_playwright_e2e](../alice-masterclass-django/masterclass/management/commands/seed_playwright_e2e.py) command and the browser test.

Stop any other process on ports **8000** and **4200** before running, or rely on Playwright’s `reuseExistingServer` when **not** in CI.

For full-stack flows beyond session check (e.g. uploads), extend `e2e/django/` with more specs and keep Django seeded accordingly.
