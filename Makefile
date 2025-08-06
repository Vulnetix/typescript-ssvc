SHELL := /bin/bash
.PHONY: help

help: ## This help.
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.DEFAULT_GOAL := help

SEMGREP_ARGS=--use-git-ignore --metrics=off --force-color --disable-version-check --experimental --dataflow-traces --sarif --timeout=0
SEMGREP_RULES=-c p/default -c p/python -c p/php -c p/c -c p/rust -c p/apex -c p/nginx -c p/terraform -c p/csharp -c p/nextjs -c p/golang -c p/nodejs -c p/kotlin -c p/django -c p/docker -c p/kubernetes -c p/lockfiles -c p/supply-chain -c p/headless-browser -c p/expressjs -c p/cpp-audit -c p/mobsfscan -c p/ruby -c p/java -c p/javascript -c p/typescript -c p/bandit -c p/flask -c p/gosec -c p/flawfinder -c p/gitleaks -c p/eslint -c p/phpcs-security-audit -c p/react -c p/brakeman -c p/findsecbugs -c p/secrets -c p/sql-injection -c p/jwt -c p/insecure-transport -c p/command-injection -c p/security-code-scan -c p/xss

clean: ## Cleanup tmp files
	@find . -type f -name '*.DS_Store' -delete 2>/dev/null

setup: ## FOR DOCO ONLY - Run these one at a time, do not call this target directly
	nvm install --lts
	nvm use --lts
	npm install -g corepack
	rm ~/.pnp.cjs
	corepack enable
	yarn set version stable
	yarn dlx @yarnpkg/sdks vscode
	yarn install
	yarn plugin import https://raw.githubusercontent.com/spdx/yarn-plugin-spdx/main/bundles/@yarnpkg/plugin-spdx.js
	yarn plugin import https://github.com/CycloneDX/cyclonedx-node-yarn/releases/latest/download/yarn-plugin-cyclonedx.cjs

publish: clean ## upload to npm.org
	npm publish
	git commit -a -s -m 'feat: v$(shell node -e "console.log(require('./package.json').version)")'
	git tag --force v$(shell node -e "console.log(require('./package.json').version)")
	git push
	git push --tags --force

update: ## get app updates, migrate should be run first
	yarn up

install: ## install deps and build icons
	yarn install

sarif: clean ## generate SARIF from Semgrep for this project
	osv-scanner --format sarif --call-analysis=all -r . | jq >osv.sarif.json
	semgrep $(SEMGREP_ARGS) $(SEMGREP_RULES) | jq >semgrep.sarif.json

sbom: clean ## generate CycloneDX from NPM for this project
	yarn cyclonedx --spec-version 1.6 --output-format JSON --output-file ssvc.cdx.json
	yarn spdx
