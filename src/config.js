import { Regex } from '@companion-module/base'

export function getConfigFields() {
	return [
		{
			type: 'static-text',
			id: 'info',
			width: 12,
			label: 'Information',
			value: 'Generate an API token at https://app.dashmaster2k.com/api',
		},
		{
			type: 'textinput',
			id: 'baseUrl',
			label: 'API Base URL',
			width: 12,
			default: 'https://app.dashmaster2k.com/api-v1',
			regex: Regex.SOMETHING,
		},
		{
			type: 'textinput',
			id: 'apiToken',
			label: 'API Token',
			width: 12,
			default: '',
		},
		{
			type: 'checkbox',
			id: 'verbose',
			label: 'Verbose logging',
			width: 12,
			default: false,
		},
	]
}
