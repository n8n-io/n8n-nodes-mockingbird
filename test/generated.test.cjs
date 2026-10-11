const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const nodesDir = path.join(__dirname, '..', 'dist', 'nodes');
const nodeFiles = fs
	.readdirSync(nodesDir)
	.filter((d) => d !== 'shared')
	.map((d) => path.join(nodesDir, d, `Mockingbird${d}.node.js`));

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

	test(`${name}: optional fields never send an empty default`, () => {
		for (const c of properties.filter((x) => x.type === 'collection')) {
			for (const o of c.options) {
				if (/_id$/.test(o.name)) assert.ok(o.default >= 1, `${o.name} default must be >= 1`);
			}
		}
	});

	test(`${name}: Get Many returns one item per row`, () => {
		const many = operation.options.find((o) => o.value === 'get-many');
		const paginated = properties.some(
			(p) => p.name === 'returnAll' && p.displayOptions?.show?.operation?.includes('get-many'),
		);
		if (!many || !paginated) return;
		assert.ok(many.routing.request.qs.paginate, 'sends paginate');
		assert.match(many.routing.request.qs.limit, /returnAll \? 200/, 'limit is never empty');
		assert.strictEqual(many.routing.output.postReceive.length, 1);
		assert.strictEqual(typeof many.routing.output.postReceive[0], 'function');
	});

	test(`${name}: declares the credential`, () => {
		assert.strictEqual(credentials[0].name, 'mockingbirdApi');
	});
}
