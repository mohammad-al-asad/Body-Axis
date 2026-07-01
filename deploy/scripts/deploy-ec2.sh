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

echo "Deploying BodyAxis from $ROOT_DIR"
cd "$ROOT_DIR"

docker_compose up -d --build --remove-orphans

echo "Waiting for containers to settle"
sleep 10

curl -fsS http://127.0.0.1:8000/health >/dev/null || print_logs_and_exit "api"
curl -fsS http://127.0.0.1:8080/ >/dev/null || print_logs_and_exit "admin"

docker_compose ps
echo "EC2 deployment completed successfully"
