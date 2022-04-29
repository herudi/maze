## Maze

Fly on the edge with [deno](https://deno.land) and
[nanojsx](https://nanojsx.io/).

Maze is simple CLI tools for building web.

> [WIP]. but work functionaly.

> Currently not complete tests and docs.

## Features

- SSR first (good choice for SEO).
- Nextjs like (dynamic routes page and api/handler).
- Hot Reloading.

## Demo

Deno Deploy Site => https://maze-ssr.deno.dev

Netlify Site => https://maze-ssr.netlify.app

Cloudflare Workers Site => https://maze-ssr.herudi.workers.dev

Repo Github => https://github.com/herudi/maze-demo

See [Docs](https://github.com/herudi/maze/tree/master/docs)

## Install

```bash
deno install -Af --no-check -n maze -r https://raw.githubusercontent.com/herudi/maze/dev-0.0.9/cli.ts
```

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

## Deploy To Deno Deploy

### Automatic

Deno Deploy will automatically pull code and assets from your repository source
every time you push, and deploy it. This mode is very fast, but does not allow
for a build step.

### Generate workflows github action

In this mode you push your code and assets to Deno Deploy from a GitHub Actions
workflow. This allows you to perform a build step before deploying.

```bash
maze gen:deploy <site-name>
```

Just integrate to github, code will auto build and deploy.

See https://deno.com/deploy/docs/projects

## Deploy To Netlify (edge functions)

### Generate netlify script

```bash
maze gen:netlify <site-name>
```

Just integrate to github, code will auto build and deploy.

## Deploy To Cloudflare Workers

### Generate cloudflare-workers script

```bash
maze gen:workers <site-name>
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

> Note : You can publish with
> [wrangler](https://developers.cloudflare.com/workers/cli-wrangler)

## Build Self Server

### Build

```bash
maze build
// or
maze build-bundle
```

### Run Server

```bash
deno run -A .maze/server.ts
// or
deno task start
```

> It's Fun Project :).
