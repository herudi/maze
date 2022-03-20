import createApp from "./cli/create.ts";
import dev_server from "./cli/dev.ts";
import { LINK } from "./core/constant.ts";

const arg = (Deno.args || [])[0];

async function build(prefix: string = "") {
  console.log("Building Server Production...");
  const reload = (Deno.args || []).includes("--reload") ? " --reload" : "";
  const CMD = Deno.build.os === "windows" ? "cmd /c " : "";
  const script = CMD +
    `deno run -A --no-check${reload} --unstable ${LINK}/cli/build.ts?v=${Date.now()}${prefix}`;
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
} else if (arg === "build") {
  await build();
} else if (arg === "build-split") {
  await build(" --my-split");
} else if (arg === "help") {
  console.log(`The simple fullstack TS/JS with deno and nanojsx.
    
CREATE NEW APP:
  maze create your-app-name
  cd your-app-name

RUN DEVELOPMENT:
  maze dev

BUILD PRODUCTION:
  maze build

RUN PRODUCTION:
  deno run -A server_prod.js
  `);
} else {
  console.log(`command not valid. please type: maze help`);
}
