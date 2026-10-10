# OpenAPI spec gaps

Gaps in `https://mockingbird.n8n.io/openapi.json` that affect the generated nodes. Close them in the Mockingbird API repo, then run `npm run generate`.

Found 2026-10-10 against spec version 1.0.0.

## 1. No enums anywhere

The spec has no `enum` on any parameter or body field. Fields with a fixed set of values are plain strings. The nodes cannot offer dropdowns, and users must guess valid values.

Values below were read from live seed data. They show what exists today. They are not confirmed lists, so the API owners must confirm them. Rare values may be missing.

| Endpoint | Field | Observed values |
| --- | --- | --- |
| `GET /tickets`, `POST /tickets`, `PATCH /tickets/{id}`, `PUT /tickets/{id}` | `status` | closed, open, pending, resolved |
| same | `priority` | high, low, normal, urgent |
| same | `category` | billing, defect, installation, other, shipping |
| `GET /orders`, `GET /orders/cursor` | `status` | cancelled, delivered, paid, pending, refunded, shipped |
| `GET /employees`, `POST /employees`, `PATCH /employees/{id}` | `status` | active, on_leave |
| same | `department` | engineering, finance, hr, ops, sales, support |
| `GET /time-off/requests`, `PATCH /time-off/requests/{id}` | `status` | approved, rejected (the PATCH summary also names a cancel action) |
| `GET /reviews` | `status` | published (moderation adds more) |
| `GET /reviews` | `rating` | 1 to 5 |
| `GET /customers` | `segment` | enterprise, mid_market, small |
| `GET /customers` | `country` | AT, AU, BR, CA, CH, DE, ES, FR, GB, IE, IN, IT, JP, NL, NO, PL, SE, SG, US |
| `GET /products` | `category` | bearings, compressors, controls, pumps, spares, valves |
| `GET /products`, `GET /products/{id}`, `GET /orders` | `fmt` | json, xml, csv, html (from the 406 message) |

Ask: add `enum` (or a shared enum schema) to each field. For `category` on products, link it to `GET /products/categories`.

## 2. Empty `fmt` returns 406

`GET /products?fmt=` returns `406 Unsupported format` with "'.' is not a supported extension". An empty value should be treated as not set. Clients that send every parameter, such as n8n, hit this.

## 3. Two response shapes depending on `paginate`

`paginate` on (default) returns `{ "data": [...], "meta": {...} }`. `paginate=false` returns a bare array of the whole set and ignores `page` and `limit`. The spec describes only the envelope. Ask: document both responses with `oneOf`, or add a separate path for the full set.

## 4. Generated operation IDs are unreadable

FastAPI default IDs such as `get_ticket_v1_tickets__ticket_id__get` are used. Generators cannot make good names from them. Ask: set an explicit `operation_id` on each route, for example `tickets_get`.

## 5. Request bodies that are not JSON

`POST /files` (multipart), and `POST /oauth/authorize` and `POST /oauth/token` (form-encoded), cannot be generated. The nodes skip them. Binary responses (PDF, zip, SVG, PNG, octet-stream) are skipped too.

## 6. Python clients get 403

A plain Python `urllib` request got `403 Forbidden` with a valid key, while curl worked. This is probably a user agent rule at the edge. Check whether it is intended.

## 7. Success responses missing on create operations

Most `POST` operations have no `200` or `201` response schema (for example `POST /tickets`, `POST /customers`, `POST /reservations`). The nodes cannot document the output.
