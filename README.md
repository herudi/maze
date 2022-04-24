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

Repo Github => https://github.com/herudi/maze-demo

See [Docs](https://github.com/herudi/maze/tree/master/docs)

## Install

```bash
deno install -Af --no-check -r https://raw.githubusercontent.com/herudi/maze/dev-0.0.7/maze.ts
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

## Build Self Server

### Build

```bash
maze build

// or build bundle.
maze build-bundle
```

### Run Server

```bash
deno run -A server.ts
```

> It's Fun Project :).
