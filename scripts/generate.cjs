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
const NODES = [
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
		const child =
			c.type === 'number' && /_id$/.test(c.name)
				? { ...c, default: 1, typeOptions: { ...c.typeOptions, minValue: 1 } }
				: c;
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
		base: ['EUR', 'USD', 'GBP', 'CHF', 'SEK', 'NOK', 'PLN', 'CZK', 'JPY', 'AUD'],
		from: ['EUR', 'USD', 'GBP', 'CHF', 'SEK', 'NOK', 'PLN', 'CZK', 'JPY', 'AUD'],
		to: ['EUR', 'USD', 'GBP', 'CHF', 'SEK', 'NOK', 'PLN', 'CZK', 'JPY', 'AUD'],
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
};

const UNWRAP = '__unwrapData__';
const optionName = (v) => v.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

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
	return normalize(setOperationDefault(addListHandling(applyEnums(collected, tag))));
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
		displayName: '${displayName}',
		name: '${cls.charAt(0).toLowerCase() + cls.slice(1)}',
		icon: { light: 'file:mockingbird.svg', dark: 'file:mockingbird.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"].replace(/-/g, " ") + ": " + $parameter["resource"]}}',
		description: '${description}',
		defaults: {
			name: '${displayName}',
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

function nodeCodex(cls) {
	const base = 'https://github.com/n8n-io/n8n-nodes-mockingbird';
	return (
		JSON.stringify(
			{
				node: 'n8n-nodes-mockingbird.' + cls.charAt(0).toLowerCase() + cls.slice(1),
				nodeVersion: '1.0',
				codexVersion: '1.0',
				categories: ['Development'],
				resources: {
					credentialDocumentation: [{ url: base + '?tab=readme-ov-file#credentials' }],
					primaryDocumentation: [{ url: base + '?tab=readme-ov-file' }],
				},
			},
			null,
			'\t',
		) + '\n'
	);
}

// Emit formatted output so generated files match the repo style and diffs stay small.
async function writeFormatted(file, content) {
	const options = (await prettier.resolveConfig(file)) || {};
	fs.writeFileSync(file, await prettier.format(content, { ...options, filepath: file }));
}

(async () => {
	const nodePaths = [];
	for (const { dir, tag, resource, description } of NODES) {
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
		const secured = Object.values(sub.paths).flatMap((item) =>
			Object.values(item).map((op) => Boolean(op.security && op.security.length)),
		);
		const required = secured.length > 0 && secured.every(Boolean);
		const cls = 'Mockingbird' + dir;
		const nodeDir = path.join(ROOT, 'nodes', dir);
		await writeFormatted(
			path.join(nodeDir, cls + '.node.ts'),
			nodeSource(cls, 'Mockingbird ' + tag, description, required),
		);
		await writeFormatted(path.join(nodeDir, cls + '.node.json'), nodeCodex(cls));
		fs.writeFileSync(path.join(nodeDir, 'mockingbird.svg'), icon);
		fs.writeFileSync(path.join(nodeDir, 'mockingbird.dark.svg'), icon);
		nodePaths.push(`dist/nodes/${dir}/${cls}.node.js`);
		console.log(dir, properties.length, 'properties');
	}

	fs.writeFileSync(path.join(ROOT, 'credentials', 'mockingbird.svg'), icon);
	fs.writeFileSync(path.join(ROOT, 'credentials', 'mockingbird.dark.svg'), icon);

	const pkgPath = path.join(ROOT, 'package.json');
	const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
	// Keep hand-written nodes: replace only the entries for generated node folders.
	const generated = new Set(NODES.map((n) => `dist/nodes/${n.dir}/`));
	const handWritten = (pkg.n8n.nodes || []).filter(
		(n) => ![...generated].some((prefix) => n.startsWith(prefix)),
	);
	pkg.n8n.nodes = [...nodePaths, ...handWritten];
	await writeFormatted(pkgPath, JSON.stringify(pkg, null, '\t') + '\n');
})();
