## Maze

The simple fullstack TS/JS with [Deno](https://deno.land/) and
[Nanojsx](https://nanojsx.io/).

> [WIP]. It's Fun Project :).

Demo site (deno deploy) => https://maze-ssr.deno.dev

Demo Repo => https://github.com/herudi/maze-demo

## Features

- SSR first (good choice for SEO using
  [Helmet](https://nanojsx.io/components.html#helmet)).
- Nextjs like (dynamic routes page and api/handler).
- Support for [Deno](https://deno.land), [Deno Deploy](https://deno.com/deploy).
- Hot Reloading.

## Includes

- [nanojsx](https://nanojsx.io/)
- [nhttp](https://nhttp.deno.dev)
- more

## Install

```bash
deno install -Af --no-check -r https://raw.githubusercontent.com/herudi/maze/master/maze.ts
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

// or bundle build.
maze build-bundle
```

> Temporarily build server.ts to server_prod.js. That's because deno deploy
> doesn't support import-maps yet. but in the future will support.

### Run Production

```bash
deno run -A server_prod.js
```
