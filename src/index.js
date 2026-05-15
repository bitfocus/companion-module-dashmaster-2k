import { InstanceBase, InstanceStatus } from '@companion-module/base'
import { upgradeScripts } from './upgrades.js'
import { getConfigFields } from './config.js'
import { getActions } from './actions.js'
import { getVariables } from './variables.js'
import { getPresets } from './presets.js'
import { fetchDashboards, fetchDevices } from './api.js'

export const UpgradeScripts = upgradeScripts

const DEFAULT_BASE_URL = 'https://app.dashmaster2k.com/api-v1'
const POLL_INTERVAL_MS = 60_000

function extractArray(payload) {
	if (Array.isArray(payload)) return payload
	if (payload && typeof payload === 'object') {
		for (const key of ['data', 'items', 'results', 'devices', 'dashboards']) {
			if (Array.isArray(payload[key])) return payload[key]
		}
	}
	return []
}

export default class DashmasterInstance extends InstanceBase {
	constructor(internal) {
		super(internal)
		this.dashboards = []
		this.devices = []
		this.pollTimer = null
	}

	async init(config) {
		this.config = config
		this.updateStatus(InstanceStatus.Connecting)

		this.setVariableDefinitions(getVariables())
		this.setActionDefinitions(getActions(this))
		this.refreshPresets()

		await this.refreshLists()
		this.startPolling()
	}

	async destroy() {
		this.stopPolling()
		this.log('debug', 'destroy')
	}

	async configUpdated(config) {
		this.config = config
		await this.refreshLists()
	}

	getConfigFields() {
		return getConfigFields()
	}

	getBaseUrl() {
		const raw = (this.config?.baseUrl || DEFAULT_BASE_URL).trim()
		return raw.replace(/\/+$/, '')
	}

	hasToken() {
		return Boolean(this.config?.apiToken && String(this.config.apiToken).trim())
	}

	async refreshLists() {
		if (!this.hasToken()) {
			this.updateStatus(InstanceStatus.BadConfig, 'API token is required')
			return
		}
		try {
			const [dashboards, devices] = await Promise.all([fetchDashboards(this), fetchDevices(this)])
			this.dashboards = extractArray(dashboards)
			this.devices = extractArray(devices)

			if (this.config?.verbose) {
				this.log(
					'debug',
					`Raw dashboards response type=${typeof dashboards} keys=${dashboards && typeof dashboards === 'object' ? Object.keys(dashboards).join(',') : 'n/a'} → ${this.dashboards.length} items`,
				)
				this.log(
					'debug',
					`Raw devices response type=${typeof devices} keys=${devices && typeof devices === 'object' ? Object.keys(devices).join(',') : 'n/a'} → ${this.devices.length} items`,
				)
			}

			this.setActionDefinitions(getActions(this))
			this.refreshPresets()
			this.setVariableValues({
				dashboard_count: this.dashboards.length,
				device_count: this.devices.length,
			})
			this.updateStatus(InstanceStatus.Ok)
		} catch (err) {
			const message = err?.response?.statusCode === 401 ? 'Invalid API token' : err.message || 'Request failed'
			this.updateStatus(InstanceStatus.ConnectionFailure, message)
			this.log('error', `Failed to refresh Dashmaster data: ${message}`)
		}
	}

	refreshPresets() {
		const { structure, presets } = getPresets(this)
		this.setPresetDefinitions(structure, presets)
	}

	startPolling() {
		this.stopPolling()
		this.pollTimer = setInterval(() => {
			this.refreshLists().catch(() => {})
		}, POLL_INTERVAL_MS)
	}

	stopPolling() {
		if (this.pollTimer) {
			clearInterval(this.pollTimer)
			this.pollTimer = null
		}
	}
}
