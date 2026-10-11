const test = require('node:test');
const assert = require('node:assert');
const { unwrapData } = require('../dist/nodes/shared/unwrapData');

const call = (body, items = [{ json: body }]) => unwrapData.call({}, items, { body });

test('splits a wrapped data array into one item per row', async () => {
	const out = await call({ data: [{ id: 1 }, { id: 2 }], meta: { total: 2 } });
	assert.deepStrictEqual(out, [{ json: { id: 1 } }, { json: { id: 2 } }]);
});

test('passes a bare array through unchanged', async () => {
	const items = [{ json: { id: 1 } }, { json: { id: 2 } }];
	assert.strictEqual(await call([{ id: 1 }, { id: 2 }], items), items);
});

test('passes other bodies through unchanged', async () => {
	const items = [{ json: { id: 7 } }];
	assert.strictEqual(await call({ id: 7 }, items), items);
	assert.strictEqual(await call({ data: 'not an array' }, items), items);
});
