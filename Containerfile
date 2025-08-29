# Use a base image with package manager for development tools
FROM alpine:3.18 as tool-builder

# Install system dependencies (no Python - uv will manage it)
# Note: Avoiding sudo/doas entirely for better container security
# Alpine containers should avoid privilege escalation tools when possible
RUN apk add --no-cache \
    bash \
    curl \
    git \
    jq \
    wget \
    ca-certificates \
    tar \
    gzip

# Install just (command runner) using official install script
RUN curl --proto '=https' --tlsv1.2 -sSf https://just.systems/install.sh | bash -s -- --to /usr/local/bin && \
    /usr/local/bin/just --version

# Install osv-scanner
RUN curl -L -f https://github.com/google/osv-scanner/releases/latest/download/osv-scanner_linux_amd64 -o /usr/local/bin/osv-scanner && \
    chmod +x /usr/local/bin/osv-scanner && \
    /usr/local/bin/osv-scanner --version || echo "osv-scanner installed but version check failed"

# Install uv (modern Python package and version manager)
RUN curl -LsSf https://astral.sh/uv/install.sh | sh && \
    export PATH="$HOME/.local/bin:$PATH" && \
    uv --version

# Install Python using uv
RUN export PATH="$HOME/.local/bin:$PATH" && \
    uv python install 3.13 && \
    uv python pin 3.13

# Install semgrep using uv tool install (semgrep is the open source package name)
RUN export PATH="$HOME/.local/bin:$PATH" && \
    uv tool install semgrep && \
    semgrep --version || echo "semgrep version check failed"

# Now use chainguard/node as the final base
FROM cgr.dev/chainguard/node:latest

# Switch to root for setup
USER root

# Copy tools from builder stage
COPY --from=tool-builder /usr/local/bin/just /usr/local/bin/just
COPY --from=tool-builder /usr/local/bin/osv-scanner /usr/local/bin/osv-scanner

# Copy system tools needed for development  
COPY --from=tool-builder /usr/bin/wget /usr/local/bin/wget

# For now, skip git in container - use host git via VSCode
# Git will be available through VSCode's git integration
# Users can also mount ~/.gitconfig for git configuration

# Copy uv and uv-managed Python installation
COPY --from=tool-builder /root/.local/bin/uv /usr/local/bin/uv
COPY --from=tool-builder /root/.local/share/uv /root/.local/share/uv
COPY --from=tool-builder /root/.local/bin/semgrep /usr/local/bin/semgrep

# Copy system dependencies needed by Python
COPY --from=tool-builder /lib/ld-musl-x86_64.so.1 /lib/ld-musl-x86_64.so.1

# Set up environment for uv and Python
ENV UV_SYSTEM_PYTHON=1
ENV PATH="/usr/local/bin:/root/.local/bin:$PATH"

# Create symlink for python3 command
RUN uv python list --only-installed | head -1 | awk '{print $2}' | xargs -I {} ln -sf /root/.local/share/uv/python/{}/bin/python3 /usr/local/bin/python3

# Use existing Node.js from chainguard/node image and setup yarn
RUN node --version && npm --version && \
    npm install -g corepack && \
    corepack enable && \
    mkdir -p /home/node && \
    chown -R node:node /home/node

# Switch to node user
USER node
WORKDIR /home/node

# Create workspace directory
USER root
RUN mkdir -p /workspace && chown node:node /workspace
USER node
WORKDIR /workspace

# Expose common development ports
EXPOSE 3000 5000 8000 9229

# Override the default Node.js entrypoint to use shell for development
ENTRYPOINT ["/bin/sh"]
CMD ["-l"]