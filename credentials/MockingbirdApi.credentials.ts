import type {
	IAuthenticate,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class MockingbirdApi implements ICredentialType {
	name = 'mockingbirdApi';

	displayName = 'Mockingbird API';

	icon = {
		light: 'file:mockingbird.svg',
		dark: 'file:mockingbird.dark.svg',
	} as const;

	documentationUrl =
		'https://github.com/n8n-io/n8n-nodes-mockingbird?tab=readme-ov-file#credentials';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
		},
		{
			displayName: 'ID Type',
			name: 'idType',
			type: 'options',
			options: [
				{
					name: 'Sandbox',
					value: 'sandbox',
					description: 'For everyone. Mint an ID with GET /v1/sandbox-id. Sent as X-Sandbox-Id.',
				},
				{
					name: 'Assessment',
					value: 'assessment',
					description:
						'For Academy learners. Use the ID your course gave you. Sent as X-Assessment-Id.',
				},
			],
			default: 'sandbox',
			description: 'Whether requests are scoped to a sandbox or to an Academy assessment',
		},
		{
			displayName:
				'The ID only keeps your test rows separate. Reads of seed data ignore it. Rows you create are stored under the ID for 48 hours, and anyone who uses the same ID shares them. Assessments use the ID to find your row set and to credit your pass. Idempotency keys are scoped by the ID.',
			name: 'idNotice',
			type: 'notice',
			default: '',
		},
		{
			displayName: 'ID',
			name: 'idValue',
			type: 'string',
			required: true,
			default: '',
			placeholder: 'e.g. sbx_kQ3f7z9Lm2Xr8p_1Nc4B',
			description:
				'Any 8 to 64 characters from A-Z, a-z, 0-9, underscore, and hyphen. To get a new one, call GET /v1/sandbox-id (for example with the HTTP Request node).',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://mockingbird.n8n.io/v1',
		},
	];

	authenticate: IAuthenticate = async (credentials, requestOptions) => {
		const idHeader = credentials.idType === 'assessment' ? 'X-Assessment-Id' : 'X-Sandbox-Id';
		return {
			...requestOptions,
			headers: {
				...requestOptions.headers,
				'X-Api-Key': credentials.apiKey as string,
				[idHeader]: credentials.idValue as string,
			},
		};
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/products',
			qs: { limit: 1 },
		},
	};
}
