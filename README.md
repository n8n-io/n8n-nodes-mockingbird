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

Six nodes group the Mockingbird APIs by theme. Pick the node, then a resource, then an operation.

| Node                             | Resources                                      | Credential |
| -------------------------------- | ---------------------------------------------- | ---------- |
| Mockingbird Commerce             | Product, Order, Inventory, Review, Customer    | Optional   |
| Mockingbird Support              | Ticket, Article, Agent Tool, Text              | Required   |
| Mockingbird People               | Employee, Time Off Request, Room               | Required   |
| Mockingbird Finance and Security | Transaction, Security, Exchange Rate           | Optional   |
| Mockingbird Platform             | Job, Event, Webhook, File, Sandbox, Assessment | Optional   |
| Mockingbird Fun and Utilities    | Fun, Utility, Weather, Quote                   | Optional   |

Some resources need no credential. Examples are Product, Weather, and Exchange Rate. In a node marked Optional, a resource that needs a key fails with 401 if you add no credential. Nodes marked Required always need one.

### Operations

| Resource         | Operations                                                                                                                                                                                                             |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Product          | Get, Get Many, Get Categories                                                                                                                                                                                          |
| Order            | Get, Get Many, Get Many (Cursor)                                                                                                                                                                                       |
| Inventory        | Get, Create Reservation, Delete Reservation                                                                                                                                                                            |
| Review           | Get Many, Get Latest, Create, Moderate                                                                                                                                                                                 |
| Customer         | Get, Get Many, Create                                                                                                                                                                                                  |
| Ticket           | Get, Get Many, Create, Update, Replace, Add Comment                                                                                                                                                                    |
| Article          | Search, Get                                                                                                                                                                                                            |
| Agent Tool       | Look Up Customer, Refund Order, Cancel Order, Resend Invoice, Get Next Ticket, Resolve Ticket, Get Tools                                                                                                               |
| Text             | Classify Sentiment, Classify Intent, Extract Entities                                                                                                                                                                  |
| Employee         | Get, Get Many, Create, Update, Get Reports, Get Departments, Get Org Chart, Get Salary Bands                                                                                                                           |
| Time Off Request | Get Many, Get Many by Employee, Create, Update, Get Balance, Get Calendar                                                                                                                                              |
| Room             | Get Many, Get Availability, Create Booking, Delete Booking                                                                                                                                                             |
| Transaction      | Get, Get Many, Score, Create Case, Update Case                                                                                                                                                                         |
| Security         | Get Many Events, Get Many Blocks, Create Block                                                                                                                                                                         |
| Exchange Rate    | Get Rates, Convert                                                                                                                                                                                                     |
| Job              | Create, Get, Get Result                                                                                                                                                                                                |
| Event            | Get Many                                                                                                                                                                                                               |
| Webhook          | Get Many Subscriptions, Create Subscription, Delete Subscription, Fire                                                                                                                                                 |
| File             | Get Many                                                                                                                                                                                                               |
| Sandbox          | Reset, Get ID                                                                                                                                                                                                          |
| Assessment       | Get, Get Many, Get Source, Submit                                                                                                                                                                                      |
| Fun              | Get Random Dog, Get Dog Breeds, Get Random Dog by Breed, Get Random Cat, Get Random Robot, Get Random Joke, Get Joke, Get Random Fact, Get Random Activity, Get Trivia, Get Random Users, Get Number Fact, Get Fortune |
| Utility          | Get Countries, Echo, Respond With Status, Respond After Delay, Generate UUID, Hash Text, Encode Base64, Decode Base64, Validate Email, Validate IBAN, Validate VAT Number, Convert Units, Generate Lorem Ipsum         |
| Weather          | Get Current, Get Forecast                                                                                                                                                                                              |
| Quote            | Get, Get Many, Get Quote of the Day                                                                                                                                                                                    |

**Get Many (Cursor)** makes one request and returns the full `{ data, meta }` response. It does not follow `meta.next_cursor`. Pass the cursor back in Additional Fields to read the next page.

## Credentials

Some resources need no credential, such as Product and Weather. See the Nodes table.

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

Add a Mockingbird node to a workflow. Pick a resource and an operation. Example: Mockingbird Commerce, Product, Get Many, with `Search` set to `chair`.

## Development

Nodes are generated from `spec/openapi.json` with `@devlikeapro/n8n-openapi-node`. Edit `scripts/generate.cjs`, not the files in `generated/`.

```bash
npm run generate
npm run build
npm run lint
```

CI fails when generated files drift from the spec.

## License

[MIT](LICENSE)
