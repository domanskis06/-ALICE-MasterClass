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

```bash
npm test
```

Requires a Chrome/Chromium installation (set `CHROME_BIN` if the binary is not on `PATH`).
