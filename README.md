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

## Deploy To Deno Deploy

- Create new repo and push to github.
- Go to https://deno.com/deploy and signup.
- Add new project, fill in the project name and create.
- Deploy from github and continue.
- Add repository and select Github Action.
- Linking.

Back to project

- Generate Workflow Deno Deploy.

```bash
maze gen:deploy <project-name>
```

- Add, commit and push.
- Done.

## Deploy To Netlify

/netlify/edge-functions/maze-edge.js

```js
import maze from "../../@shared/maze.ts";

const app = maze();

app.use(async ({ request, context, url }, next) => {
  if (request.method === "GET") {
    const asset = await context.rewrite(url);
    if (asset.status !== 404) return asset;
  }
  return next();
});

export default (request, context) => app.handleEvent({ request, context });
```

See
https://www.netlify.com/blog/announcing-serverless-compute-with-edge-functions

> It's Fun Project :).
