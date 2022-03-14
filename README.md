## Maze

Simple, Fullstack TS/JS for [Deno](https://deno.land/) and
[Nanojsx](https://nanojsx.io/).

> under development, not complete tests and not complete docs.

> It's Fun Project :), PRs Welcome.

Demo site => https://maze-ssr.deno.dev

Demo Repo => https://github.com/herudi/maze-demo

## Features

- SSR first (good choice for SEO using
  [Helmet](https://nanojsx.io/components.html#helmet)).
- Tailwind out of the box using ([Twind](https://twind.dev/)).
- Nextjs like (dynamic routes page and api/handler).
- Support for [Deno Deploy](https://deno.com/deploy) and
  [Deno](https://deno.land).
- Hot Reloading.

## Includes

- [nanojsx](https://nanojsx.io/)
- [twind](https://twind.dev/)
- [nhttp](https://nhttp.deno.dev)
- more

## Install

```bash
deno install -Af --no-check https://raw.githubusercontent.com/herudi/maze/master/maze.ts
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
```

> generating server_prod.js and client files.

### Run Production

```bash
deno run -A server_prod.js
```
