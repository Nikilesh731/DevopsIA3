#!/usr/bin/env bash
set -euo pipefail

# Simple wrapper to run Ansible inside the bundled Docker runner image.
# Usage: ./run-ansible-in-docker.sh <build|lint|syntax|check-local|playbook>

IMAGE_TAG=distributed-epidemic-ansible-runner:latest
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd -P)"
# repo root is two levels above infra/ansible
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd -P)"
ANSIBLE_DIR="$SCRIPT_DIR"

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <build|lint|syntax|check-local|playbook>"
  exit 1
fi

cmd="$1"

case "$cmd" in
  build)
    # Build using the ansible-runner directory as context (Dockerfile is inside it)
    docker build -t "$IMAGE_TAG" "$ANSIBLE_DIR/ansible-runner"
    ;;
  lint)
    docker run --rm -it \
      -v "$REPO_ROOT":/work \
      -v "$HOME/.ssh":/root/.ssh:ro \
      -w /work/infra/ansible "$IMAGE_TAG" \
      ansible-lint site.yml
    ;;
  syntax)
    docker run --rm -it \
      -v "$REPO_ROOT":/work \
      -v "$HOME/.ssh":/root/.ssh:ro \
      -w /work/infra/ansible "$IMAGE_TAG" \
      ansible-playbook --syntax-check -i inventory.example site.yml
    ;;
  check-local)
    docker run --rm -it --network host \
      -v "$REPO_ROOT":/work \
      -v /opt:/opt \
      -v "$HOME/.ssh":/root/.ssh:ro \
      -w /work/infra/ansible "$IMAGE_TAG" \
      ansible-playbook -i inventory.example site.yml -c local --check
    ;;
  playbook)
    docker run --rm -it --network host \
      -v "$REPO_ROOT":/work \
      -v /opt:/opt \
      -v "$HOME/.ssh":/root/.ssh:ro \
      -w /work/infra/ansible "$IMAGE_TAG" \
      ansible-playbook -i inventory.example site.yml
    ;;
  *)
    echo "Unknown command: $cmd"
    echo "Usage: $0 <build|lint|syntax|check-local|playbook>"
    exit 2
    ;;
esac
