#!/usr/bin/env -S just --justfile

# Set shell to bash
set shell := ["/bin/bash", "-c"]

# Semgrep configuration variables
SEMGREP_ARGS := "--use-git-ignore --metrics=off --force-color --disable-version-check --experimental --dataflow-traces --sarif --timeout=0"
SEMGREP_RULES := "-c p/default -c p/python -c p/php -c p/c -c p/rust -c p/apex -c p/nginx -c p/terraform -c p/csharp -c p/nextjs -c p/golang -c p/nodejs -c p/kotlin -c p/django -c p/docker -c p/kubernetes -c p/lockfiles -c p/supply-chain -c p/headless-browser -c p/expressjs -c p/cpp-audit -c p/mobsfscan -c p/ruby -c p/java -c p/javascript -c p/typescript -c p/bandit -c p/flask -c p/gosec -c p/flawfinder -c p/gitleaks -c p/eslint -c p/phpcs-security-audit -c p/react -c p/brakeman -c p/findsecbugs -c p/secrets -c p/sql-injection -c p/jwt -c p/insecure-transport -c p/command-injection -c p/security-code-scan -c p/xss"

# Show available recipes (default recipe)
default:
    @just --list --unsorted

# Cleanup tmp files
clean:
    @find . -type f -name '*.DS_Store' -delete 2>/dev/null || true

# FOR DOCO ONLY - Run these one at a time, do not call this recipe directly
setup:
    @echo "FOR DOCO ONLY - Run these one at a time, do not call this recipe directly:"
    @echo "  nvm install --lts"
    @echo "  nvm use --lts"
    @echo "  npm install -g corepack"
    @echo "  rm ~/.pnp.cjs"
    @echo "  corepack enable"
    @echo "  yarn set version stable"
    @echo "  yarn dlx @yarnpkg/sdks vscode"
    @echo "  yarn install"
    @echo "  yarn plugin import https://raw.githubusercontent.com/spdx/yarn-plugin-spdx/main/bundles/@yarnpkg/plugin-spdx.js"
    @echo "  yarn plugin import https://github.com/CycloneDX/cyclonedx-node-yarn/releases/latest/download/yarn-plugin-cyclonedx.cjs"

# Upload to npm.org
publish: clean
    npm publish
    git commit -a -s -m "feat: v$(node -e "console.log(require('./package.json').version)")"
    git tag --force "v$(node -e "console.log(require('./package.json').version)")"
    git push
    git push --tags --force

# Get app updates, migrate should be run first
update:
    yarn up

# Install deps and build icons
install:
    yarn install

# Generate SARIF from Semgrep for this project
# Note: semgrep is installed via uv tool install (open source version)
sarif: clean
    osv-scanner --format sarif --call-analysis=all -r . | jq >osv.sarif.json
    semgrep {{SEMGREP_ARGS}} {{SEMGREP_RULES}} | jq >semgrep.sarif.json

# Generate CycloneDX from NPM for this project
sbom: clean
    yarn cyclonedx --spec-version 1.6 --output-format JSON --output-file ssvc.cdx.json
    yarn spdx

# Show current package version
version:
    @node -e "console.log(require('./package.json').version)"

# Run tests with coverage
test:
    npx jest --coverage

# Watch TypeScript compilation
watch:
    npx tsc -w

# Build TypeScript to JavaScript
build:
    npx tsc --pretty

# Validate YAML methodology files against schema
validate-methodologies:
    npx ts-node scripts/validate-methodologies.ts

# Generate SSVC plugins from YAML configurations
generate-plugins: validate-methodologies
    npx ts-node scripts/generate-plugins.ts

# Verify checksums of all generated files from documentation metadata
verify-checksums:
    ./scripts/verify-checksums.sh

# Run full development cycle: generate plugins, build, test
dev: generate-plugins build test

# Lint and format (if available)
lint:
    @echo "No linter configured. Consider adding eslint or prettier."

# Clean all generated files and dependencies
clean-all: clean
    rm -rf node_modules dist coverage
    rm -f *.sarif.json *.cdx.json *.spdx.json

# Quick check: build and test without coverage
check: build
    npx jest --passWithNoTests

# Container management
# Build the development container
container-build:
    podman build -t ssvc-dev -f Containerfile .

# Run container with file mounts for development
container-run:
    podman run -it --rm \
        --name ssvc-dev \
        -v "$(pwd):/workspace:Z" \
        -p 3000:3000 \
        -p 5000:5000 \
        -p 8000:8000 \
        -p 9229:9229 \
        ssvc-dev

# Start interactive development session
container-dev: container-build
    podman run -d --rm \
        --name ssvc-dev \
        -v "$(pwd):/workspace:Z" \
        -p 3000:3000 \
        -p 5000:5000 \
        -p 8000:8000 \
        -p 9229:9229 \
        -w /workspace \
        ssvc-dev

# Execute command in running container
container-exec command="sh":
    podman exec -it ssvc-dev {{command}}

# Clean up container images
container-clean:
    @echo "Stopping and removing containers..."
    podman stop ssvc-dev 2>/dev/null || true
    podman rm ssvc-dev 2>/dev/null || true
    @echo "Removing images..."
    podman rmi localhost/ssvc-dev:latest 2>/dev/null || true
    podman rmi ssvc-dev 2>/dev/null || true
    @echo "Cleaning up unused containers and images..."
    podman container prune -f 2>/dev/null || true
    podman image prune -f 2>/dev/null || true
    @echo "Cleanup complete!"

# Force clean up everything (use with caution)
container-clean-all:
    @echo "Force stopping all containers..."
    podman stop --all 2>/dev/null || true
    @echo "Removing all containers..."
    podman rm --all 2>/dev/null || true
    @echo "Removing all images..."
    podman rmi --all --force 2>/dev/null || true
    @echo "System cleanup..."
    podman system prune --all --force 2>/dev/null || true
    @echo "Nuclear cleanup complete!"

# Run tests inside container
container-test: container-build
    podman run --rm \
        -v "$(pwd):/workspace:Z" \
        -w /workspace \
        ssvc-dev \
        sh -c "yarn install && yarn test"

# Run build inside container
container-build-app: container-build
    podman run --rm \
        -v "$(pwd):/workspace:Z" \
        -w /workspace \
        ssvc-dev \
        sh -c "yarn install && yarn build"