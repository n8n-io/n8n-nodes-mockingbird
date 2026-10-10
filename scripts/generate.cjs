// Build-time generator. Dev dependency only. Output is committed; CI fails on drift.
// Usage: node scripts/generate.cjs
const fs = require('fs');
const path = require('path');
const { N8NPropertiesBuilder } = require('@devlikeapro/n8n-openapi-node');

const spec = JSON.parse(
	fs.readFileSync(path.join(__dirname, '..', 'spec', 'openapi.json'), 'utf8'),
);

// One node per API (tag). Pilot set. `resource` is the n8n resource label.
const NODES = [
	{ dir: 'ProductCatalogue', tag: 'Product Catalogue', resource: 'Product' },
	{ dir: 'Helpdesk', tag: 'Helpdesk', resource: 'Ticket' },
	{ dir: 'Orders', tag: 'Orders', resource: 'Order' },
];

// operationId -> n8n standard vocabulary. Anything missing here is skipped.
// Binary endpoints (PDF, zip) are hand-written overrides, not generated.
const OPERATIONS = {
	list_products_v1_products_get: ['Get Many', 'Get many products'],
	product_categories_v1_products_categories_get: ['Get Categories', 'Get product categories'],
	get_product_v1_products__product_id__get: ['Get', 'Get a product'],
	list_orders_v1_orders_get: ['Get Many', 'Get many orders'],
	list_orders_cursor_v1_orders_cursor_get: [
		'Get Many (Cursor)',
		'Get many orders using cursor pagination',
	],
	get_order_v1_orders__order_id__get: ['Get', 'Get an order'],
	list_tickets_v1_tickets_get: ['Get Many', 'Get many tickets'],
	create_ticket_v1_tickets_post: ['Create', 'Create a ticket'],
	get_ticket_v1_tickets__ticket_id__get: ['Get', 'Get a ticket'],
	patch_ticket_v1_tickets__ticket_id__patch: ['Update', 'Update a ticket'],
	put_ticket_v1_tickets__ticket_id__put: ['Replace', 'Replace a ticket'],
	add_comment_v1_tickets__ticket_id__comments_post: ['Add Comment', 'Add a comment to a ticket'],
};

const kebab = (s) =>
	s
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');

const LABELS = {
	q: 'Search',
	fmt: 'Format',
	paginate: 'Paginate',
	min_price_cents: 'Min Price (Cents)',
	max_price_cents: 'Max Price (Cents)',
};
const titleCase = (n) =>
	LABELS[n] ||
	n
		.replace(/_id$/, ' ID')
		.replace(/_/g, ' ')
		.replace(/\b\w/g, (c) => c.toUpperCase());

// Align generator output with the n8n UX guidelines.
// Optional fields go into one collection per operation, so only fields the user adds are sent.
// Empty defaults would otherwise be sent (for example `?fmt=` returns 406).
// `fmt` is dropped: non-JSON formats need hand-written output parsing.
const DROPPED = ['fmt'];
function collectOptional(properties) {
	const kept = [];
	const byOp = new Map();
	for (const p of properties) {
		const op = p.displayOptions && p.displayOptions.show && p.displayOptions.show.operation;
		const sends = p.routing && p.routing.send;
		if (DROPPED.includes(p.name) && sends) continue;
		if (!op || !sends || p.required) {
			kept.push(p);
			continue;
		}
		const { displayOptions, ...child } = p;
		const key = op[0];
		if (!byOp.has(key)) {
			byOp.set(key, {
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions,
				options: [],
			});
			kept.push(byOp.get(key));
		}
		byOp.get(key).options.push(child);
	}
	return kept;
}

function postProcess(properties, tag) {
	// The builder gates fields on operation *names*; our option values are kebab-case.
	const opNames = Object.values(OPERATIONS).map(([name]) => name);
	const toValue = (v) => (opNames.includes(v) ? kebab(v) : v);
	return collectOptional(
		properties
			.filter((p) => p.type !== 'notice')
			.map((p) => {
				const out = { ...p };
				const show = out.displayOptions && out.displayOptions.show;
				if (show && show.operation) {
					out.displayOptions = {
						...out.displayOptions,
						show: { ...show, operation: show.operation.map(toValue) },
					};
				}
				if (out.name === 'resource') {
					if (!out.options || !out.options.length) {
						throw new Error(
							'No operations matched tag "' + tag + '". Check the tag name in the spec.',
						);
					}
					out.default = out.options[0].value;
				} else if (out.name !== 'operation') out.displayName = titleCase(out.name);
				if (out.name === 'paginate') {
					out.description =
						'Whether to return a paginated envelope. When off, the API returns the full set as a bare array.';
				} else if (
					out.type === 'boolean' &&
					out.description &&
					!out.description.startsWith('Whether')
				) {
					out.description =
						'Whether ' + out.description.charAt(0).toLowerCase() + out.description.slice(1);
				}
				return out;
			}),
	);
}

const operationParser = {
	shouldSkip: (op) => !OPERATIONS[op.operationId],
	name: (op) => OPERATIONS[op.operationId][0],
	value: (op) => kebab(OPERATIONS[op.operationId][0]),
	action: (op) => OPERATIONS[op.operationId][1],
	description: (op) => (op.summary || '').replace(/\s*\(.*\)\s*$/, ''),
};

for (const { dir, tag, resource } of NODES) {
	const sub = JSON.parse(JSON.stringify(spec));
	sub.paths = {};
	for (const [p, item] of Object.entries(spec.paths)) {
		const kept = {};
		for (const [method, op] of Object.entries(item)) {
			if (op.tags && op.tags.includes(tag)) kept[method] = op;
		}
		if (Object.keys(kept).length) sub.paths[p.replace(/^\/v1/, '')] = kept;
	}
	sub.tags = (spec.tags || []).filter((t) => t.name === tag);
	const properties = postProcess(
		new N8NPropertiesBuilder(sub, {
			operation: operationParser,
			resource: {
				name: () => resource,
				value: () => kebab(resource),
				description: () => '',
			},
		}).build(),
		tag,
	);
	const out = path.join(__dirname, '..', 'nodes', dir, 'generated');
	fs.mkdirSync(out, { recursive: true });
	fs.writeFileSync(
		path.join(out, 'properties.ts'),
		"// Generated by scripts/generate.cjs. Do not edit.\nimport type { INodeProperties } from 'n8n-workflow';\n\nexport const generatedProperties: INodeProperties[] = " +
			JSON.stringify(properties, null, '\t') +
			';\n',
	);
	console.log(dir, properties.length, 'properties');
}
