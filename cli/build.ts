import * as esbuild from "https://deno.land/x/esbuild@v0.14.22/mod.js";
import * as esbuild_import_map from "https://esm.sh/esbuild-plugin-import-map?no-check";
import { genRoutesWithRefresh, getListPages } from "./../core/gen.ts";
import { denoPlugin } from "https://deno.land/x/esbuild_deno_loader@0.4.0/mod.ts";
import { join, resolve, toFileUrl } from "./deps.ts";
import { LINK } from "../core/constant.ts";

const isWorkers = (Deno.args || []).includes("--my-cfw") ? true : false;
const isBundle = (Deno.args || []).includes("--my-split") ? false : true;

async function clean() {
  try {
    await Deno.remove(join(resolve(dir, "./@shared/http_prod.ts")));
  } catch (_e) { /* noop */ }
  try {
    await Deno.remove(join(resolve(dir, "./server_prod.ts")));
  } catch (_e) { /* noop */ }
}

const dir = Deno.cwd();

const map =
  (await import(toFileUrl(join(resolve(dir, "./import_map.json"))).href, {
    assert: {
      type: "json",
    },
  })).default;

delete map.imports["types"];

esbuild_import_map.load(map as any);

const listFiles = await getListPages();

const obj = {} as any;

for (let i = 0; i < listFiles.length; i++) {
  const name = listFiles[i];
  const _name = name.replace("./pages/", "").replace(/\.[^.]+$/, "");
  obj[_name] = toFileUrl(join(resolve(dir, name))).href;
}

try {
  await Deno.remove(join(resolve(dir, "./public/__maze/pages")), {
    recursive: true,
  });
} catch (_e) { /* noop */ }

const config: any = {
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
};

try {
  const error = await genRoutesWithRefresh(
    `production${isBundle ? "_bundles" : ""}`,
  );
  if (error) {
    throw error;
  }
  await Deno.writeTextFile(
    join(dir, "@shared", "result", "constant.ts"),
    `export const BUILD_ID: string = '${Date.now()}';`,
  );
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
  if (isWorkers) {
    await esbuild.build({
      ...config,
      format: "esm",
      platform: "neutral",
      bundle: true,
      entryPoints: [toFileUrl(join(resolve(dir, "./server_prod.ts"))).href],
      outfile: join(resolve(dir, "./server_prod.js")),
      plugins: [denoPlugin({
        importMapFile: join(resolve(dir, "./import_map.json")),
      })],
    });
  } else {
    await esbuild.build({
      ...config,
      format: "esm",
      platform: "neutral",
      bundle: true,
      entryPoints: [join(resolve(dir, "./server_prod.ts"))],
      outfile: join(resolve(dir, "./server_prod.js")),
      plugins: [esbuild_import_map.plugin()],
    });
  }
  if (isBundle) {
    await esbuild.build({
      ...config,
      format: "esm",
      platform: "browser",
      target: ["es6"],
      bundle: true,
      plugins: [denoPlugin({
        importMapFile: join(resolve(dir, "./import_map.json")),
      })],
      entryPoints: [
        toFileUrl(join(resolve(dir, "./@shared/hydrate.tsx"))).href,
      ],
      outfile: join(resolve(dir, "./public/__maze/pages/_app.js")),
    });
  } else {
    await esbuild.build({
      ...config,
      format: "esm",
      platform: "browser",
      target: ["es6"],
      bundle: true,
      plugins: [denoPlugin({
        importMapFile: join(resolve(dir, "./import_map.json")),
      })],
      entryPoints: {
        "_app": toFileUrl(join(resolve(dir, "./@shared/hydrate.tsx"))).href,
        ...obj,
      },
      splitting: true,
      outdir: join(resolve(dir, "./public/__maze/pages")),
    });
  }
  await clean();
  console.log("Success Build !!");
  console.log("Run Production: deno run -A server_prod.js");
  esbuild.stop();
} catch (error) {
  console.log(error.message);
  await clean();
  esbuild.stop();
}
