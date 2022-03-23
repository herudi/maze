import { NHttp } from "./deps.ts";
import { ReqEvent } from "./types.ts";
import baseInitApp from "./init_app.tsx";

const env = "production";
const app = new NHttp<ReqEvent>({ env });

export const initApp = (opts: {
  root: any;
  error_page: any;
  pages: Record<string, any>[];
  server_pages: Record<string, any>[];
  apis: any;
  ssr: (Component: any, mazeScript: string, opts?: Record<string, any>) => any;
  meta_url: string;
  build_id: string;
  static_config?: (rev: ReqEvent) => void;
}, routeCallback?: (app: NHttp<ReqEvent>) => any) => {
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
