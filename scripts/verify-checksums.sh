#!/bin/bash

# SSVC Checksum Verification Script
# Extracts checksums from documentation metadata and verifies generated files

echo "Verifying checksums of generated files..."

for doc in docs/*.md; do
    if [ -f "$doc" ]; then
        # Extract TypeScript file path (handle both absolute and relative paths)
        ts_path=$(rg -N "path: (.*/src/plugins/.*\.ts|src/plugins/.*\.ts)" --only-matching --replace '$1' "$doc" 2>/dev/null | head -1 || true)
        # Extract checksum
        ts_checksum=$(rg -N "checksum: ([a-f0-9]+)" --only-matching --replace '$1' "$doc" 2>/dev/null | head -1 || true)
        
        if [ -n "$ts_path" ] && [ -n "$ts_checksum" ] && [ -f "$ts_path" ]; then
            echo "Verifying $ts_path..."
            if echo "$ts_checksum  $ts_path" | sha1sum -c --quiet; then
                echo "✅ $ts_path checksum verified"
            else
                echo "❌ CHECKSUM MISMATCH: $ts_path"
                exit 1
            fi
        fi
    fi
done

echo "✅ All checksum verifications complete."