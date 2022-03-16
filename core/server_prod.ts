import { NHttp } from "./deps.ts";
import { ReqEvent } from "./types.ts";
import { CLIENT_SCRIPT } from "./constant.ts";
import baseInitApp from "./init_app.tsx";

const env = "production";
const clientScript = CLIENT_SCRIPT;
const tt = new Date().getTime();
const app = new NHttp<ReqEvent>({ env });

export const initApp = (opts: {
  root: any;
  error_page: any;
  twind_setup: Record<string, any>;
  pages: Record<string, any>[];
  server_pages: Record<string, any>[];
  apis: any;
  meta_url: string;
}, routeCallback?: (app: NHttp<ReqEvent>) => any) => {
  const pages = opts.server_pages;
  const myApp = baseInitApp(
    {
      ...opts,
      env,
      clientScript,
      tt,
    },
    pages,
    app,
    routeCallback,
  );
  return myApp;
};

export { NHttp };
export type { ReqEvent };