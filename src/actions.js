import { genericRequest, identifyDevice, setDeviceDashboard, setDeviceRotation } from './api.js'

const ROTATION_CHOICES = [
	{ id: 0, label: '0°' },
	{ id: 90, label: '90°' },
	{ id: 180, label: '180°' },
	{ id: 270, label: '270°' },
]

const PLACEHOLDER = { id: '', label: '— none —' }

function deviceChoices(self) {
	const items = self.devices.map((d) => ({ id: d.id, label: d.name ? `${d.name} (${d.id})` : d.id }))
	return items.length ? items : [PLACEHOLDER]
}

function dashboardChoices(self, { includeNone = false } = {}) {
	const items = self.dashboards.map((d) => ({ id: d.id, label: d.name ? `${d.name} (${d.id})` : d.id }))
	const list = items.length ? items : [PLACEHOLDER]
	return includeNone ? [{ id: '', label: '— clear —' }, ...list] : list
}

export function getActions(self) {
	return {
		set_dashboard: {
			name: 'Set Dashboard on Device',
			options: [
				{
					type: 'dropdown',
					id: 'deviceId',
					label: 'Device',
					default: self.devices[0]?.id ?? '',
					choices: deviceChoices(self),
					allowCustom: true,
					tooltip: 'Pick a device, or type/paste a device ID',
				},
				{
					type: 'dropdown',
					id: 'dashboardId',
					label: 'Dashboard',
					default: self.dashboards[0]?.id ?? '',
					choices: dashboardChoices(self),
					allowCustom: true,
					tooltip: 'Pick a dashboard, or type/paste a dashboard ID',
				},
			],
			callback: async (event) => {
				const deviceId = String(event.options.deviceId ?? '').trim()
				const dashboardId = String(event.options.dashboardId ?? '').trim()
				if (!deviceId) return self.log('warn', 'Set Dashboard: device ID is empty')
				await setDeviceDashboard(self, deviceId, dashboardId || null)
			},
		},

		clear_dashboard: {
			name: 'Clear Dashboard on Device',
			options: [
				{
					type: 'dropdown',
					id: 'deviceId',
					label: 'Device',
					default: self.devices[0]?.id ?? '',
					choices: deviceChoices(self),
					allowCustom: true,
				},
			],
			callback: async (event) => {
				const deviceId = String(event.options.deviceId ?? '').trim()
				if (!deviceId) return self.log('warn', 'Clear Dashboard: device ID is empty')
				await setDeviceDashboard(self, deviceId, null)
			},
		},

		set_rotation: {
			name: 'Set Device Rotation',
			options: [
				{
					type: 'dropdown',
					id: 'deviceId',
					label: 'Device',
					default: self.devices[0]?.id ?? '',
					choices: deviceChoices(self),
					allowCustom: true,
				},
				{
					type: 'dropdown',
					id: 'rotation',
					label: 'Rotation',
					default: 0,
					choices: ROTATION_CHOICES,
				},
			],
			callback: async (event) => {
				const deviceId = String(event.options.deviceId ?? '').trim()
				const rotation = Number(event.options.rotation)
				if (!deviceId) return self.log('warn', 'Set Rotation: device ID is empty')
				if (![0, 90, 180, 270].includes(rotation)) return self.log('warn', `Set Rotation: invalid value ${rotation}`)
				await setDeviceRotation(self, deviceId, rotation)
			},
		},

		identify_device: {
			name: 'Identify Device',
			options: [
				{
					type: 'dropdown',
					id: 'deviceId',
					label: 'Device',
					default: self.devices[0]?.id ?? '',
					choices: deviceChoices(self),
					allowCustom: true,
				},
			],
			callback: async (event) => {
				const deviceId = String(event.options.deviceId ?? '').trim()
				if (!deviceId) return self.log('warn', 'Identify Device: device ID is empty')
				await identifyDevice(self, deviceId)
			},
		},

		refresh_lists: {
			name: 'Refresh Lists',
			options: [],
			callback: async () => {
				await self.refreshLists()
			},
		},

		generic_http: {
			name: 'Generic HTTP Request',
			options: [
				{
					type: 'dropdown',
					id: 'method',
					label: 'Method',
					default: 'GET',
					choices: [
						{ id: 'GET', label: 'GET' },
						{ id: 'POST', label: 'POST' },
						{ id: 'PUT', label: 'PUT' },
						{ id: 'PATCH', label: 'PATCH' },
						{ id: 'DELETE', label: 'DELETE' },
					],
				},
				{
					type: 'textinput',
					id: 'url',
					label: 'URL',
					default: '',
					useVariables: true,
					tooltip: 'Full URL. URLs that target the Dashmaster base URL receive the bearer token automatically.',
				},
				{
					type: 'dropdown',
					id: 'contentType',
					label: 'Body content type',
					default: 'application/json',
					choices: [
						{ id: 'application/json', label: 'application/json' },
						{ id: 'application/x-www-form-urlencoded', label: 'application/x-www-form-urlencoded' },
						{ id: 'text/plain', label: 'text/plain' },
					],
					isVisible: (opts) => opts.method !== 'GET',
				},
				{
					type: 'textinput',
					id: 'body',
					label: 'Body',
					default: '',
					useVariables: true,
					isVisible: (opts) => opts.method !== 'GET',
				},
				{
					type: 'textinput',
					id: 'headers',
					label: 'Extra headers (JSON object)',
					default: '',
					useVariables: true,
					tooltip: 'Example: {"X-Custom": "value"}',
				},
			],
			callback: async (event) => {
				const method = event.options.method
				const url = String(event.options.url ?? '')
				const body = String(event.options.body ?? '')
				const headersRaw = String(event.options.headers ?? '')

				let headers = {}
				if (headersRaw.trim()) {
					try {
						headers = JSON.parse(headersRaw)
					} catch (err) {
						self.log('warn', `Generic HTTP: ignoring invalid headers JSON — ${err.message}`)
					}
				}

				await genericRequest(self, {
					method,
					url,
					headers,
					body,
					contentType: event.options.contentType,
				})
			},
		},
	}
}
