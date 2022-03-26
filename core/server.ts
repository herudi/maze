import { NHttp } from "./deps.ts";
import { ReqEvent, TOptionsInitApp, TRet } from "./types.ts";
import { join, resolve, toFileUrl } from "../cli/deps.ts";
import baseInitApp from "./init_app.tsx";
import { genPages } from "./gen.ts";

const env = "development";
const isDev = (Deno.args || []).includes("--dev");
const dir = Deno.cwd();
const build_id = isDev ? Date.now().toString() : "1648194232103";
const app = new NHttp<ReqEvent>({ env });
if (isDev) {
  await genPages();
  try {
    await Deno.remove(join(resolve(dir, "./public/__maze")), {
      recursive: true,
    });
  } catch (_e) { /* noop */ }
  app.get("/__REFRESH__", ({ response }) => {
    response.type("text/event-stream");
    return new ReadableStream({
      start(controller) {
        controller.enqueue(`data: reload\nretry: 100\n\n`);
      },
      cancel(err) {
        console.log(err || "Error ReadableStream");
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
}
const hydrate_file = isDev
  ? toFileUrl(join(resolve(dir, "./@shared/hydrate.tsx")))
  : "./tests/sample/@shared/hydrate.tsx";
const { files } = await Deno.emit(
  hydrate_file,
  {
    bundle: "module",
    check: false,
    compilerOptions: {
      jsxFactory: "h",
      jsxFragmentFactory: "Fragment",
      lib: ["dom", "dom.iterable", "esnext"],
    },
    importMapPath: isDev
      ? toFileUrl(join(resolve(dir, "./import_map.json"))).href
      : void 0,
  },
);
const clientScript = `/__maze/${build_id}/_app.js`;
app.get(clientScript, ({ response }) => {
  response.type("application/javascript");
  return files["deno:///bundle.js"];
});

export const initApp = (
  opts: TOptionsInitApp,
  routeCallback?: (app: NHttp<ReqEvent>) => TRet,
) => {
  opts.build_id = build_id;
  return baseInitApp(
    {
      ...opts,
      env,
      clientScript,
    },
    opts.pages,
    app,
    routeCallback,
  );
};

export { NHttp };
export type { ReqEvent };
