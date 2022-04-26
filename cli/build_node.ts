import * as esbuild from "https://deno.land/x/esbuild@v0.14.25/mod.js";
import { denoPlugin } from "https://deno.land/x/esbuild_deno_loader@0.4.1/mod.ts";
import { join, resolve, toFileUrl } from "./deps.ts";

export default async function buildNode(log = true) {
  try {
    const dir = Deno.cwd();
    await esbuild.build({
      absWorkingDir: dir,
      jsxFactory: "h",
      jsxFragment: "Fragment",
      loader: {
        ".ts": "ts",
        ".js": "js",
        ".tsx": "tsx",
      },
      treeShaking: true,
      minify: true,
      logLevel: "silent",
      platform: "node",
      target: ["node10.4"],
      bundle: true,
      entryPoints: [
        toFileUrl(join(resolve(dir, ".maze", "core.build.js"))).href,
      ],
      outfile: join(resolve(dir, ".maze", "core.node.js")),
      plugins: [denoPlugin()],
    });
    if (log) {
      console.log("Success transform to node");
      console.log("Access file at ./maze/core.node.js");
    }
    esbuild.stop();
  } catch (error) {
    console.log(error.message);
    esbuild.stop();
  }
}
