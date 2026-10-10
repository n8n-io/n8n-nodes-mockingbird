# Handoff: n8n-nodes-mockingbird

Written 2026-10-09 from the Mockingbird API repo session. Delete this file once the pilot is merged.

## Goal

Community nodes for the Mockingbird mock APIs, generated from the service's OpenAPI spec.
Design record: `/Users/jamie/Documents/Dev/n8n/mockingbird/docs/adr/0028-community-nodes-generated-from-openapi.md`
(status Proposed, uncommitted in that repo at handoff time).

## Decisions

- One package `n8n-nodes-mockingbird`. One node per API (option A).
- Nodes only for Buchholz business data (Tiers 1 to 4). Utilities and Fun Pack stay on the HTTP Request node.
- Generator: `@devlikeapro/n8n-openapi-node` as a dev dependency only. Run at build time. Commit the generated output. CI fails on drift. Verified nodes allow no runtime dependencies.
- Generator limits: first-level JSON bodies only, `application/json` only, credentials by hand. Hand-write overrides for nested bodies, `fmt` and `paginate` params, and error output.
- One credential type `MockingbirdApi`: API key (password field), id type (assessment or sandbox), id value, base URL. It injects `X-Api-Key` and `X-Assessment-Id` or `X-Sandbox-Id` through `authenticate`. Add a `test` request. Tier 1 nodes need no credential. The credential must also work with the HTTP Request node.
- Base URL: `https://mockingbird.n8n.io/v1`. OpenAPI paths include `/v1`, so strip that prefix when generating. Otherwise requests go to `/v1/v1/...`.
- Verification is a goal. n8n owns Mockingbird, so the "one service per package" rule is not a concern. Still follow all rules.

## Package state (scaffolded, nothing committed)

- Template `declarative/custom`, `@n8n/node-cli`, deps installed, git initialised on `main`, no commits.
- Demo `user` and `company` resources in `nodes/Mockingbird/resources/` must be removed.
- Stock credential has only an API key and a test URL `/v1/user`, which is wrong (double `/v1`, demo path).

## Fixes to make first

- `package.json`: repo URL `https://github.com/n8n-io/n8n-nodes-mockingbird.git`, homepage, description, author email `jamie.madden@n8n.io` (npm and repo authors must match for verification).
- Credential `documentationUrl`: point at the README credentials section.
- Add a `LICENSE` file (MIT).

## Verified-node rules to respect

MIT licence. No runtime dependencies. No env var or file access in node code. English only.
Publish from GitHub Actions with provenance (`publish.yml`, npm Trusted Publisher). `@n8n/node-cli` 0.23.0 or later.
README with usage, example workflows, and auth details. Run `npx @n8n/scan-community-package n8n-nodes-mockingbird`.
UX: Title Case names and labels, Sentence case actions and descriptions, placeholders start with "e.g.", boolean descriptions start with "Whether", Simplify option when an endpoint returns more than 10 fields, delete returns `{"deleted": true}`, standard operation vocabulary (Get, Get Many, Create, Update, Delete), no "error", "problem", "failure", or "mistake" in error text.
Read `AGENTS.md` and `.agents/*.md` in this repo first.

## Pilot (next)

Three nodes: one Tier 1 Buchholz API (for example Product Catalogue, `GET /v1/products` with `category`, `min_price_cents`, `max_price_cents`, `q`, `fmt`, `page`, `limit`, `paginate`), one CRUD sandbox API, one assessment API.
Check that the credential works in the HTTP Request node as a predefined credential type.
Source spec: `https://mockingbird.n8n.io/openapi.json`.

## Rules from the user

No em dashes anywhere. No Claude attribution in commits or PRs. Run `code-review` and the cubic `run-review` skill before any PR. Opus for structural UI work.
