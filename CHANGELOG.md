# Changelog

## Unreleased

- Remove the `httpRequestNode` metadata from the credential and the codex files. Declarative nodes do not need them.
- Breaking: the pilot Product Catalogue, Helpdesk, and Orders nodes are replaced by the themed nodes below. Workflows that use the old node types need the new nodes.
- Group the Mockingbird APIs into six themed nodes: Commerce, Support, People, Finance and Security, Platform, and Fun and Utilities. Each node has one resource per API.
- Update the README licence section and the n8n description.
- The generator now writes the node files and updates `package.json`.

## 0.1.0

- Pilot: Product Catalogue, Helpdesk, and Orders nodes.
- Mockingbird API credential.
