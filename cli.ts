import createApp from "./cli/create.ts";
import dev_server from "./cli/dev.ts";
import {
  addCloudflareWorkers,
  addDeploy,
  addNetlifyEdge,
  newApis,
  newPages,
} from "./cli/gen.ts";
import { LINK } from "./core/constant.ts";

const arg = (Deno.args || [])[0];

async function build(prefix: string) {
  const CMD = Deno.build.os === "windows" ? "cmd /c " : "";
  const script = CMD +
    `deno run -A --unstable --no-check ${LINK}/cli/build.ts${prefix}`;
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
  } else {
    const errorString = new TextDecoder().decode(rawError);
    console.log(errorString);
  }
  Deno.exit(code);
}

if (arg === "create") {
  await createApp();
} else if (arg === "dev") {
  await dev_server();
} else if (arg === "clean") {
  await dev_server(true);
} else if (arg === "build") {
  await build("");
} else if (arg === "build-bundle") {
  await build(" --bundle");
} else if (arg === "gen:page") {
  await newPages();
} else if (arg === "gen:api") {
  await newApis();
} else if (arg === "gen:deploy") {
  await addDeploy();
} else if (arg === "gen:netlify") {
  await addNetlifyEdge();
} else if (arg === "gen:workers") {
  await addCloudflareWorkers();
} else if (arg === "help") {
  console.log(`Simple CLI tools for building web with Deno and Nanojsx.
    
CREATE NEW APP:
  maze create app-name
  maze create app-name --template=template-name
  cd app-name

RUN DEVELOPMENT:
  maze dev

BUILD PRODUCTION:
  maze build

RUN PRODUCTION:
  deno run -A .maze/server.ts

GENERATE DENO DEPLOY:
  maze gen:deploy <site-name>

GENERATE NETLIFY EDGE FUNCTIONS:
  maze gen:netlify <site-name>

GENERATE CLOUDFLARE WORKERS:
  maze gen:workers <site-name>

GENERATE NEW PAGE:
  maze gen:page <pathfile>

GENERATE NEW API:
  maze gen:api <pathfile>
  `);
} else {
  console.log(`command not valid. please type: maze help`);
}
