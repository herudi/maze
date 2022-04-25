import { LINK, NANO_VERSION, NHTTP_VERSION } from "../core/constant.ts";
import { join } from "./deps.ts";

async function craftFromGit(template: string, app_name: string, dir: string) {
  template = template.replace("--template=", "");
  console.log(`Preparing ${template} to ${app_name}`);
  const CMD = Deno.build.os === "windows" ? "cmd /c " : "";
  const script = CMD +
    `git clone https://github.com/maze-template/${template}.git ${app_name}`;
  const p = Deno.run({
    cmd: script.split(" "),
    stdout: "piped",
    stderr: "piped",
  });

  const { code } = await p.status();
  const rawOutput = await p.output();
  const rawError = await p.stderrOutput();

  if (code === 0) {
    await Deno.stdout.write(rawOutput);
    try {
      await Deno.mkdir(join(dir, "public"));
    } catch (_e) { /* noop */ }
    try {
      await Deno.mkdir(join(dir, "pages", "api"));
    } catch (_e) { /* noop */ }
    try {
      const my_file = await Deno.readTextFile(join(dir, "import_map.json"));
      const my_obj = JSON.parse(my_file);
      my_obj["imports"]["nano-jsx"] =
        `https://deno.land/x/nano_jsx@${NANO_VERSION}/mod.ts`;
      my_obj["imports"]["nhttp"] =
        `https://deno.land/x/nhttp@${NHTTP_VERSION}/mod.ts`;
      my_obj["imports"]["maze"] = `${LINK}/mod.ts`;
      await Deno.writeTextFile(
        join(dir, "import_map.json"),
        JSON.stringify(my_obj, null, 2),
      );
    } catch (_e) { /* noop */ }
    console.log(`Success create ${app_name}.
    
cd ${app_name}

RUN DEVELOPMENT:
  maze dev

BUILD PRODUCTION:
  maze build

RUN PRODUCTION:
  deno run -A .maze/server.ts
`);
  } else {
    const errorString = new TextDecoder().decode(rawError);
    console.log(errorString);
  }
  Deno.exit(code);
}
export default async function createApp() {
  const app = Deno.args[1];
  if (!app) {
    console.log("App Not Found !!\ntry => maze create my-app");
    return;
  }
  const template = Deno.args[2];
  const cwd = Deno.cwd();
  const dir = join(cwd, app);
  if (template && template.includes("--template=")) {
    return craftFromGit(template, app, dir);
  }
  const link = LINK;
  await Deno.mkdir(join(dir, "pages", "api"), { recursive: true });
  await Deno.mkdir(join(dir, "pages", "_default"));
  await Deno.mkdir(join(dir, ".vscode"));
  await Deno.mkdir(join(dir, "public"));
  await Deno.writeTextFile(
    join(dir, "deno.json"),
    `{
  "compilerOptions": {
    "lib": [
      "dom",
      "dom.asynciterable",
      "dom.iterable",
      "deno.ns",
      "deno.unstable"
    ],
    "jsx": "react",
    "jsxFactory": "h",
    "jsxFragmentFactory": "Fragment"
  },
  "fmt": {
    "files": {
      "exclude": [
        ".maze/",
        "public/",
        "server_prod.js"
      ]
    }
  },
  "lint": {
    "files": {
      "exclude": [
        ".maze/",
        "public/",
        "server_prod.js"
      ]
    }
  },
  "importMap": "import_map.json",
  "tasks": {
    "dev": "maze dev",
    "dev:reload": "maze dev --reload",
    "start": "deno run -A ./.maze/server.ts",
    "start:reload": "deno run -A --reload ./.maze/server.ts",
    "build": "deno run -A --no-check ${LINK}/cli/build.ts",
    "build:reload": "deno run -A --no-check --reload ${LINK}/cli/build.ts",
    "build:bundle": "deno run -A --no-check ${LINK}/cli/build.ts --bundle",
    "build:bundle:reload": "deno run -A --no-check --reload ${LINK}/cli/build.ts --bundle",
    "clean": "maze clean"
  }
}`,
  );
  await Deno.writeTextFile(
    join(dir, "import_map.json"),
    `{
  "imports": {
    "nano-jsx": "https://deno.land/x/nano_jsx@${NANO_VERSION}/mod.ts",
    "nhttp": "https://deno.land/x/nhttp@${NHTTP_VERSION}/mod.ts",
    "maze": "${link}/mod.ts"
  }
}`,
  );
  await Deno.writeTextFile(
    join(dir, ".gitignore"),
    `.maze
.netlify
node_modules`,
  );
  await Deno.writeTextFile(
    join(dir, ".vscode", "settings.json"),
    `{
  "deno.enable": true,
  "deno.unstable": true,
  "deno.suggest.imports.hosts": {
    "https://deno.land": true,
    "https://esm.sh": true,
    "https://jspm.dev": true,
    "https://cdn.skypack.dev": true
  },
  "deno.importMap": "./import_map.json"
}`,
  );
  await Deno.writeTextFile(
    join(dir, "maze.config.ts"),
    `import type { MazeConfig } from "maze";
  
export default <MazeConfig>{ 

  // cache-control (production only).
  cache_control: "public, max-age=31536000, immutable"

}`,
  );
  await Deno.writeTextFile(
    join(dir, "pages", "_default", "app.tsx"),
    `/** @jsx h */
import { h, Helmet, Fragment } from "nano-jsx";
import { AppProps } from "maze";

export default function App({ Page, props }: AppProps) {
  return (
    <Fragment>
      <Helmet>
        <html lang="en" />
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Helmet>
      <div id="__MAZE_PAGE__"><Page {...props} /></div>
    </Fragment>
  );
}`,
  );

  await Deno.writeTextFile(
    join(dir, "pages", "_default", "error.tsx"),
    `/** @jsx h */
import { h, Helmet } from "nano-jsx";

export default function ErrorPage(
  { message = "something went wrong", status = 500 }: {
    message: string;
    status: number;
  },
) {
  return (
    <div>
      <Helmet>
        <title>{status} {message}</title>
      </Helmet>
      <div style="text-align: center">
        <h1>{status}</h1>
        <p>{message}</p>
      </div>
    </div>
  );
}
`,
  );
  await Deno.writeTextFile(
    join(dir, "pages", "_default", "ssr.ts"),
    `import { Helmet, renderSSR, Component } from "nano-jsx";

export default function ssr(Comp: Component, mazeScript: string, opts = {}) {
  const app = renderSSR(Comp, opts);
  const { body, head, footer, attributes } = Helmet.SSR(app);
  return ${"`<!DOCTYPE html>"}
${"<html ${attributes.html.toString()}>"}
  <head>
    ${"${head.join('\\n    ')}"}
  </head>
  ${"<body ${attributes.body.toString()}>"}
    ${"${body}"}
    ${"${footer.join('')}${mazeScript}"}
  </body>
${"</html>`"}
}
`,
  );
  await Deno.writeTextFile(
    join(dir, "pages", "_default", "client.ts"),
    `export function onHydrate() {/* set anything on hydrate at the client. */}`,
  );
  await Deno.writeTextFile(
    join(dir, "pages", "index.tsx"),
    `/** @jsx h */
import { Component, h, Helmet, Fragment } from "nano-jsx";
import { PageProps } from "maze";

export default class Home extends Component<PageProps> {

  render() {
    return (
      <Fragment>
        <Helmet>
          <title>Welcome Home Page</title>
        </Helmet>
        <div style={{ textAlign:"center" }}>
          <h1>Welcome Home</h1>
          <p>Try to modify file: /pages/index.tsx</p>
        </div>
      </Fragment>
    );
  }
} 
`,
  );
  console.log(`Success create ${app}.
    
cd ${app}

RUN DEVELOPMENT:
  maze dev

BUILD PRODUCTION:
  maze build

RUN PRODUCTION:
  deno run -A .maze/server.ts
`);
}
