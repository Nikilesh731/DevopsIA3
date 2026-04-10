# Contributing

This repository follows a lightweight Git workflow so changes stay reviewable and easy to deploy.

## Branching

- Create feature branches from `develop`.
- Use short, descriptive branch names such as `feature/docker-compose` or `fix/ci-paths`.
- Keep release work isolated from infrastructure work when possible.

## Commits

- Prefer small, focused commits.
- Use clear commit messages that describe the change, not the file.
- Avoid mixing infrastructure, application logic, and documentation in one commit unless they are tightly coupled.

## Pull Requests

- Open pull requests into `develop` for normal feature work.
- Include a short summary, verification steps, and any deployment impact.
- Call out changes to CI/CD, Docker, or Kubernetes explicitly because they affect the release pipeline.

## Review Checklist

- CI passes locally or in GitHub Actions.
- Docker images build successfully.
- New services expose a health endpoint.
- Infrastructure files stay in sync with service ports and environment variables.