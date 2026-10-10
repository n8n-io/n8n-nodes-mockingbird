import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { generatedProperties } from './generated/properties';

export class MockingbirdProductCatalogue implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Mockingbird Product Catalogue',
		name: 'mockingbirdProductCatalogue',
		icon: { light: 'file:mockingbird.svg', dark: 'file:mockingbird.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Get products from the Mockingbird product catalogue',
		defaults: {
			name: 'Mockingbird Product Catalogue',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'mockingbirdApi', required: false }],
		requestDefaults: {
			baseURL: '={{$credentials?.baseUrl ?? "https://mockingbird.n8n.io/v1"}}',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: generatedProperties,
	};
}
