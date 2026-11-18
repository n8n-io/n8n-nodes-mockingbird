// Build-time generator. Dev dependency only. Output is committed; CI fails on drift.
// Usage: node scripts/generate.cjs
const fs = require('fs');
const path = require('path');
const prettier = require('prettier');
const { N8NPropertiesBuilder } = require('@devlikeapro/n8n-openapi-node');

const spec = JSON.parse(
	fs.readFileSync(path.join(__dirname, '..', 'spec', 'openapi.json'), 'utf8'),
);

const OPERATIONS = require('./operations.cjs');

// One node per API (tag). `resource` is the n8n resource label.
// One entry per spec tag. NODES below groups them into the nodes users see.
const APIS = [
	{
		dir: 'ProductCatalogue',
		tag: 'Product Catalogue',
		resource: 'Product',
		description: 'Get products from the Mockingbird product catalogue',
	},
	{
		dir: 'Helpdesk',
		tag: 'Helpdesk',
		resource: 'Ticket',
		description: 'Manage support tickets in the Mockingbird helpdesk',
	},
	{
		dir: 'Orders',
		tag: 'Orders',
		resource: 'Order',
		description: 'Get orders from the Mockingbird orders API',
	},
	{
		dir: 'Weather',
		tag: 'Weather',
		resource: 'Weather',
		description: 'Get synthetic weather from Mockingbird',
	},
	{
		dir: 'ExchangeRates',
		tag: 'Exchange Rates',
		resource: 'Exchange Rate',
		description: 'Get synthetic exchange rates from Mockingbird',
	},
	{ dir: 'Quotes', tag: 'Quotes', resource: 'Quote', description: 'Get quotes from Mockingbird' },
	{
		dir: 'Utilities',
		tag: 'Utilities',
		resource: 'Utility',
		description: 'Use Mockingbird helper endpoints such as hash, validate, and convert',
	},
	{
		dir: 'CrmLite',
		tag: 'CRM Lite',
		resource: 'Customer',
		description: 'Get and create customers in Mockingbird CRM Lite',
	},
	{
		dir: 'FunPack',
		tag: 'Fun Pack',
		resource: 'Fun',
		description: 'Get dogs, cats, jokes, facts, and other fun data from Mockingbird',
	},
	{
		dir: 'PeopleHr',
		tag: 'People / HR',
		resource: 'Employee',
		description: 'Manage employees in Mockingbird People / HR',
	},
	{
		dir: 'TimeOff',
		tag: 'Time Off',
		resource: 'Time Off Request',
		description: 'Manage time off requests in Mockingbird',
	},
	{
		dir: 'Inventory',
		tag: 'Inventory',
		resource: 'Inventory',
		description: 'Check and reserve stock in Mockingbird Inventory',
	},
	{
		dir: 'BatchJobs',
		tag: 'Batch Jobs',
		resource: 'Job',
		description: 'Create and check jobs in Mockingbird Batch Jobs',
	},
	{
		dir: 'EventStream',
		tag: 'Event Stream',
		resource: 'Event',
		description: 'Get events from the Mockingbird event stream',
	},
	{
		dir: 'FraudDetection',
		tag: 'Fraud Detection',
		resource: 'Transaction',
		description: 'Score transactions and manage cases in Mockingbird Fraud Detection',
	},
	{
		dir: 'SecurityMonitor',
		tag: 'Security Monitor',
		resource: 'Security',
		description: 'Get security events and manage blocks in Mockingbird Security Monitor',
	},
	{
		dir: 'ProductReviews',
		tag: 'Product Reviews',
		resource: 'Review',
		description: 'Manage product reviews in Mockingbird',
	},
	{
		dir: 'WebhookHub',
		tag: 'Webhook Hub',
		resource: 'Webhook',
		description: 'Manage and fire webhooks in Mockingbird Webhook Hub',
	},
	{
		dir: 'DocumentStore',
		tag: 'Document Store',
		resource: 'File',
		description: 'List files in the Mockingbird document store',
	},
	{
		dir: 'Sandbox',
		tag: 'Sandbox',
		resource: 'Sandbox',
		description: 'Reset a sandbox or get a new sandbox ID in Mockingbird',
	},
	{
		dir: 'MeetingRooms',
		tag: 'Meeting Rooms',
		resource: 'Room',
		description: 'Check rooms and manage bookings in Mockingbird Meeting Rooms',
	},
	{
		dir: 'KnowledgeBase',
		tag: 'Knowledge Base',
		resource: 'Article',
		description: 'Search and get articles in the Mockingbird knowledge base',
	},
	{
		dir: 'AgentTools',
		tag: 'Agent Tools',
		resource: 'Agent Tool',
		description: 'Use the Mockingbird tools made for AI agents',
	},
	{
		dir: 'Classifier',
		tag: 'Classifier',
		resource: 'Text',
		description: 'Classify text and extract entities with Mockingbird',
	},
	{
		dir: 'Assessments',
		tag: 'Assessments',
		resource: 'Assessment',
		description: 'Get and submit assessments in Mockingbird',
	},
];

const NODES = [
	{
		dir: 'Commerce',
		displayName: 'Mockingbird Commerce',
		description: 'Work with products, orders, inventory, reviews, and customers in Mockingbird',
		tags: ['Product Catalogue', 'Orders', 'Inventory', 'Product Reviews', 'CRM Lite'],
	},
	{
		dir: 'Support',
		displayName: 'Mockingbird Support',
		description: 'Work with tickets, articles, agent tools, and text classification in Mockingbird',
		tags: ['Helpdesk', 'Knowledge Base', 'Agent Tools', 'Classifier'],
	},
	{
		dir: 'People',
		displayName: 'Mockingbird People',
		description: 'Work with employees, time off, and meeting rooms in Mockingbird',
		tags: ['People / HR', 'Time Off', 'Meeting Rooms'],
	},
	{
		dir: 'FinanceSecurity',
		displayName: 'Mockingbird Finance and Security',
		description: 'Work with fraud checks, security events, and exchange rates in Mockingbird',
		tags: ['Fraud Detection', 'Security Monitor', 'Exchange Rates'],
	},
	{
		dir: 'Platform',
		displayName: 'Mockingbird Platform',
		description:
			'Work with jobs, events, webhooks, documents, sandboxes, and assessments in Mockingbird',
		tags: ['Batch Jobs', 'Event Stream', 'Webhook Hub', 'Document Store', 'Sandbox', 'Assessments'],
	},
	{
		dir: 'Fun',
		displayName: 'Mockingbird Fun and Utilities',
		description: 'Get weather, quotes, fun data, and helper endpoints from Mockingbird',
		tags: ['Fun Pack', 'Utilities', 'Weather', 'Quotes'],
	},
];

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
		const { displayOptions, ...c } = p;
		// ID filters reject 0, so an untouched default would fail with 422.
		const child = c.type === 'number' && /_id$/.test(c.name) ? withIdMinimum(c) : c;
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

// Valid values are not in the spec (see docs/SPEC-GAPS.md). Verified against the live API.
const CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF', 'SEK', 'NOK', 'PLN', 'CZK', 'JPY', 'AUD'];
const ENUMS = {
	'Product Catalogue': {
		category: ['bearings', 'compressors', 'controls', 'pumps', 'spares', 'valves'],
	},
	Helpdesk: {
		status: ['open', 'pending', 'resolved', 'closed'],
		priority: ['low', 'normal', 'high', 'urgent'],
		category: ['billing', 'defect', 'installation', 'shipping', 'other'],
	},
	'Exchange Rates': {
		base: CURRENCIES,
		from: CURRENCIES,
		to: CURRENCIES,
	},
	'CRM Lite': {
		segment: ['enterprise', 'mid_market', 'small'],
		country: [
			'AT',
			'AU',
			'BR',
			'CA',
			'CH',
			'DE',
			'ES',
			'FR',
			'GB',
			'IE',
			'IN',
			'IT',
			'JP',
			'NL',
			'NO',
			'PL',
			'SE',
			'SG',
			'US',
		],
	},
	Orders: {
		status: ['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'],
	},
	'People / HR': {
		status: ['active', 'on_leave'],
		department: ['engineering', 'finance', 'hr', 'ops', 'sales', 'support'],
	},
	'Time Off': {
		leave_type: ['annual', 'sick', 'unpaid', 'parental'],
		status: ['pending', 'approved', 'rejected', 'cancelled'],
		department: ['engineering', 'finance', 'hr', 'ops', 'sales', 'support'],
	},
	'Batch Jobs': {
		type: ['export_orders', 'report_sales', 'bulk_price_update'],
	},
	'Webhook Hub': {
		event_type: ['order.created', 'ticket.updated', 'review.created', 'transaction.flagged'],
	},
	'Agent Tools': {
		resolution_category: [
			'resolved-info',
			'replacement-shipped',
			'refund-issued',
			'no-fault-found',
			'escalated',
		],
	},
	'Fraud Detection': {
		status: ['cleared', 'confirmed_fraud'],
	},
};

const UNWRAP = '__unwrapData__';
const optionName = (v) => v.replace(/[_.-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

function applyEnums(props, tag) {
	const enums = ENUMS[tag] || {};
	return props.map((p) => {
		if (p.type === 'collection') return { ...p, options: applyEnums(p.options, tag) };
		const values = enums[p.name];
		if (!values || p.type !== 'string' || !p.routing) return p;
		return {
			...p,
			type: 'options',
			options: values.map((v) => ({ name: optionName(v), value: v })),
			default: values[0],
		};
	});
}

// Paginated lists: replace page, limit, and paginate with Return All and Limit.
// The API returns the full set as a bare array when `paginate=false`, which n8n splits into items.
// Cursor lists keep their cursor fields and the full `{ data, meta }` response, so `next_cursor` stays visible.
function addListHandling(props) {
	const out = [];
	const opProp = props.find((p) => p.name === 'operation');
	const routingFor = (value) => opProp.options.find((o) => o.value === value).routing;
	for (const p of props) {
		if (p.type !== 'collection') {
			out.push(p);
			continue;
		}
		const names = p.options.map((o) => o.name);
		const op = p.displayOptions.show.operation[0];
		const resource = p.displayOptions.show.resource;
		const isOffset = ['page', 'limit', 'paginate'].every((n) => names.includes(n));
		if (isOffset) {
			const rest = p.options.filter((o) => !['page', 'limit', 'paginate'].includes(o.name));
			const show = { resource, operation: [op] };
			out.push(
				{
					displayName: 'Return All',
					name: 'returnAll',
					type: 'boolean',
					default: false,
					description: 'Whether to return all results or only up to a given limit',
					displayOptions: { show },
				},
				{
					displayName: 'Limit',
					name: 'limit',
					type: 'number',
					typeOptions: { minValue: 1, maxValue: 200 },
					default: 50,
					description: 'Max number of results to return',
					displayOptions: { show: { ...show, returnAll: [false] } },
				},
			);
			if (rest.length) out.push({ ...p, options: rest });
			const routing = routingFor(op);
			routing.request.qs = {
				...(routing.request.qs || {}),
				paginate: '={{ !$parameter.returnAll }}',
				// The Limit field is hidden when Return All is on, so never send an empty value.
				limit: '={{ $parameter.returnAll ? 200 : $parameter.limit }}',
			};
			routing.output = { postReceive: [UNWRAP] };
			continue;
		}
		out.push(p);
	}
	return out;
}

// Final pass so generated properties satisfy the n8n lint rules for community nodes.
// Lint wants "ID" in prose. Leave backticked field names such as `id` alone.
const fixId = (text) => text.replace(/(`[^`]*`)|\b[Ii]d\b/g, (m, code) => code || 'ID');
const KEY_ORDER = ['displayName', 'name', 'type'];
function normalize(props) {
	return props.map((p) => {
		const out = { ...p };
		if (out.description !== undefined) {
			let d = fixId(String(out.description).trim());
			d = d.charAt(0).toUpperCase() + d.slice(1);
			const label = out.displayName || out.name;
			if (!d || (label && d.toLowerCase() === String(label).toLowerCase())) delete out.description;
			else out.description = d;
		}
		if (out.name === 'limit' && out.type === 'number') {
			out.typeOptions = { minValue: 1, ...out.typeOptions };
			out.description = 'Max number of results to return';
			out.default = 50;
		}
		if (out.type === 'json' && /^\[\s*null\s*\]$/.test(String(out.default))) out.default = '[]';
		if (out.name === 'Idempotency-Key') {
			// The API rejects POST /reservations without this header, although the spec marks it optional.
			out.displayName = 'Idempotency Key';
			out.required = true;
			out.default =
				'={{ ($execution.id || $now.toMillis()) + "-" + $workflow.id + "-" + $runIndex + "-" + $itemIndex }}';
			out.description =
				'Sent as the Idempotency-Key header. The default is unique per execution, workflow, run, and item, so a retry inside one execution reuses the key. It contains the execution and workflow IDs, which are sent to the API. Repeating a key returns the first result instead of creating a second reservation.';
		}
		if (out.type === 'string' && /email/i.test(out.name) && !out.placeholder) {
			out.placeholder = 'name@email.com';
		}
		if (Array.isArray(out.options)) {
			let options = out.options;
			if (out.type === 'collection') {
				options = normalize(options).sort((a, b) => a.displayName.localeCompare(b.displayName));
			} else if (out.name !== 'operation' && out.name !== 'resource') {
				options = options
					.map((o) => {
						const c = { ...o };
						if (!c.description || c.description === c.name) delete c.description;
						return c;
					})
					.sort((a, b) => a.name.localeCompare(b.name));
			} else {
				options = options
					.map((o) => {
						const c = { ...o };
						if (c.description) c.description = fixId(c.description);
						if (!c.description || c.description.toLowerCase() === String(c.name).toLowerCase()) {
							delete c.description;
						}
						return c;
					})
					.sort((a, b) => a.name.localeCompare(b.name));
			}
			out.options = options;
		}
		const ordered = {};
		for (const k of KEY_ORDER) if (k in out) ordered[k] = out[k];
		for (const k of Object.keys(out)) if (!(k in ordered)) ordered[k] = out[k];
		return ordered;
	});
}

// Path values are user input. Encode them so `/`, `?`, and `#` cannot change the route.
function encodePathParams(props) {
	return props.map((p) => {
		if (p.name !== 'operation') return p;
		return {
			...p,
			options: p.options.map((o) => ({
				...o,
				routing: {
					...o.routing,
					request: {
						...o.routing.request,
						url: o.routing.request.url.replace(
							/\{\{\$parameter\["(\w+)"\]\}\}/g,
							'{{encodeURIComponent($parameter["$1"])}}',
						),
					},
				},
			})),
		};
	});
}

// Smallest value the spec allows per ID name. Reservation, booking, and case IDs start at 100000.
const ID_MINIMUMS = (() => {
	const mins = {};
	const add = (name, schema) => {
		if (/_id$/.test(name) && schema && typeof schema.minimum === 'number') {
			if (name in mins && mins[name] !== schema.minimum) {
				throw new Error(
					`Conflicting spec minimums for ${name}: ${mins[name]} and ${schema.minimum}`,
				);
			}
			mins[name] = schema.minimum;
		}
	};
	for (const item of Object.values(spec.paths)) {
		for (const op of Object.values(item)) {
			for (const prm of op.parameters || []) add(prm.name, prm.schema);
		}
	}
	for (const schema of Object.values(spec.components.schemas)) {
		for (const [name, prop] of Object.entries(schema.properties || {})) add(name, prop);
	}
	return mins;
})();

function withIdMinimum(p) {
	const min = ID_MINIMUMS[p.name] || 1;
	return { ...p, default: min, typeOptions: { ...p.typeOptions, minValue: min } };
}

// ID fields (path or body) start at the spec minimum, because the API rejects 0 and anything below it.
function idDefaults(props) {
	return props.map((p) => {
		if (p.type === 'collection') return { ...p, options: idDefaults(p.options) };
		if (p.type === 'number' && /_id$/.test(p.name)) {
			return withIdMinimum(p);
		}
		return p;
	});
}

function setOperationDefault(props) {
	return props.map((p) => (p.name === 'operation' ? { ...p, default: p.options[0].value } : p));
}

function postProcess(properties, tag) {
	// The builder gates fields on operation *names*; our option values are kebab-case.
	const opNames = Object.values(OPERATIONS).map(([name]) => name);
	const toValue = (v) => (opNames.includes(v) ? kebab(v) : v);
	const collected = collectOptional(
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
	return normalize(
		setOperationDefault(idDefaults(encodePathParams(addListHandling(applyEnums(collected, tag))))),
	);
}

const opKey = (context) => `${context.method.toUpperCase()} ${context.pattern}`;
const operationParser = {
	shouldSkip: (op, context) => !OPERATIONS[opKey(context)],
	name: (op, context) => OPERATIONS[opKey(context)][0],
	value: (op, context) => kebab(OPERATIONS[opKey(context)][0]),
	action: (op, context) => OPERATIONS[opKey(context)][1],
	description: (op) => (op.summary || '').replace(/\s*\(.*\)\s*$/, ''),
};

const ROOT = path.join(__dirname, '..');
const icon = fs.readFileSync(path.join(ROOT, 'assets', 'mockingbird.svg'));

function nodeSource(cls, displayName, description, required) {
	return `import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { generatedProperties } from './generated/properties';

export class ${cls} implements INodeType {
	description: INodeTypeDescription = {
		displayName: ${JSON.stringify(displayName)},
		name: ${JSON.stringify(cls.charAt(0).toLowerCase() + cls.slice(1))},
		icon: { light: 'file:mockingbird.svg', dark: 'file:mockingbird.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"].replace(/-/g, " ") + ": " + $parameter["resource"]}}',
		description: ${JSON.stringify(description)},
		defaults: {
			name: ${JSON.stringify(displayName)},
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'mockingbirdApi', required: ${required} }],
		requestDefaults: {
			baseURL: '={{ ($credentials?.baseUrl || "https://mockingbird.n8n.io/v1").replace(/\\\\/+$/, "") }}',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: generatedProperties,
	};
}
`;
}

// Emit formatted output so generated files match the repo style and diffs stay small.
async function writeFormatted(file, content) {
	const options = (await prettier.resolveConfig(file)) || {};
	fs.writeFileSync(file, await prettier.format(content, { ...options, filepath: file }));
}

(async () => {
	const nodePaths = [];
	for (const { dir, displayName, description, tags } of NODES) {
		const properties = [];
		const resources = [];
		let secured = [];
		for (const tag of tags) {
			const { resource } = APIS.find((a) => a.tag === tag);
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
			const built = postProcess(
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
			for (const p of built) {
				if (p.name === 'resource') resources.push(...p.options);
				else properties.push(p);
			}
			secured = secured.concat(
				Object.values(sub.paths).flatMap((item) =>
					Object.values(item).map((op) => Boolean(op.security && op.security.length)),
				),
			);
		}
		const names = resources.map((r) => r.value);
		if (new Set(names).size !== names.length) throw new Error(`Duplicate resource in ${dir}`);
		resources.sort((a, b) => a.name.localeCompare(b.name));
		properties.unshift({
			displayName: 'Resource',
			name: 'resource',
			type: 'options',
			noDataExpression: true,
			options: resources,
			default: resources[0].value,
		});
		const out = path.join(__dirname, '..', 'nodes', dir, 'generated');
		fs.mkdirSync(out, { recursive: true });
		await writeFormatted(
			path.join(out, 'properties.ts'),
			"// Generated by scripts/generate.cjs. Do not edit.\nimport type { INodeProperties } from 'n8n-workflow';\n" +
				(JSON.stringify(properties).includes('__unwrapData__')
					? "import { unwrapData } from '../../shared/unwrapData';\n"
					: '') +
				'\nexport const generatedProperties: INodeProperties[] = ' +
				JSON.stringify(properties, null, '\t').replace(/"__unwrapData__"/g, 'unwrapData') +
				';\n',
		);
		// Credential is required only when every generated operation needs auth.
		const required = secured.length > 0 && secured.every(Boolean);
		const cls = 'Mockingbird' + dir;
		const nodeDir = path.join(ROOT, 'nodes', dir);
		await writeFormatted(
			path.join(nodeDir, cls + '.node.ts'),
			nodeSource(cls, displayName, description, required),
		);
		// Codex files are not used. Remove any left from older runs.
		fs.rmSync(path.join(nodeDir, cls + '.node.json'), { force: true });
		fs.writeFileSync(path.join(nodeDir, 'mockingbird.svg'), icon);
		fs.writeFileSync(path.join(nodeDir, 'mockingbird.dark.svg'), icon);
		nodePaths.push(`dist/nodes/${dir}/${cls}.node.js`);
		console.log(dir, properties.length, 'properties');
	}

	// Remove generated node folders that no longer exist in NODES. Folders without generated output stay.
	const keep = new Set(['shared', ...NODES.map((n) => n.dir)]);
	for (const d of fs.readdirSync(path.join(ROOT, 'nodes'))) {
		const generatedDir = path.join(ROOT, 'nodes', d, 'generated');
		if (!keep.has(d) && fs.existsSync(generatedDir)) {
			fs.rmSync(path.join(ROOT, 'nodes', d), { recursive: true, force: true });
		}
	}

	fs.writeFileSync(path.join(ROOT, 'credentials', 'mockingbird.svg'), icon);
	fs.writeFileSync(path.join(ROOT, 'credentials', 'mockingbird.dark.svg'), icon);

	const pkgPath = path.join(ROOT, 'package.json');
	const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
	// Keep hand-written nodes: entries whose folder exists and has no generated output.
	const handWritten = (pkg.n8n.nodes || []).filter((n) => {
		const dir = n.split('/')[2];
		const folder = path.join(ROOT, 'nodes', dir);
		// A folder removed by the cleanup above no longer exists, so its stale path is dropped.
		return (
			!nodePaths.includes(n) &&
			fs.existsSync(folder) &&
			!fs.existsSync(path.join(folder, 'generated'))
		);
	});
	pkg.n8n.nodes = [...nodePaths, ...handWritten];
	await writeFormatted(pkgPath, JSON.stringify(pkg, null, '\t') + '\n');
})();
