# SAMonitor Browser

This is the website of SAMonitor, located at https://sam.markski.ar/

Written in SvelteKit and built to a fully static site.

## Development

```sh
pnpm install
pnpm dev
```

By default the site talks to the production SAMonitor API at `https://sam.markski.ar/api`. To point at a different host (e.g. a local instance), set `VITE_API_BASE`:

```sh
VITE_API_BASE=https://my-local-api:42069/api pnpm dev
```

## Build

```sh
pnpm build
```

Outputs a static site in `build/`. Serve it with any static host.

## Test

```sh
pnpm test
```

Runs Vitest unit tests for the date/time and number formatters.

## Note

***This is just the Server Browser.*** SAMonitor itself, the system and API, reside at https://github.com/markski1/SAMonitor
