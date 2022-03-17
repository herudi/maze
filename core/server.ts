import { NHttp } from "./deps.ts";
import { ReqEvent } from "./types.ts";
import { join, resolve, toFileUrl } from "../cli/deps.ts";
import { CLIENT_SCRIPT, NANO_VERSION } from "./constant.ts";
import baseInitApp from "./init_app.tsx";
import { genPages } from "./gen.ts";
import * as esbuild from "https://deno.land/x/esbuild@v0.14.22/mod.js";
import * as esbuild_import_map from "https://esm.sh/esbuild-plugin-import-map?no-check";

const env = "development";
const clientScript = CLIENT_SCRIPT;
const dir = Deno.cwd();
const tt = Date.now().toString();
const app = new NHttp<ReqEvent>({ env });
await genPages();
try {
  await Deno.remove(join(resolve(dir, "./public/__maze/pages")), {
    recursive: true,
  });
} catch (_e) { /* noop */ }
const import_map =
  (await import(toFileUrl(join(resolve(dir, "./import_map.json"))).href, {
    assert: {
      type: "json",
    },
  })).default;
import_map.imports["nano-jsx"] =
  `https://cdn.skypack.dev/nano-jsx@${NANO_VERSION}`;
delete import_map.imports["types"];
esbuild_import_map.load(import_map as any);
const result = await esbuild.build({
  jsxFactory: "h",
  jsxFragment: "Fragment",
  write: false,
  bundle: true,
  plugins: [esbuild_import_map.plugin()],
  entryPoints: [join(resolve(dir, "./@shared/hydrate.tsx"))],
  minify: true,
});
const source = result.outputFiles[0]?.contents;
if (source) {
  app.get(clientScript, ({ response }) => {
    response.type("application/javascript");
    return source;
  });
}
app.get("/__REFRESH__", ({ response }) => {
  response.type("text/event-stream");
  return new ReadableStream({
    start(controller) {
      controller.enqueue(`data: reload\nretry: 100\n\n`);
    },
    cancel(err) {
      console.log(err);
    },
  }).pipeThrough(new TextEncoderStream());
});
app.get("/js/refresh.js", ({ response }) => {
  response.type("application/javascript");
  return `let bool = false; new EventSource("/__REFRESH__").addEventListener("message", _ => {
if (bool) location.reload();
else bool = true;
});`;
});
export const initApp = (opts: {
  root: any;
  error_page: any;
  twind_setup: Record<string, any>;
  pages: Record<string, any>[];
  server_pages: Record<string, any>[];
  apis: any;
  meta_url: string;
  build_id: string;
  build_bundle: boolean;
}, routeCallback?: (app: NHttp<ReqEvent>) => any) => {
  opts.build_bundle = true;
  return baseInitApp(
    {
      ...opts,
      env,
      clientScript,
      tt,
    },
    opts.pages,
    app,
    routeCallback,
  );
};

export { NHttp };
export type { ReqEvent };
