const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const nodesDir = path.join(__dirname, '..', 'dist', 'nodes');
const nodeFiles = fs
	.readdirSync(nodesDir)
	.filter((d) => d !== 'shared')
	.map((d) => path.join(nodesDir, d, `Mockingbird${d}.node.js`));

// Resources whose Get Many is paginated by the API. Others return a bare list.
const PAGINATED = [
	'product',
	'ticket',
	'order',
	'customer',
	'employee',
	'review',
	'time-off-request',
];

const load = (file) => {
	const Node = Object.values(require(file))[0];
	return new Node().description;
};

for (const file of nodeFiles) {
	const { properties, credentials } = load(file);
	const name = path.basename(file);
	const resource = properties.find((p) => p.name === 'resource');
	const resourceValues = resource.options.map((o) => o.value);
	// One operation property per resource.
	const operations = properties.filter((p) => p.name === 'operation');
	const opsFor = (res) => operations.find((p) => p.displayOptions.show.resource.includes(res));

	test(`${name}: resource default is a real option and every resource has operations`, () => {
		assert.ok(resourceValues.includes(resource.default));
		assert.strictEqual(new Set(resourceValues).size, resourceValues.length, 'unique resources');
		for (const r of resourceValues) assert.ok(opsFor(r), `${r} has an operation property`);
	});

	test(`${name}: operation default is a real option`, () => {
		for (const op of operations) {
			assert.ok(op.options.map((o) => o.value).includes(op.default));
		}
	});

	test(`${name}: every field is gated on a real resource and operation`, () => {
		for (const p of properties.filter((x) => x.name !== 'resource')) {
			const show = p.displayOptions?.show;
			assert.ok(show?.resource, `${p.name} is gated on a resource`);
			for (const r of show.resource) assert.ok(resourceValues.includes(r), `${p.name}: ${r}`);
			if (!show.operation) continue;
			for (const r of show.resource) {
				const values = opsFor(r).options.map((o) => o.value);
				for (const v of show.operation) {
					assert.ok(values.includes(v), `${p.name} is gated on unknown operation ${r}/${v}`);
				}
			}
		}
	});

	test(`${name}: ID fields start at their minimum`, () => {
		const all = properties.flatMap((p) => (p.type === 'collection' ? p.options : [p]));
		for (const o of all.filter((x) => x.type === 'number' && /_id$/.test(x.name))) {
			assert.ok(o.typeOptions?.minValue >= 1, `${o.name} needs minValue 1 or more`);
			assert.equal(o.default, o.typeOptions.minValue, `${o.name} default must equal its minValue`);
		}
	});

	test(`${name}: path parameters are URL encoded`, () => {
		for (const op of operations) {
			for (const o of op.options) {
				const raw = o.routing.request.url.replace(
					/encodeURIComponent\(\$parameter\["\w+"\]\)/g,
					'',
				);
				assert.doesNotMatch(raw, /\$parameter/, `${o.value} has an unencoded path parameter`);
			}
		}
	});

	for (const res of resourceValues.filter((r) => PAGINATED.includes(r))) {
		test(`${name}: ${res} Get Many returns one item per row`, () => {
			const many = opsFor(res).options.find((o) => o.value === 'get-many');
			assert.ok(many, 'has a get-many operation');
			assert.ok(
				properties.some(
					(p) =>
						p.name === 'returnAll' &&
						p.displayOptions.show.resource.includes(res) &&
						p.displayOptions.show.operation.includes('get-many'),
				),
				'has Return All',
			);
			assert.ok(many.routing.request.qs.paginate, 'sends paginate');
			assert.match(many.routing.request.qs.limit, /returnAll \? 200/, 'limit is never empty');
			assert.strictEqual(many.routing.output.postReceive.length, 1);
			assert.strictEqual(typeof many.routing.output.postReceive[0], 'function');
		});
	}

	test(`${name}: declares the credential`, () => {
		assert.strictEqual(credentials[0].name, 'mockingbirdApi');
	});
}

test('every paginated resource is covered by a node', () => {
	const found = new Set(
		nodeFiles.flatMap((f) =>
			load(f)
				.properties.find((p) => p.name === 'resource')
				.options.map((o) => o.value),
		),
	);
	for (const r of PAGINATED) assert.ok(found.has(r), `${r} exists`);
});

test('reservation, booking, and case IDs start at the spec minimum of 100000', () => {
	const cases = [
		['Commerce', 'reservation_id'],
		['People', 'booking_id'],
		['FinanceSecurity', 'case_id'],
	];
	for (const [dir, field] of cases) {
		const { properties } = load(path.join(nodesDir, dir, `Mockingbird${dir}.node.js`));
		const all = properties.flatMap((p) => (p.type === 'collection' ? p.options : [p]));
		const found = all.filter((p) => p.name === field);
		assert.ok(found.length > 0, `${dir} has ${field}`);
		for (const f of found) assert.strictEqual(f.default, 100000, `${dir} ${field} default`);
	}
});
