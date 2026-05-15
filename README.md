# companion-module-dashmaster-2k

A [Bitfocus Companion](https://bitfocus.io/companion) module for [Dashmaster 2k](https://dashmaster2k.com).

Control your Dashmaster 2k dashboards and devices from any Companion-supported surface:

- Switch which dashboard a device displays
- Rotate a device (0° / 90° / 180° / 270°)
- Trigger the on-screen "Identify" overlay
- Refresh the cached device / dashboard lists
- Generic HTTP fallback for any future endpoint

See [companion/HELP.md](companion/HELP.md) for setup, actions, presets, and variables.

## API

Wraps the Dashmaster 2k public HTTP API documented at https://dashmaster2k.com/docs/api/. Generate an API token at https://app.dashmaster2k.com/api.

## Development

```bash
yarn install
yarn package    # builds pkg/dashmaster-2k-<version>.tgz
```

To run from source inside a local Companion instance, add this folder as a developer module path in Companion's settings. To run from the packaged `.tgz`, create an empty `DEBUG-PACKAGED` file in the module root and Companion will load `pkg/` instead of `src/`.

## License

MIT
