# Container Development Guide

This guide provides detailed information about the containerized development environment for TypeScript SSVC.

## 🏗️ Container Architecture

### Base Image: Chainguard Node
- **Image**: `cgr.dev/chainguard/node:latest`
- **Benefits**: Minimal attack surface, regularly updated, security-focused
- **Size**: Significantly smaller than standard Node images
- **Security**: Runs as non-root user, distroless design

### Multi-stage Build Process
1. **Builder Stage** (`alpine:3.18`): Installs development tools
2. **Runtime Stage** (`chainguard/node`): Copies tools to minimal final image

### Included Tools & Versions
```
Node.js:      v24.7.0 (LTS)
npm:          11.5.2
yarn:         Via corepack (latest stable)
just:         Latest (command runner)
semgrep:      Latest (static analysis)
osv-scanner:  Latest (vulnerability scanner)
uv:           Latest (Python package manager)
python3:      3.13
```

## 🚀 Quick Start Commands

| Command | Purpose | Use Case |
|---------|---------|----------|
| `just container-build` | Build development container | First-time setup, after Containerfile changes |
| `just container-dev` | Interactive development | Main development work |
| `just container-test` | Run tests in clean environment | CI/CD, verification |
| `just container-build-app` | Build app in clean environment | Release builds |
| `just container-clean` | Clean up containers/images | Troubleshooting, cleanup |

## 🔧 Development Workflows

### VSCode Dev Containers (Recommended)

**Setup:**
1. Install "Dev Containers" extension
2. Open project in VSCode
3. Command Palette → "Dev Containers: Reopen in Container"

**Features:**
- ✅ Automatic container build
- ✅ Integrated terminal in container
- ✅ Extension installation in container
- ✅ Debugging support
- ✅ Port forwarding
- ✅ File synchronization

**Extensions Included:**
- TypeScript support
- Jest testing
- YAML language support
- Just syntax highlighting
- GitLab workflow integration

### Command Line Development

**Interactive Session:**
```bash
# Start development container
just container-dev

# Inside container:
yarn install           # Install dependencies
yarn generate-plugins  # Generate TypeScript from YAML
yarn build             # Build project
yarn test              # Run tests
yarn watch             # Watch for changes
```

**One-off Commands:**
```bash
# Run tests without entering container
just container-test

# Build without entering container  
just container-build-app

# Execute custom command
just container-exec "yarn lint"
```

## 🔍 Security Features

### Chainguard Base Image Benefits
- **Minimal Packages**: Only essential components included
- **No Shell** (by default): Reduced attack surface
- **Regular Updates**: Automated security patches
- **Reproducible Builds**: Same environment everywhere
- **CVE Scanning**: Built-in vulnerability detection

### Non-Root Execution
- **User**: `node` (uid/gid from chainguard image)
- **Home**: `/home/node`
- **Workspace**: `/workspace` (mounted from host)
- **Permissions**: Read/write to workspace, read-only system

### Security Tools Integration
```bash
# Static analysis with semgrep
just sarif  # Generates semgrep.sarif.json

# Vulnerability scanning
osv-scanner --format sarif -r . | jq >osv.sarif.json

# SBOM generation
just sbom   # Generates ssvc.cdx.json and SPDX files
```

## 🛠️ Customization

### Adding Tools to Container

**Method 1: Modify Containerfile**
```dockerfile
# In builder stage, add:
RUN apk add --no-cache your-tool

# In final stage, copy:
COPY --from=tool-builder /usr/bin/your-tool /usr/local/bin/your-tool
```

**Method 2: Runtime Installation**
```bash
# Inside container (temporary):
just container-exec "yarn global add your-tool"
```

### Environment Variables
```bash
# Set in justfile for persistent changes:
just container-exec "export YOUR_VAR=value && your-command"

# Or modify .devcontainer/devcontainer.json for VSCode
```

### Volume Mounts
Current mount: `$(pwd):/workspace:Z`
- **Source**: Current directory (host)
- **Target**: `/workspace` (container)
- **Options**: `Z` (SELinux relabeling for security)

## 🐛 Troubleshooting

### Container Build Issues

**Problem**: Build fails with package not found
```bash
# Solution: Clean and rebuild
just container-clean
just container-build
```

**Problem**: Permission denied during build
```bash
# Check SELinux context (Fedora/RHEL)
ls -Z Containerfile

# Rebuild with cache clearing
podman build --no-cache -t ssvc-dev -f Containerfile .
```

### Runtime Issues

**Problem**: Container won't start
```bash
# Check container status
podman ps -a

# View container logs
podman logs ssvc-dev

# Inspect image
podman inspect localhost/ssvc-dev:latest
```

**Problem**: Tools not found in container
```bash
# Verify tools are installed
just container-exec "which node yarn just semgrep osv-scanner"

# Check PATH
just container-exec "echo \$PATH"

# List installed binaries
just container-exec "ls -la /usr/local/bin"
```

**Problem**: File permission issues
```bash
# Check mount options
podman inspect ssvc-dev | grep -A 5 Mounts

# Verify workspace ownership
just container-exec "ls -la /workspace"

# Fix permissions (if needed)
sudo chown -R $(id -u):$(id -g) .
```

### VSCode Dev Container Issues

**Problem**: Container fails to start in VSCode
1. Check `.devcontainer/devcontainer.json` syntax
2. Verify container builds manually: `just container-build`
3. Rebuild container: Cmd+Shift+P → "Rebuild Container"

**Problem**: Extensions not loading
1. Check extension requirements in `devcontainer.json`
2. Manually install: Cmd+Shift+P → "Install Extension"
3. Check container logs in VSCode terminal

**Problem**: Port forwarding not working
1. Verify ports in `devcontainer.json` match Containerfile `EXPOSE`
2. Check port conflicts: `lsof -i :3000`
3. Restart container or change port mappings

### Network Issues

**Problem**: Cannot access external resources
```bash
# Test network connectivity
just container-exec "ping -c 3 google.com"

# Check DNS resolution
just container-exec "nslookup github.com"

# Verify proxy settings (if applicable)
just container-exec "env | grep -i proxy"
```

### Performance Issues

**Problem**: Slow container startup
```bash
# Check image size
podman images localhost/ssvc-dev

# Optimize by using specific tool versions in Containerfile
# Use multi-stage build efficiently
# Consider using .containerignore file
```

**Problem**: High resource usage
```bash
# Monitor container resources
podman stats ssvc-dev

# Limit resources in justfile:
# podman run --memory=2g --cpus=2 ...
```

## 📊 Monitoring & Logging

### Container Health
```bash
# Check container status
podman ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# View resource usage
podman stats --no-stream ssvc-dev

# Check image history
podman history localhost/ssvc-dev:latest
```

### Development Metrics
```bash
# Inside container - check versions
just container-exec "node --version && npm --version && yarn --version"

# Build metrics
time just container-build-app

# Test metrics
just container-exec "yarn test --verbose"
```

## 🔄 Maintenance

### Regular Tasks
```bash
# Update base image (rebuild required)
just container-clean
just container-build

# Clean unused containers
podman container prune

# Clean unused images
podman image prune

# Clean build cache
podman builder prune
```

### Security Updates
```bash
# Check for base image updates
podman pull cgr.dev/chainguard/node:latest

# Rebuild with latest base
just container-clean
just container-build

# Verify security tools versions
just container-exec "semgrep --version && osv-scanner --version"
```

## 🚀 Advanced Usage

### Multi-Container Development
```bash
# Run database for integration tests
podman run -d --name dev-db postgres:alpine

# Connect containers
podman run --link dev-db:db ssvc-dev
```

### CI/CD Integration
```yaml
# GitHub Actions example
- name: Build and Test in Container
  run: |
    just container-build
    just container-test
    just container-build-app
```

### Production Builds
```bash
# Build optimized production image
podman build --target production -t ssvc-prod .

# Extract built artifacts
podman create --name extract ssvc-prod
podman cp extract:/app/dist ./dist/
podman rm extract
```

---

This containerized development environment provides a secure, consistent, and reproducible development experience for all contributors. The configuration balances security, performance, and developer experience.