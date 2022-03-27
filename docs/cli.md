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

### Generate New Page

Usage : `maze gen:page <pathfile>`

BasePath : `pages/`

```bash
// example generate pages/my_page.tsx
maze gen:page my_page

// example generate pages/blog/[title].tsx
maze gen:page blog/[title]
```

### Generate New Api

Usage : `maze gen:api <pathfile>`

BasePath : `pages/api/`

```bash
// example generate pages/api/about.ts
maze gen:api about

// example generate pages/api/blog/[title].ts
maze gen:api blog/[title]
```
