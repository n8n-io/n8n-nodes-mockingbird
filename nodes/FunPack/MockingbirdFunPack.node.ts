import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { generatedProperties } from './generated/properties';

export class MockingbirdFunPack implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Mockingbird Fun Pack',
		name: 'mockingbirdFunPack',
		icon: { light: 'file:mockingbird.svg', dark: 'file:mockingbird.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"].replace(/-/g, " ") + ": " + $parameter["resource"]}}',
		description: 'Get dogs, cats, jokes, facts, and other fun data from Mockingbird',
		defaults: {
			name: 'Mockingbird Fun Pack',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'mockingbirdApi', required: false }],
		requestDefaults: {
			baseURL:
				'={{ ($credentials?.baseUrl || "https://mockingbird.n8n.io/v1").replace(/\\/+$/, "") }}',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: generatedProperties,
	};
}
