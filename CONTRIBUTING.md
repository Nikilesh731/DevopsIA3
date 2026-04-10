# Contributing to Distributed Epidemic System

This repository follows **Git Flow** branching strategy with conventional commit messages for organized collaboration and production-ready deployments.

---

## Development Workflow Overview

```
main (production-ready code)
  ↓ (merge from release branches)
develop (integration branch)
  ↓ (merge from feature branches)
feature/* (development branches)
```

---

## Branching Strategy

### Branch Naming Convention

Create feature branches from `develop` with descriptive names:

- `feature/your-feature-name` - New feature
- `bugfix/your-fix-name` - Bug fix
- `hotfix/urgent-fix` - Critical production fix (from main)
- `release/v1.0.0` - Release preparation

**Examples:**
```
feature/add-postgres-integration
feature/improve-kubernetes-deployment
feature/add-monitoring-dashboard
bugfix/resolve-health-check-timeout
hotfix/fix-critical-security-issue
release/v1.0.0
```

### Branch Protection Rules

**main (Production Branch):**
- ✓ Requires pull request reviews (minimum 1)
- ✓ Requires CI/CD checks to pass
- ✓ Requires branches to be up to date
- ✓ No direct pushes allowed
- ✓ Automatic deployment on merge

**develop (Integration Branch):**
- ✓ Merge only via pull request
- ✓ CI/CD validation required
- ✓ Base branch for all features

---

## Git Workflow Steps

### Step 1: Create Feature Branch

```bash
# Switch to develop and pull latest changes
git checkout develop
git pull origin develop

# Create and switch to feature branch
git checkout -b feature/your-feature-name

# Example:
git checkout -b feature/add-analytics-endpoint
```

### Step 2: Make Changes & Commit

**Use conventional commit format:** `type(scope): description`

```bash
# Make your changes
# ... edit files ...

# Stage and commit
git add .
git commit -m "feat(region-service): add analytics endpoint"

# Commit guidelines:
git commit -m "fix(gateway): resolve health check timeout"
git commit -m "docs(kubernetes): add deployment guide"
git commit -m "chore(deps): update axios security patch"
git commit -m "refactor(resource): simplify allocation algorithm"
git commit -m "test: add unit tests for analytics"
```

**Commit Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code formatting (no logic change)
- `refactor` - Code restructuring
- `perf` - Performance improvements
- `test` - Adding/updating tests
- `chore` - Dependencies, build process

### Step 3: Push & Create Pull Request

```bash
# Push feature branch to remote
git push origin feature/your-feature-name

# GitHub will show a "Compare & pull request" button
# Click it or navigate to Pull Requests tab
```

**Pull Request Details:**

Include clear description:

```markdown
## Description
Brief description of what this PR does and why.

## Changes Made
- Change 1
- Change 2
- Change 3

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Documentation update
- [ ] Dependency update
- [ ] Code refactoring

## Testing Done
- [ ] Tested locally with Docker Compose
- [ ] All services respond correctly
- [ ] npm audit passes
- [ ] No security vulnerabilities introduced

## Verification Steps
1. Run `docker-compose up -d`
2. Run `./VERIFY_STACK.bat`
3. Verify [specific functionality]

## Checklist
- [ ] Code follows project style
- [ ] No hardcoded secrets/passwords
- [ ] Documentation updated if needed
- [ ] Commit messages are conventional
- [ ] Branch is up to date with develop
```

### Step 4: Code Review Process

**Requirements before merge:**
- ✓ Minimum 1 approval from reviewer
- ✓ GitHub Actions CI/CD passes (all checks green)
- ✓ No conflicts with develop branch
- ✓ All conversations resolved

**Reviewer Checklist:**
- Code quality and conventions
- Security (no secrets, no vulnerabilities)
- Testing (local verification done)
- Documentation (README, API docs updated)
- Docker/Kubernetes changes documented

### Step 5: Merge to Develop

After approval:

```bash
# Via GitHub UI (Recommended):
# 1. Click "Squash and merge" to keep history clean
# 2. Delete feature branch after merge

# Or via command line:
git checkout develop
git pull origin develop
git merge feature/your-feature-name
git push origin develop
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

---

## Commit Message Examples

### ✅ GOOD Commits

```
feat(gateway-service): add request rate limiting middleware
fix(region-service): resolve database connection pool exhaustion
docs: add Kubernetes autoscaling guidelines
chore(dependencies): update axios from ^1.13.6 to ^1.15.0
refactor(simulation): improve epidemic model performance by 20%
test: add comprehensive unit tests for resource allocation
perf: optimize region query response time
style: format code according to prettier config
```

**Characteristics:**
- Clear, concise description
- Lowercase starting
- Specific type and scope
- Action-oriented (add, fix, update, etc.)

### ❌ BAD Commits

```
made changes
fixed stuff
updates
work in progress
todo
bug fix
new feature
updated files
wip
asdf
random changes
```

**Problems:**
- Vague descriptions
- No context for future developers
- Doesn't explain the "why"
- Hard to understand impact

---

## Testing Before Committing

Always verify locally:

```bash
# Check for npm vulnerabilities (security)
npm audit

# Build all Docker images
docker-compose build

# Start all services locally
docker-compose up -d

# Verify all services are healthy
./VERIFY_STACK.bat

# For Kubernetes changes:
kubectl get all -n epidemic-system
kubectl get pods -n epidemic-system
```

---

## Local Development Setup

### Initial Setup

```bash
# Clone repository
git clone https://github.com/your-org/distributed-epidemic-system.git
cd distributed-epidemic-system

# Switch to develop branch
git checkout develop
git pull origin develop

# Install dependencies
npm install

# Install service dependencies
cd services/event-bus && npm install && cd ../..
cd services/gateway-service && npm install && cd ../..

# ... repeat for each service ...

# Start local environment
docker-compose up -d

# Verify setup
./VERIFY_STACK.bat
```

### Daily Development Workflow

```bash
# 1. Create feature branch
git checkout develop
git pull origin develop
git checkout -b feature/your-work

# 2. Make changes
# ... edit files ...

# 3. Test locally
docker-compose up -d
./VERIFY_STACK.bat

# 4. Commit
git add .
git commit -m "feat(service): your changes"

# 5. Push
git push origin feature/your-work

# 6. Create PR on GitHub
```

---

## Release Process (Advanced)

When preparing for production release:

```bash
# Create release branch from develop
git checkout -b release/v1.0.0

# Thoroughly test all changes
docker-compose up -d
./VERIFY_STACK.bat
kubectl get all -n epidemic-system

# Merge to main (production)
git checkout main
git pull origin main
git merge release/v1.0.0

# Tag the release
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin main --tags

# Merge back to develop to keep histories in sync
git checkout develop
git merge main
git push origin develop

# Delete release branch
git branch -d release/v1.0.0
git push origin --delete release/v1.0.0
```

---

## Review Checklist

**For All PRs:**

- ✓ CI passes locally and in GitHub Actions
- ✓ Docker images build successfully
- ✓ All services expose health endpoint
- ✓ Infrastructure files stay in sync with ports and env vars
- ✓ npm audit passes (no vulnerabilities)
- ✓ No hardcoded secrets or credentials
- ✓ Documentation updated

**For Infrastructure Changes:**

- ✓ Kubernetes manifests validated
- ✓ Terraform format correct
- ✓ Ansible playbooks tested
- ✓ Docker Compose still works
- ✓ Service dependencies documented

**For API Changes:**

- ✓ New endpoints have health checks
- ✓ Error responses documented
- ✓ API versioning considered
- ✓ Rate limiting configured if needed

---

## Getting Help

### Found an Issue?

1. **Search existing issues:** Check if already reported
2. **Create new issue** with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots/logs if applicable
3. **Link related PRs:** Use #123 format

### Questions?

- Check [Architecture Documentation](docs/architecture/ARCHITECTURE.md)
- Review [Service Boundaries](docs/architecture/SERVICE_BOUNDARIES.md)
- Check [Deployment Guide](docs/architecture/DEPLOYMENT_GUIDE.md)
- Open a Discussion on GitHub

---

## Code of Conduct

- **Be respectful** toward all contributors
- **Assume good intent** - give benefit of doubt
- **Help others learn** - share knowledge generously
- **Report issues appropriately** - private for sensitive matters

---

## Recognition

All contributors are acknowledged in:
- Git commit history
- Pull request discussions
- GitHub Contributors page
- Project README

**Thank you for contributing! 🚀**