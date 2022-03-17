import { NHttp } from "./deps.ts";
import { ReqEvent } from "./types.ts";
import { CLIENT_SCRIPT } from "./constant.ts";
import baseInitApp from "./init_app.tsx";

const env = "production";
const clientScript = CLIENT_SCRIPT;
const app = new NHttp<ReqEvent>({ env });

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
  const myApp = baseInitApp(
    {
      ...opts,
      env,
      clientScript,
      tt: opts.build_id,
    },
    opts.server_pages,
    app,
    routeCallback,
  );
  return myApp;
};

export { NHttp };
export type { ReqEvent };
