#!/usr/bin/env bash
set -euo pipefail

container=route-planner-vds
backup="${container}-rollback"
image=route-planner-vds:latest
revision=${CI_COMMIT_SHA:?}
cd "${CI_WORKSPACE:?}"

if [[ "$(git rev-parse HEAD)" != "$revision" ]]; then
  echo "The checkout does not match the pipeline commit" >&2
  exit 1
fi

binding=$(docker inspect --type container --format '{{range (index .HostConfig.PortBindings "3000/tcp")}}{{.HostIp}}:{{.HostPort}}{{"\n"}}{{end}}' "$container")
if [[ "$binding" != "127.0.0.1:3000" ]]; then
  echo "Unexpected port binding for $container" >&2
  exit 1
fi
if docker container inspect "$backup" >/dev/null 2>&1; then
  echo "A previous Route Planner container still exists as $backup" >&2
  exit 1
fi

wait_for_route_planner() {
  local deadline=$((SECONDS + 60))
  until docker exec "$container" wget -q -T 5 -O /dev/null http://127.0.0.1:3000/; do
    if (( SECONDS >= deadline )); then
      echo "$container did not respond to HTTP" >&2
      return 1
    fi
    sleep 2
  done
}

docker build --label "org.opencontainers.image.revision=$revision" --tag "$image" .
image_identity=$(docker image inspect --format '{{.Id}} {{index .Config.Labels "org.opencontainers.image.revision"}}' "$image")
read -r image_id built_revision <<< "$image_identity"
if [[ "$built_revision" != "$revision" ]]; then
  echo "The built image does not match the pipeline commit" >&2
  exit 1
fi

candidate=
restore_route_planner() {
  local status=$?
  trap - INT TERM
  echo "Route Planner deployment failed, restoring $backup" >&2
  if [[ -n "$candidate" ]] && ! docker rm --force "$candidate" >/dev/null; then
    echo "Failed to remove the replacement Route Planner container" >&2
    return "$status"
  fi
  if docker rename "$backup" "$container" &&
    docker start "$container" >/dev/null &&
    wait_for_route_planner; then
    echo "Previous Route Planner restored" >&2
  else
    echo "Automatic Route Planner rollback failed" >&2
  fi
  return "$status"
}

docker rename "$container" "$backup"
trap restore_route_planner EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
candidate=$(docker create --name "$container" --restart unless-stopped \
  --memory=64m --memory-swap=64m --publish 127.0.0.1:3000:3000 "$image_id")
docker stop "$backup" >/dev/null
docker start "$candidate" >/dev/null
wait_for_route_planner
trap - EXIT INT TERM
docker rm "$backup" >/dev/null
echo "Route Planner $revision deployed"
