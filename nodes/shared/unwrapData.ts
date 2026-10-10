import type {
	IExecuteSingleFunctions,
	IN8nHttpFullResponse,
	INodeExecutionData,
} from 'n8n-workflow';

// Paginated Mockingbird lists return `{ data: [...], meta: {...} }`.
// Output one item per row. Bare arrays and other bodies pass through unchanged.
export async function unwrapData(
	this: IExecuteSingleFunctions,
	items: INodeExecutionData[],
	response: IN8nHttpFullResponse,
): Promise<INodeExecutionData[]> {
	const body = response.body as { data?: unknown } | undefined;
	if (body && !Array.isArray(body) && Array.isArray(body.data)) {
		return body.data.map((row) => ({ json: row as INodeExecutionData['json'] }));
	}
	return items;
}
