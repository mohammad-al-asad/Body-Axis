#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
COMPOSE_FILE="$ROOT_DIR/docker-compose.prod.yml"
COMPOSE_ENV_FILE="$ROOT_DIR/deploy/compose.env"

if [[ ! -f "$COMPOSE_ENV_FILE" ]]; then
  echo "Missing $COMPOSE_ENV_FILE"
  exit 1
fi

docker_compose() {
  docker compose --env-file "$COMPOSE_ENV_FILE" -f "$COMPOSE_FILE" "$@"
}

print_logs_and_exit() {
  local service="$1"
  echo "Deployment health check failed for $service. Recent logs:"
  docker_compose logs --tail=100 "$service" || true
  exit 1
}

wait_for_http() {
  local name="$1"
  local url="$2"
  local attempts="${3:-18}"
  local delay_seconds="${4:-5}"

  for ((attempt = 1; attempt <= attempts; attempt++)); do
    if curl -fsS "$url" >/dev/null; then
      echo "$name is healthy"
      return 0
    fi

    echo "Waiting for $name ($attempt/$attempts)"
    sleep "$delay_seconds"
  done

  return 1
}

echo "Deploying BodyAxis from $ROOT_DIR"
cd "$ROOT_DIR"

docker_compose up -d --build --remove-orphans

echo "Waiting for containers to settle"
sleep 10

wait_for_http "api" "http://127.0.0.1:8000/health" || print_logs_and_exit "api"
wait_for_http "admin" "http://127.0.0.1:8080/" || print_logs_and_exit "admin"

docker_compose ps
echo "EC2 deployment completed successfully"
