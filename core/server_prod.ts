import { NHttp } from "./deps.ts";
import { ReqEvent, TOptionsInitApp, TRet } from "./types.ts";
import baseInitApp from "./init_app.tsx";

const env = "production";
const app = new NHttp<ReqEvent>({ env });

export const initApp = (
  opts: TOptionsInitApp,
  routeCallback?: (app: NHttp<ReqEvent>) => TRet,
) => {
  const clientScript = `/__maze/${opts.build_id}/_app.js`;
  const myApp = baseInitApp(
    {
      ...opts,
      env,
      clientScript,
    },
    opts.server_pages,
    app,
    routeCallback,
  );
  return myApp;
};

export { NHttp };
export type { ReqEvent };
