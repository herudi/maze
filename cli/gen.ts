import { DENO_VERSION, LINK } from "../core/constant.ts";
import { isExist, join } from "./deps.ts";
import days from "https://esm.sh/dayjs";

function cl(str: string) {
  return str.replace(/\[|\]|\./g, "");
}

function toClassName(str: string) {
  const sepStr = str.toLowerCase().split("_");
  for (let i = 0; i < sepStr.length; i++) {
    sepStr[i] = sepStr[i].charAt(0).toUpperCase() + sepStr[i].substring(1);
  }
  return sepStr.join("");
}

const tpl_page = (name: string) =>
  `/** @jsx h */
import { Component, h } from "nano-jsx";
import { PageProps } from "maze";

class ${toClassName(cl(name))} extends Component<PageProps> {
  render() {
    return <div>${cl(name)}</div>;
  }
}

export default ${toClassName(cl(name))};`;

const tpl_api = (name: string) =>
  `import { HttpError, RequestEvent } from "nhttp";

async function handler(rev: RequestEvent) {
  if (rev.request.method == "GET") {
    return { title: "Welcome ${cl(name)}" };
  }
  throw new HttpError(405, "method not allowed");
}

export default handler;`;

function tryCreate(pathfile: string, tpl: string) {
  try {
    Deno.writeTextFileSync(pathfile, tpl);
    return true;
  } catch (_e) {
    return false;
  }
}

export async function newPages() {
  let lookup = Deno.args[1];
  if (!lookup) {
    console.log("Path Not Found !!\ntry => maze gen:page mypage");
    return;
  }
  lookup = lookup.replace("./", "");
  if (lookup.startsWith("api/")) {
    console.error("Failed gen:page in folder api. please use gen:api instead.");
    return;
  }
  if (lookup.startsWith("/")) lookup = lookup.substring(1);
  if (!lookup.endsWith(".tsx")) lookup = lookup + ".tsx";
  const cwd = Deno.cwd();
  const dir = join(cwd, "pages");
  const arr = lookup.split("/");
  if (isExist(join(dir, ...arr))) {
    console.log(lookup + " Already exist :(");
    return;
  }
  const name = arr[arr.length - 1].replace(".tsx", "");
  const sucess = tryCreate(join(dir, ...arr), tpl_page(name));
  if (!sucess) {
    const newArr = arr.slice(0, -1);
    await Deno.mkdir(join(dir, ...newArr), { recursive: true });
    const sucess2 = tryCreate(join(dir, ...arr), tpl_page(name));
    if (!sucess2) {
      console.error("Failed gen:page, something went wrong");
      return;
    }
  }
  console.log("Success gen:page " + Deno.args[1]);
}

export async function newApis() {
  let lookup = Deno.args[1];
  if (!lookup) {
    console.log("Path Not Found !!\ntry => maze gen:api myhandler");
    return;
  }
  lookup = lookup.replace("./", "");
  if (lookup.startsWith("/")) lookup = lookup.substring(1);
  if (!lookup.endsWith(".ts")) lookup = lookup + ".ts";
  const cwd = Deno.cwd();
  const dir = join(cwd, "pages", "api");
  const arr = lookup.split("/");
  if (isExist(join(dir, ...arr))) {
    console.log(lookup + " Already exist :(");
    return;
  }
  const name = arr[arr.length - 1].replace(".ts", "");
  const sucess = tryCreate(join(dir, ...arr), tpl_api(name));
  if (!sucess) {
    const newArr = arr.slice(0, -1);
    await Deno.mkdir(join(dir, ...newArr), { recursive: true });
    const sucess2 = tryCreate(join(dir, ...arr), tpl_api(name));
    if (!sucess2) {
      console.error("Failed gen:api, something went wrong");
      return;
    }
  }
  console.log("Success gen:api " + Deno.args[1]);
}

export async function addDeploy() {
  const project = Deno.args[1];
  if (!project) {
    console.log("Path Not Found !!\ntry => maze gen:deploy project-name");
    return;
  }
  const cwd = Deno.cwd();
  try {
    await Deno.mkdir(join(cwd, ".github", "workflows"), { recursive: true });
    await Deno.writeTextFile(
      join(cwd, ".github", "workflows", "deploy.yml"),
      `name: Deploy
on: [push]

jobs:
  deploy:
    name: Deploy
    runs-on: ubuntu-latest
    permissions:
      id-token: write
      contents: read
    steps:
      - name: Clone repository
        uses: actions/checkout@v2
      - name: Install Deno
        uses: denoland/setup-deno@main
        with:
          deno-version: ${DENO_VERSION}
      - name: Build
        run: deno task build
      - name: Deploy To Deno Deploy
        uses: denoland/deployctl@v1
        with:
          project: "${project}"
          entrypoint: "./.maze/server.ts"`,
    );
  } catch (error) {
    console.error(error.message || "Failed create workflows deploy");
  }
}

export async function addNetlifyEdge() {
  const project = Deno.args[1];
  if (!project) {
    console.log("Path Not Found !!\ntry => maze gen:netlify project-name");
    return;
  }
  const cwd = Deno.cwd();
  try {
    await Deno.mkdir(join(cwd, "netlify", "edge-functions"), {
      recursive: true,
    });
    await Deno.writeTextFile(
      join(cwd, "netlify", "edge-functions", `${project}.js`),
      `import maze from "../../.maze/maze.ts";
import middleware from "${LINK}/core/netlify_middleware.ts";

export default (request, context) => maze().use(middleware()).handleEvent({ request, context });`,
    );
    await Deno.writeTextFile(
      join(cwd, "netlify.toml"),
      `[build]
  command = "curl -fsSL https://deno.land/x/install/install.sh | sh && /opt/buildhome/.deno/bin/deno run -A --no-check ${LINK}/cli/build.ts"
  publish = "public"

[[edge_functions]]
  function = "${project}"
  path = "/*"`,
    );
  } catch (error) {
    console.error(error.message || "Failed create edge functions");
  }
}

export async function addCloudflareWorkers() {
  const project = Deno.args[1];
  if (!project) {
    console.log("Path Not Found !!\ntry => maze gen:workers project-name");
    return;
  }
  const cwd = Deno.cwd();
  try {
    await Deno.mkdir(join(cwd, "cloudflare"));
    await Deno.writeTextFile(
      join(cwd, "cloudflare", "worker.ts"),
      `import maze from "../.maze/maze.ts";
import middleware from "${LINK}/core/cf_workers_middleware.ts";

// default cache
const cache = {
  browserTTL: null,
  edgeTTL: 2 * 60 * 60 * 24,
  bypassCache: false,
}

addEventListener('fetch', (event: any) => {
  event.respondWith(maze().use(middleware(cache)).handleEvent(event));
});`,
    );
    await Deno.writeTextFile(
      join(cwd, "cloudflare", "package.json"),
      `{
  "private": true,
  "name": "worker",
  "version": "1.0.0",
  "description": "Maze starter cloudflare worker",
  "main": "worker.js",
  "author": "Herudi",
  "license": "MIT"
}`,
    );
    await Deno.writeTextFile(
      join(cwd, "wrangler.toml"),
      `name = "${project}"
type = "javascript"
workers_dev = true
compatibility_date = "${days().format("YYYY-MM-DD")}"

[site]
bucket = "public"
entry-point = "cloudflare"

[build.upload]
format = "service-worker"`,
    );
  } catch (error) {
    console.error(error.message || "Failed create edge functions");
  }
}
