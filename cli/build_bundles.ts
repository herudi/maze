import * as esbuild from "https://deno.land/x/esbuild@v0.14.22/mod.js";
import { genRoutesWithRefresh } from "./../core/gen.ts";
import { denoPlugin } from "https://deno.land/x/esbuild_deno_loader@0.4.0/mod.ts";
import { join, resolve, toFileUrl } from "./deps.ts";
import { LINK } from "../core/constant.ts";

async function clean() {
  try {
    await Deno.remove(join(resolve(dir, "./@shared/http_prod.ts")));
  } catch (_e) { /* noop */ }
  try {
    await Deno.remove(join(resolve(dir, "./server_prod.ts")));
  } catch (_e) { /* noop */ }
}

const dir = Deno.cwd();

try {
  await Deno.remove(join(resolve(dir, "./public/__maze/pages")), {
    recursive: true,
  });
} catch (_e) { /* noop */ }

const config: any = {
  absWorkingDir: dir,
  jsxFactory: "h",
  jsxFragment: "Fragment",
  format: "esm",
  loader: {
    ".ts": "ts",
    ".js": "js",
    ".tsx": "tsx",
  },
  treeShaking: true,
  minify: true,
  logLevel: "silent",
};

try {
  const error = await genRoutesWithRefresh("production_bundles");
  if (error) {
    throw error;
  }
  let file_http = await Deno.readTextFile(join(dir, "@shared", "http.ts"));
  file_http = file_http.replace(
    `${LINK}/core/server.ts`,
    `${LINK}/core/server_prod.ts`,
  );
  await Deno.writeTextFile(join(dir, "@shared", "http_prod.ts"), file_http);
  let file_server = await Deno.readTextFile(join(dir, "server.ts"));
  file_server = file_server.replace(
    "./@shared/http.ts",
    "./@shared/http_prod.ts",
  );
  await Deno.writeTextFile(join(dir, "server_prod.ts"), file_server);
  await esbuild.build({
    ...config,
    bundle: true,
    entryPoints: [toFileUrl(join(resolve(dir, "./server_prod.ts"))).href],
    outfile: join(resolve(dir, "./server_prod.js")),
    plugins: [denoPlugin({
      importMapFile: join(resolve(dir, "./import_map.json")),
    })],
  });

  await esbuild.build({
    ...config,
    bundle: true,
    plugins: [denoPlugin({
      importMapFile: join(resolve(dir, "./import_map.json")),
    })],
    entryPoints: [toFileUrl(join(resolve(dir, "./@shared/hydrate.tsx"))).href],
    outfile: join(resolve(dir, "./public/__maze/pages/_app.js")),
  });
  await clean();
  console.log("Success Build !!");
  console.log("Run Production: deno run -A server_prod.js");
  esbuild.stop();
} catch (error) {
  console.log(error.message);
  await clean();
  esbuild.stop();
}
