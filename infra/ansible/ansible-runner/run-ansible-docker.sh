#!/usr/bin/env bash
set -euo pipefail

# Helper to build and run the Ansible runner container.
# Usage examples:
#   ./run-ansible-docker.sh build
#   ./run-ansible-docker.sh lint
#   ./run-ansible-docker.sh syntax
#   ./run-ansible-docker.sh check-local
#   ./run-ansible-docker.sh playbook

IMAGE_TAG=distributed-epidemic-ansible-runner:latest
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd -P)/.."
WORKDIR="/work"

case "${1:-}" in
  build)
    docker build -t "$IMAGE_TAG" -f "$ROOT_DIR/infra/ansible/ansible-runner/Dockerfile" "$ROOT_DIR/infra/ansible/ansible-runner"
    ;;
  lint)
    docker run --rm -it \
      -v "$ROOT_DIR":/work \
      -v "$HOME/.ssh":/root/.ssh:ro \
      -w /work/infra/ansible \
      "$IMAGE_TAG" \
      ansible-lint site.yml
    ;;
  syntax)
    docker run --rm -it \
      -v "$ROOT_DIR":/work \
      -v "$HOME/.ssh":/root/.ssh:ro \
      -w /work/infra/ansible \
      "$IMAGE_TAG" \
      ansible-playbook --syntax-check -i inventory.example site.yml
    ;;
  check-local)
    # runs the playbook in local connection mode; mounts /opt so changes affect host
    docker run --rm -it --network host \
      -v "$ROOT_DIR":/work \
      -v /opt:/opt \
      -v "$HOME/.ssh":/root/.ssh:ro \
      -w /work/infra/ansible \
      "$IMAGE_TAG" \
      ansible-playbook -i inventory.example site.yml -c local --check
    ;;
  playbook)
    docker run --rm -it --network host \
      -v "$ROOT_DIR":/work \
      -v /opt:/opt \
      -v "$HOME/.ssh":/root/.ssh:ro \
      -w /work/infra/ansible \
      "$IMAGE_TAG" \
      ansible-playbook -i inventory.example site.yml
    ;;
  *)
    cat <<'USAGE'
Usage: run-ansible-docker.sh <command>

Commands:
  build        Build the runner image
  lint         Run ansible-lint against infra/ansible/site.yml
  syntax       Run ansible-playbook --syntax-check
  check-local  Run playbook in local check (dry-run); mounts /opt to apply to host
  playbook     Run playbook (real run)
USAGE
    exit 1
    ;;
esac
