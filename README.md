# n8n-nodes-mockingbird

n8n community nodes for [Mockingbird](https://mockingbird.n8n.io), the stable mock APIs used in n8n courses, demos, and content.

[n8n](https://n8n.io/) is the platform for AI agents and workflows: the one place to build, run, and manage them, from a first prototype to enterprise scale.

[Installation](#installation)
[Nodes](#nodes)
[Credentials](#credentials)
[Usage](#usage)
[Development](#development)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Nodes

| Node | Operations | Credential |
| --- | --- | --- |
| Mockingbird Product Catalogue | Get, Get Many, Get Categories | Optional |
| Mockingbird Helpdesk | Get, Get Many, Create, Update, Replace, Add Comment | Required |
| Mockingbird Orders | Get, Get Many, Get Many (Cursor) | Required |
| Mockingbird Weather | Get Current, Get Forecast | Optional |
| Mockingbird Exchange Rates | Get Rates, Convert | Optional |
| Mockingbird Quotes | Get, Get Many, Get Quote of the Day | Optional |
| Mockingbird Utilities | Echo, Hash Text, Encode and Decode Base64, Validate Email, IBAN, and VAT Number, Convert Units, Generate UUID, Generate Lorem Ipsum, and more | Optional |
| Mockingbird CRM Lite | Get, Get Many, Create | Optional |
| Mockingbird Fun Pack | Random dog, cat, robot, joke, fact, activity, and users; Get Trivia, Number Fact, and Fortune | Optional |

**Get Many (Cursor)** makes one request and returns the full `{ data, meta }` response. It does not follow `meta.next_cursor`. Pass the cursor back in Additional Fields to read the next page.

## Credentials

Tier 1 APIs, such as Product Catalogue, need no credential. Tier 2 to 4 APIs need one.

1. Get an API key from the Mockingbird dashboard.
2. Create a **Mockingbird API** credential in n8n.
3. Enter the API key.
4. Choose the ID type: **Sandbox** (default) or **Assessment**.
5. Enter the ID.

### About the ID

The ID is only for temporary writes and per-learner state. Reads of seed data ignore it.

- **Sandbox** is for everyone. It is sent as `X-Sandbox-Id`. To get a new ID, call `GET /v1/sandbox-id`.
- **Assessment** is for Academy learners. It is sent as `X-Assessment-Id`. Use the ID your course gave you.
- Format: 8 to 64 characters from `A-Z a-z 0-9 _ -`.
- Rows you create are stored under the ID for 48 hours. Two callers with the same ID share rows.
- Assessments use the ID to pick your row set and to credit your pass.
- Idempotency keys are scoped by the ID.

Send only one of the two headers. The credential does this for you.

The credential also works with the HTTP Request node as a predefined credential type.

## Usage

Add a Mockingbird node to a workflow. Pick a resource and an operation. Example: Mockingbird Product Catalogue, Get Many, with `Search` set to `chair`.

## Development

Nodes are generated from `spec/openapi.json` with `@devlikeapro/n8n-openapi-node`. Edit `scripts/generate.cjs`, not the files in `generated/`.

```bash
npm run generate
npm run build
npm run lint
```

CI fails when generated files drift from the spec.

## License

[Sustainable Use License](https://github.com/n8n-io/n8n/blob/master/LICENSE.md)
