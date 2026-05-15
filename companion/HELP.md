# Dashmaster 2k

Control Dashmaster 2k devices and the dashboards displayed on them from Companion.

## Configuration

| Field        | Description                                                                 |
| ------------ | --------------------------------------------------------------------------- |
| API Base URL | Defaults to `https://app.dashmaster2k.com/api-v1`. Override only if needed. |
| API Token    | Bearer token generated at https://app.dashmaster2k.com/api                  |
| Verbose logs | Enables debug logging of every HTTP request and response.                   |

The module re-fetches the dashboard and device lists every 60 seconds, plus on every config save and on the "Refresh Lists" action.

## Actions

- **Set Dashboard on Device** — pick a device and dashboard from the dropdowns; sends `PATCH /devices/{id}` with the chosen `dashboardId`.
- **Clear Dashboard on Device** — sends `PATCH /devices/{id}` with `dashboardId: null`.
- **Set Device Rotation** — pick a device and an angle (0° / 90° / 180° / 270°); sends `PATCH /devices/{id}` with `{ rotation }`.
- **Identify Device** — triggers the three-second on-screen overlay (`POST /devices/{id}/identify`).
- **Refresh Lists** — re-fetches dashboards and devices to repopulate dropdowns.
- **Generic HTTP Request** — GET / POST / PUT / PATCH / DELETE against any URL, with optional headers and body. The Authorization header is added automatically when the URL targets the Dashmaster API.

## Presets

The module ships ready-made buttons in the **Utility**, **Identify Device**, **Set Dashboard**, and **Set Rotation** categories:

- **Refresh Lists** — one button under Utility that re-fetches dashboards and devices.
- **Identify: {device name}** — one button per known device.
- **Set Dashboard: {device name}** — one button per known device. The dashboard is intentionally left blank; pick the dashboard you want on the action after dragging the preset onto a button.
- **Set Rotation: {device name}** — one button per known device. The angle defaults to 0°; change it on the action after dragging.

The device-specific presets appear after the first successful refresh, and update automatically when devices are added or renamed in Dashmaster.

## Variables

| Variable          | Description                                  |
| ----------------- | -------------------------------------------- |
| `dashboard_count` | Number of dashboards owned by the API token. |
| `device_count`    | Number of devices owned by the API token.    |
| `last_status`     | HTTP status of the most recent request.      |
| `last_response`   | Body of the most recent request.             |
