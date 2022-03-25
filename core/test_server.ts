// server for test

import { NHttp } from "./deps.ts";
import { ReqEvent, TOptionsInitApp, TRet } from "./types.ts";
import baseInitApp from "./init_app.tsx";

const env = "test";
const build_id = "1648194232103";
const app = new NHttp<ReqEvent>({ env });
const { files } = await Deno.emit("./tests/sample/@shared/hydrate.tsx", {
  bundle: "module",
  check: false,
  compilerOptions: {
    jsxFactory: "h",
    jsxFragmentFactory: "Fragment",
    lib: ["dom", "dom.iterable", "esnext"],
  },
});
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
