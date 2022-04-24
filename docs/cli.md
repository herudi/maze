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
