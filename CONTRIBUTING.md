# Contributing to TypeScript SSVC

Welcome! This guide covers the preferred development workflow using containerized development.

## 🚀 Quick Start with Containers

### Prerequisites
- **Podman** installed
- **VSCode** with **Dev Containers** extension (recommended)

### Option 1: VSCode Dev Containers (Recommended)
1. Clone the repository
2. Open in VSCode
3. Command Palette → "Dev Containers: Reopen in Container"
4. Wait for container to build and setup to complete
5. Start developing!

### Option 2: Command Line Development
```bash
# Clone the repository
git clone https://github.com/trivialsec/typescript-ssvc.git
cd typescript-ssvc

# Start development container
just container-dev

# Inside container, install dependencies
yarn install

# Run tests
yarn test

# Generate plugins
yarn generate-plugins
```

## 🛠️ Available Container Commands

| Command | Description |
|---------|-------------|
| `just container-build` | Build the development container |
| `just container-dev` | Start interactive development session |
| `just container-test` | Run tests inside container |
| `just container-build-app` | Build application inside container |
| `just container-clean` | Clean up container images |
| `just container-exec <command>` | Execute command in running container |

## 🏗️ Development Environment

The containerized environment includes:

### Core Tools
- **Node.js v24.7.0** - JavaScript/TypeScript runtime
- **npm 11.5.2** - Package manager
- **yarn** - Preferred package manager (via corepack)
- **TypeScript** - Language and compiler

### Development Tools
- **just** - Command runner (replaces make)
- **uv** - Modern Python package manager
- **Python 3.13** - For tooling and scripts

### Security Tools
- **semgrep** - Static analysis (open source version)
- **osv-scanner** - Vulnerability scanner
- **Security rules** - Pre-configured rulesets in justfile

### Environment Details
- **Base Image**: `cgr.dev/chainguard/node:latest` (secure, minimal)
- **User**: `node` (non-root for security)
- **Workspace**: `/workspace` (your project directory)
- **Ports**: 3000, 5000, 8000, 9229 (forwarded for development)

## 📋 Development Workflow

### 1. Setup
```bash
# Start container and install dependencies
just container-dev
yarn install
```

### 2. Development Cycle
```bash
# Generate plugins from YAML
yarn generate-plugins

# Build TypeScript
yarn build

# Run tests with coverage
yarn test

# Watch for changes
yarn watch
```

### 3. Security Scanning
```bash
# Generate SARIF reports
just sarif

# Generate SBOM
just sbom
```

### 4. Debugging
The container supports debugging on port 9229:
- **VSCode**: Use provided launch configurations
- **Node.js**: `--inspect=0.0.0.0:9229`

## 🔧 Plugin Development

### Adding New Methodologies
1. Create YAML configuration in `methodologies/`
2. Run `yarn generate-plugins` to generate TypeScript
3. Create wrapper plugin in `src/plugins/`
4. Register plugin in `src/index.ts`
5. Add tests in `src/plugins/*.test.ts`

### YAML Structure
```yaml
name: "Methodology Name"
description: "Description"
version: "1.0"
enums:
  # Define decision point enums
priorityMap:
  # Map actions to priorities  
decisionTree:
  # Define decision logic
defaultAction: # Fallback action
```

## 🧪 Testing

### Running Tests
```bash
# All tests with coverage
yarn test

# Watch mode
yarn test --watch

# Specific test file
yarn test src/plugins/cisa.test.ts
```

### Coverage Requirements
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

### Debug Tests in Container
Use VSCode launch configurations:
- "Debug Jest Tests"
- "Debug Current Jest Test"

## 📦 Building and Publishing

### Development Build
```bash
# Build TypeScript
yarn build

# Build in container (clean environment)
just container-build-app
```

### Publishing Workflow
```bash
# Clean and publish (maintainers only)
just publish
```

This command:
1. Cleans temporary files
2. Publishes to npm
3. Creates git commit and tag
4. Pushes to repository

## 🐛 Troubleshooting

### Container Issues
```bash
# Rebuild container from scratch
just container-clean
just container-build

# Check container status
podman ps -a

# View container logs
podman logs ssvc-dev
```

### Tool Issues
```bash
# Verify tools inside container
just container-exec "which node yarn just semgrep osv-scanner uv python3"

# Check versions
just container-exec "node --version && yarn --version"
```

### VSCode Dev Container Issues
1. Command Palette → "Dev Containers: Rebuild Container"
2. Check `.devcontainer/devcontainer.json` configuration
3. Verify container builds with `just container-build`
4. Create a file `/usr/local/bin/docker`

```sh
#!/bin/bash
exec podman "$@"
```

### Permission Issues
The container runs as the `node` user for security. File ownership should be handled automatically with the `Z` mount flag.

## 🤝 Contributing Guidelines

### Code Style
- Follow existing TypeScript conventions
- Use the project's ESLint/Prettier configuration
- Write tests for new functionality
- Update documentation for new features

### Pull Request Process
1. Fork the repository
2. Create a feature branch from `main`
3. Develop using the containerized environment, to ensure others can too with your contributions
4. Ensure all tests pass: `just test`
5. Run security scans: `just sarif`
6. Submit pull request with clear description

### Commit Messages
Follow conventional commit format:
- `feat: add new methodology`
- `fix: resolve decision tree logic`
- `docs: update API documentation`
- `test: add coverage for edge cases`
- `chore: house keeping activities`

## 🆘 Getting Help

- **Issues**: [GitHub Issues](https://github.com/trivialsec/typescript-ssvc/issues)
- **Security**: See `SECURITY.md` for vulnerability reporting

---

Thank you for contributing to TypeScript SSVC! The containerized development environment ensures consistency and security across all contributor environments. 🎉