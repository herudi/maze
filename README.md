## Maze

Simple CLI tools for building web with [Deno](https://deno.land/) and
[Nanojsx](https://nanojsx.io/).

> [WIP]. but work functionaly.

> Currently not complete tests and docs.

Demo site (deno deploy) => https://maze-ssr.deno.dev

Demo Repo => https://github.com/herudi/maze-demo

See [Docs](https://github.com/herudi/maze/tree/master/docs)

## Features

- SSR first (good choice for SEO).
- Nextjs like (dynamic routes page and api/handler).
- Support for [Deno](https://deno.land), [Deno Deploy](https://deno.com/deploy).
- Hot Reloading.

## Includes

- [nanojsx](https://nanojsx.io/)
- [nhttp](https://nhttp.deno.dev)
- more

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

### Build Production

```bash
maze build

// or build bundle.
maze build-bundle
```

### Run Production

```bash
deno run -A server.ts
```

> It's Fun Project :).
