## Usage

### Create New App

```bash
maze create my-app
cd my-app
```

### Run Development

```bash
maze dev
```

### Build Production

```bash
maze build

// or build bundle.
maze build-bundle
```

> Temporarily build server.ts to server_prod.js. That's because deno deploy
> doesn't support import-maps yet. but in the future will support.

### Run Production

```bash
deno run -A server_prod.js
```
