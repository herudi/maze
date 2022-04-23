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
