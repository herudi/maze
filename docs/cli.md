## Usage

### Install

```bash
deno install -Af --no-check -n maze -r https://raw.githubusercontent.com/herudi/maze/dev-0.0.8/cli.ts
```

### Create New App

```bash
maze create my-app
cd my-app
```

### Create New App With Template

- twind Maze with [twind](https://twind.dev/).

```bash
maze create my-app --template=maze-twind
cd my-app
```

### Run Development

```bash
maze dev
```

## Deploy To Deno Deploy

### Automatic

Deno Deploy will automatically pull code and assets from your repository source
every time you push, and deploy it. This mode is very fast, but does not allow
for a build step.

### Generate workflows github action

In this mode you push your code and assets to Deno Deploy from a GitHub Actions
workflow. This allows you to perform a build step before deploying.

```bash
maze gen:deploy <project-name>
```

Just integrate to github, code will auto build and deploy.

See https://deno.com/deploy/docs/projects

## Deploy To Netlify (edge functions)

### Generate netlify script

```bash
maze gen:netlify <project-name>
```

Just integrate to github, code will auto build and deploy.

## Deploy To Cloudflare Workers

### Install Wrangler

```bash
npm install @cloudflare/wrangler -g
```

### Wrangler Init

```bash
wrangler init --site <project-name>
```

### Publish With Github Action

Please add manually.

```yaml
name: Deploy

on:
  push:
    branches:
      - master

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Deploy
    steps:
      - name: Clone repository
        uses: actions/checkout@v2
      - name: Install Deno
        uses: denoland/setup-deno@main
        with:
          deno-version: 1.21.0
      - name: Build
        run: deno task build
      - name: Publish
        uses: cloudflare/wrangler-action@1.3.0
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
```

## Publish To Cloudflare Workers From Local

### Login To Cloudflare Workers

```bash
wrangler login
```

### Build

```bash
maze build
```

```bash
wrangler build
```

### Publish

```bash
wrangler publish
```

## Build Self Server

### Build

```bash
maze build
// or
deno task build
```

### Build Bundle

```bash
maze build-bundle
// or
deno task build:bundle
```

### Run Server

```bash
deno run -A .maze/server.ts
// or
deno task start
```

## Generate

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

## Other

### Clean

clean the project to dev without run server.

```bash
maze clean
```
