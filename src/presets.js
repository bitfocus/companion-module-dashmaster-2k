const STYLE_BASE = {
	size: '14',
	color: 0xffffff,
	bgcolor: 0x000000,
}

export function getPresets(self) {
	const presets = {}
	const utilityIds = ['refresh_lists']
	const identifyIds = []
	const setDashboardIds = []
	const setRotationIds = []

	presets.refresh_lists = {
		type: 'simple',
		name: 'Refresh Lists',
		style: { ...STYLE_BASE, text: 'Refresh\nLists' },
		steps: [{ down: [{ actionId: 'refresh_lists', options: {} }], up: [] }],
		feedbacks: [],
	}

	for (const device of self.devices) {
		const label = device.name || device.id
		const safeId = device.id.replace(/[^a-zA-Z0-9_]/g, '_')

		const identifyKey = `identify_${safeId}`
		presets[identifyKey] = {
			type: 'simple',
			name: `Identify: ${label}`,
			style: { ...STYLE_BASE, text: `Identify\n${label}` },
			steps: [{ down: [{ actionId: 'identify_device', options: { deviceId: device.id } }], up: [] }],
			feedbacks: [],
		}
		identifyIds.push(identifyKey)

		const setKey = `set_dashboard_${safeId}`
		presets[setKey] = {
			type: 'simple',
			name: `Set Dashboard: ${label}`,
			style: { ...STYLE_BASE, text: `Set DB\n${label}` },
			steps: [{ down: [{ actionId: 'set_dashboard', options: { deviceId: device.id, dashboardId: '' } }], up: [] }],
			feedbacks: [],
		}
		setDashboardIds.push(setKey)

		const rotKey = `set_rotation_${safeId}`
		presets[rotKey] = {
			type: 'simple',
			name: `Set Rotation: ${label}`,
			style: { ...STYLE_BASE, text: `Rotate\n${label}` },
			steps: [{ down: [{ actionId: 'set_rotation', options: { deviceId: device.id, rotation: 0 } }], up: [] }],
			feedbacks: [],
		}
		setRotationIds.push(rotKey)
	}

	const structure = [
		{ id: 'utility', name: 'Utility', definitions: utilityIds },
		{ id: 'identify', name: 'Identify Device', definitions: identifyIds },
		{ id: 'set_dashboard', name: 'Set Dashboard', definitions: setDashboardIds },
		{ id: 'set_rotation', name: 'Set Rotation', definitions: setRotationIds },
	].filter((section) => section.definitions.length > 0)

	if (self.config?.verbose) {
		self.log(
			'debug',
			`Presets: ${Object.keys(presets).length} buttons across ${structure.length} sections (devices=${self.devices.length})`,
		)
	}

	return { structure, presets }
}
