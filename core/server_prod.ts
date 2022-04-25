import { NHttp } from "./deps.ts";
import { ReqEvent, TOptionsInitApp } from "./types.ts";
import baseInitApp from "./init_app.tsx";

const env = "production";
const app = new NHttp<ReqEvent>({ env });

export const initApp = (
  opts: TOptionsInitApp,
) => {
  const clientScript = `/static/__maze/${opts.build_id}/_app.js`;
  const myApp = baseInitApp(
    {
      ...opts,
      env,
      clientScript,
    },
    opts.server_pages,
    app,
  );
  return myApp;
};

export { NHttp };
export type { ReqEvent };
