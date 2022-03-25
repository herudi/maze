import * as esbuild from "https://deno.land/x/esbuild@v0.14.22/mod.js";
import * as esbuild_import_map from "https://esm.sh/esbuild-plugin-import-map?no-check";
import { genRoutesWithRefresh, getListPages } from "./../core/gen.ts";
import { denoPlugin } from "https://deno.land/x/esbuild_deno_loader@0.4.0/mod.ts";
import { join, resolve, toFileUrl } from "./deps.ts";
import { LINK } from "../core/constant.ts";
import { TRet } from "../core/types.ts";

const isBundle = (Deno.args || []).includes("--my-split") ? false : true;

async function clean() {
  try {
    await Deno.remove(join(resolve(dir, "./@shared/maze_prod.ts")));
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
const BUILD_ID = Date.now();

delete map.imports["types"];

esbuild_import_map.load(map as TRet);

const listFiles = await getListPages();

const obj = {} as TRet;

for (let i = 0; i < listFiles.length; i++) {
  const name = listFiles[i];
  const _name = name.replace("./pages/", "").replace(/\.[^.]+$/, "");
  obj[_name] = toFileUrl(join(resolve(dir, name))).href;
}

try {
  await Deno.remove(join(resolve(dir, "./public/__maze")), {
    recursive: true,
  });
} catch (_e) { /* noop */ }

const config: TRet = {
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
    `export const BUILD_ID: string = '${BUILD_ID}';`,
  );
  let file_http = await Deno.readTextFile(join(dir, "@shared", "maze.ts"));
  file_http = file_http.replace(
    `${LINK}/core/server.ts`,
    `${LINK}/core/server_prod.ts`,
  );
  await Deno.writeTextFile(join(dir, "@shared", "maze_prod.ts"), file_http);
  let file_server = await Deno.readTextFile(join(dir, "server.ts"));
  file_server = file_server.replace(
    "./@shared/maze.ts",
    "./@shared/maze_prod.ts",
  );
  await Deno.writeTextFile(join(dir, "server_prod.ts"), file_server);
  await esbuild.build({
    ...config,
    format: "esm",
    platform: "neutral",
    target: ["esnext", "es2020"],
    bundle: true,
    entryPoints: [join(resolve(dir, "./server_prod.ts"))],
    outfile: join(resolve(dir, "./server_prod.js")),
    plugins: [esbuild_import_map.plugin()],
  });
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
      outfile: join(resolve(dir, `./public/__maze/${BUILD_ID}/_app.js`)),
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
      outdir: join(resolve(dir, `./public/__maze/${BUILD_ID}`)),
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
