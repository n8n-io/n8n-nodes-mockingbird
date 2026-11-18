# Changelog

## 0.2.0

- Breaking: the pilot Product Catalogue, Helpdesk, and Orders nodes are replaced by the themed nodes below. Workflows that use the old node types need the new nodes.
- Remove the `httpRequestNode` metadata from the credential. It is meant for credential-only nodes and would add an extra node to the panel. Remove the codex files, which declarative nodes do not need. Both follow n8n community node review feedback.
- Group the Mockingbird APIs into six themed nodes: Commerce, Support, People, Finance and Security, Platform, and Fun and Utilities. Each node has one resource per API.
- Update the n8n description in the README.
- Rename the Room list operation from Get Many Rooms to Get Many, to match the n8n naming rule. The themed nodes are not released yet, so no saved workflow uses the old name.
- Update `@n8n/node-cli`, prettier, release-it, and the pinned GitHub Actions. ESLint stays on 9.32.0, because `n8n-node lint` uses the ESLint it bundles. TypeScript 7 is not adopted, because `@n8n/node-cli` lint and build fail with it.
- Security hardening: pin GitHub Actions to commit SHAs, install with `--ignore-scripts`, publish without running package tooling, and document the Base URL and idempotency key behavior.
- The generator now writes the node files and updates `package.json`.

## 0.1.0

- Pilot: Product Catalogue, Helpdesk, and Orders nodes.
- Mockingbird API credential.
