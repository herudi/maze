import * as esbuild from "https://deno.land/x/esbuild@v0.14.25/mod.js";
import * as esbuild_import_map from "https://esm.sh/esbuild-plugin-import-map?no-check";
import { genRoutesWithRefresh, getListPages } from "./../core/gen.ts";
import { denoPlugin } from "https://deno.land/x/esbuild_deno_loader@0.4.1/mod.ts";
import { join, resolve, toFileUrl } from "./deps.ts";
import { LINK } from "../core/constant.ts";
import { TRet } from "../core/types.ts";

const isBundle = (Deno.args || []).includes("--my-split") ? false : true;

const dir = Deno.cwd();

const map =
  (await import(toFileUrl(join(resolve(dir, "./import_map.json"))).href, {
    assert: {
      type: "json",
    },
  })).default;

const cfg =
  (await import(toFileUrl(join(resolve(dir, "./maze.config.ts"))).href))
    .default;

const build_cfg = (cfg || {}).build || {};

const BUILD_ID = Date.now();

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
    `export const BUILD_ID: string = '${BUILD_ID}';
export const ENV: string = 'production';`,
  );
  const create_app_file =
    (await Deno.readTextFile(join(dir, "@shared", "create_app.ts")))
      .replace(
        `${LINK}/core/server.ts`,
        `${LINK}/core/server_prod.ts`,
      );
  await Deno.writeTextFile(
    join(dir, "@shared", "create_app.ts"),
    create_app_file,
  );
  await esbuild.build({
    ...config,
    format: "esm",
    platform: "neutral",
    target: ["esnext", "es2020"],
    bundle: true,
    entryPoints: [join(resolve(dir, "./maze.ts"))],
    outfile: join(resolve(dir, "./maze.build.js")),
    plugins: [esbuild_import_map.plugin()],
  });
  const maze_file = (await Deno.readTextFile(join(dir, "server.ts")))
    .replace(
      `maze.ts`,
      `maze.build.js`,
    );
  await Deno.writeTextFile(join(dir, "server.ts"), maze_file);
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
      ...build_cfg,
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
      ...build_cfg,
    });
  }
  console.log("Success building assets !!");
  console.log("Run server: deno run -A server.ts");
  esbuild.stop();
} catch (error) {
  console.log(error.message);
  esbuild.stop();
}
