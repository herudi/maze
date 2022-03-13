import * as esbuild from "https://deno.land/x/esbuild@v0.14.22/mod.js";
import * as esbuild_import_map from "https://esm.sh/esbuild-plugin-import-map?no-check";
import { genRoutesWithRefresh, getListPages } from "./../core/gen.ts";
import { denoPlugin } from "https://deno.land/x/esbuild_deno_loader@0.4.0/mod.ts";
import { join, resolve, toFileUrl } from "./deps.ts";

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
  const error = await genRoutesWithRefresh("production");
  if (error) {
    throw error;
  }
  await esbuild.build({
    ...config,
    bundle: true,
    entryPoints: [join(resolve(dir, "./server.ts"))],
    outfile: join(resolve(dir, "./server_prod.js")),
    plugins: [esbuild_import_map.plugin()],
  });

  await esbuild.build({
    ...config,
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
  console.log("Success Build !!");
  console.log("Run Production: deno run -A server_prod.js");
  esbuild.stop();
} catch (error) {
  console.log(error.message);
  esbuild.stop();
}
