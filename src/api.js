import got from 'got'

function buildHeaders(self, extra = {}) {
	const headers = { Accept: 'application/json', ...extra }
	if (self.hasToken()) headers.Authorization = `Bearer ${self.config.apiToken.trim()}`
	return headers
}

function logRequest(self, method, url, body) {
	if (!self.config?.verbose) return
	const detail = body !== undefined ? ` body=${JSON.stringify(body)}` : ''
	self.log('debug', `HTTP ${method} ${url}${detail}`)
}

function recordResponse(self, response) {
	const status = response?.statusCode ?? 0
	let body = response?.body
	if (typeof body !== 'string') {
		try {
			body = JSON.stringify(body)
		} catch {
			body = String(body)
		}
	}
	self.setVariableValues({ last_status: status, last_response: body ?? '' })
	if (self.config?.verbose) self.log('debug', `HTTP ${status} ${body?.slice?.(0, 500) ?? ''}`)
}

async function request(self, { method, url, headers, json, body, responseType = 'json' }) {
	logRequest(self, method, url, json ?? body)
	try {
		const response = await got(url, {
			method,
			headers: buildHeaders(self, headers),
			json,
			body,
			responseType,
			throwHttpErrors: true,
			retry: { limit: 0 },
		})
		recordResponse(self, response)
		return response.body
	} catch (err) {
		const status = err?.response?.statusCode
		const text = err?.response?.body
		const message = status ? `HTTP ${status}: ${typeof text === 'string' ? text : JSON.stringify(text)}` : err.message
		self.log('error', `${method} ${url} failed — ${message}`)
		if (err?.response) recordResponse(self, err.response)
		throw err
	}
}

export async function fetchDashboards(self) {
	return request(self, { method: 'GET', url: `${self.getBaseUrl()}/dashboards` })
}

export async function fetchDevices(self) {
	return request(self, { method: 'GET', url: `${self.getBaseUrl()}/devices` })
}

export async function setDeviceDashboard(self, deviceId, dashboardId) {
	return request(self, {
		method: 'PATCH',
		url: `${self.getBaseUrl()}/devices/${encodeURIComponent(deviceId)}`,
		json: { dashboardId: dashboardId ?? null },
	})
}

export async function setDeviceRotation(self, deviceId, rotation) {
	return request(self, {
		method: 'PATCH',
		url: `${self.getBaseUrl()}/devices/${encodeURIComponent(deviceId)}`,
		json: { rotation },
	})
}

export async function identifyDevice(self, deviceId) {
	return request(self, {
		method: 'POST',
		url: `${self.getBaseUrl()}/devices/${encodeURIComponent(deviceId)}/identify`,
		json: {},
	})
}

export async function genericRequest(self, { method, url, headers, body, contentType }) {
	const opts = {
		method,
		headers: { ...headers },
		responseType: 'text',
	}

	const targetsApi = url.startsWith(self.getBaseUrl())
	if (targetsApi && self.hasToken() && !findHeader(opts.headers, 'authorization')) {
		opts.headers.Authorization = `Bearer ${self.config.apiToken.trim()}`
	}

	if (body !== undefined && body !== '' && method !== 'GET') {
		if (contentType === 'application/json') {
			try {
				opts.json = typeof body === 'string' ? JSON.parse(body) : body
			} catch (err) {
				throw new Error(`Body is not valid JSON: ${err.message}`)
			}
		} else {
			opts.body = String(body)
			if (contentType && !findHeader(opts.headers, 'content-type')) {
				opts.headers['Content-Type'] = contentType
			}
		}
	}

	logRequest(self, method, url, opts.json ?? opts.body)
	try {
		const response = await got(url, { ...opts, throwHttpErrors: true, retry: { limit: 0 } })
		recordResponse(self, response)
		return response.body
	} catch (err) {
		const status = err?.response?.statusCode
		const text = err?.response?.body
		const message = status ? `HTTP ${status}: ${text}` : err.message
		self.log('error', `${method} ${url} failed — ${message}`)
		if (err?.response) recordResponse(self, err.response)
		throw err
	}
}

function findHeader(headers, name) {
	const lower = name.toLowerCase()
	return Object.keys(headers || {}).some((k) => k.toLowerCase() === lower)
}
