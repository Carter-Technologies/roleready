#!/usr/bin/env bash
# Backup Supabase Postgres locally via pg_dump.
# Requires SUPABASE_DB_URL in .env (from Supabase → Project Settings → Database → Connection string → URI)

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/.env"
BACKUP_DIR="$ROOT/supabase/backups"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
OUTPUT="$BACKUP_DIR/roleready_${TIMESTAMP}.sql"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

if [[ -z "${SUPABASE_DB_URL:-}" && -z "${PGPASSWORD:-}" ]]; then
  echo "Error: SUPABASE_DB_URL or PGPASSWORD is not set."
  echo ""
  echo "Add to .env (Supabase → Settings → Database → Connection string → URI):"
  echo "  SUPABASE_DB_URL=postgresql://postgres.[ref]:[PASSWORD]@db.[ref].supabase.co:5432/postgres"
  echo ""
  echo "Or set PGPASSWORD, PGHOST, PGPORT, PGUSER, PGDATABASE separately (avoids URL encoding issues)."
  exit 1
fi

PG_DUMP=""
for candidate in \
  pg_dump \
  /opt/homebrew/opt/libpq/bin/pg_dump \
  /usr/local/opt/libpq/bin/pg_dump \
  /usr/local/Cellar/libpq/*/bin/pg_dump; do
  if command -v "$candidate" &>/dev/null || [[ -x "$candidate" ]]; then
    PG_DUMP="$candidate"
    break
  fi
done

if [[ -z "$PG_DUMP" ]]; then
  echo "Error: pg_dump not found. Install with: brew install libpq"
  echo "Then add to PATH: export PATH=\"/opt/homebrew/opt/libpq/bin:\$PATH\""
  exit 1
fi

mkdir -p "$BACKUP_DIR"

echo "Backing up to $OUTPUT ..."

if [[ -n "${PGPASSWORD:-}" && -n "${PGHOST:-}" ]]; then
  export PGPASSWORD PGSSLMODE="${PGSSLMODE:-require}"
  "$PG_DUMP" \
    -h "$PGHOST" \
    -p "${PGPORT:-5432}" \
    -U "${PGUSER:-postgres.dkbggtyhawkuxakxsfmi}" \
    -d "${PGDATABASE:-postgres}" \
    --no-owner \
    --no-acl \
    --clean \
    --if-exists \
    -f "$OUTPUT"
else
  "$PG_DUMP" "$SUPABASE_DB_URL" \
    --no-owner \
    --no-acl \
    --clean \
    --if-exists \
    -f "$OUTPUT"
fi

echo "Done. Backup saved: $OUTPUT"
ls -lh "$OUTPUT"
