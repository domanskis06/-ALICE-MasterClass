#!/usr/bin/env bash
# Start teacher Angular app for Playwright. Run from alice-masterclass-js after `npm ci` in ../alice-masterclass-teacher.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
JS_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TEACHER_ROOT="$(cd "$JS_ROOT/.." && pwd)/alice-masterclass-teacher"

if [[ ! -f "$TEACHER_ROOT/angular.json" ]]; then
  echo "error: teacher app not found at $TEACHER_ROOT" >&2
  exit 1
fi

cd "$TEACHER_ROOT"
exec npx ng serve --host 127.0.0.1 --port 4201
