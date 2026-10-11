const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const nodesDir = path.join(__dirname, '..', 'dist', 'nodes');
const nodeFiles = fs
	.readdirSync(nodesDir)
	.filter((d) => d !== 'shared')
	.map((d) => path.join(nodesDir, d, `Mockingbird${d}.node.js`));

// Nodes whose Get Many is paginated by the API. Others return a bare list.
const PAGINATED = [
	'ProductCatalogue',
	'Helpdesk',
	'Orders',
	'CrmLite',
	'PeopleHr',
	'ProductReviews',
	'TimeOff',
];

for (const file of nodeFiles) {
	const Node = Object.values(require(file))[0];
	const { properties, credentials } = new Node().description;
	const name = path.basename(file);
	const operation = properties.find((p) => p.name === 'operation');
	const values = operation.options.map((o) => o.value);

	test(`${name}: operation default is a real option`, () => {
		assert.ok(values.includes(operation.default));
	});

	test(`${name}: every field is gated on a real operation`, () => {
		for (const p of properties.filter((x) => x.displayOptions?.show?.operation)) {
			for (const v of p.displayOptions.show.operation) {
				assert.ok(values.includes(v), `${p.name} is gated on unknown operation ${v}`);
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
		for (const o of operation.options) {
			const raw = o.routing.request.url.replace(/encodeURIComponent\(\$parameter\["\w+"\]\)/g, '');
			assert.doesNotMatch(raw, /\$parameter/, `${o.value} has an unencoded path parameter`);
		}
	});

	if (PAGINATED.includes(path.basename(path.dirname(file)))) {
		test(`${name}: Get Many returns one item per row`, () => {
			const many = operation.options.find((o) => o.value === 'get-many');
			assert.ok(many, 'has a get-many operation');
			assert.ok(
				properties.some(
					(p) => p.name === 'returnAll' && p.displayOptions.show.operation.includes('get-many'),
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
