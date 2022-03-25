/** @jsx h */
import { h } from "./nano_jsx.ts";
import { HttpError, NHttp } from "./deps.ts";
import fetchFile from "./fetch_file.ts";
import { ReqEvent, TObject, TRet } from "./types.ts";

export default (
  opts: {
    root: TRet;
    error_page: TRet;
    apis: TRet;
    meta_url: string;
    env: string;
    clientScript: string;
    build_id: string;
    ssr: (
      Component: TRet,
      mazeScript: string,
      opts?: Record<string, TRet>,
    ) => TRet;
    static_config?: (rev: ReqEvent) => void;
  },
  pages: TRet[],
  app: NHttp<ReqEvent>,
  routeCallback?: (app: NHttp<ReqEvent>) => TRet,
) => {
  const env = opts.env;
  const ssr = opts.ssr;
  const build_id = opts.build_id;
  const clientScript = opts.clientScript;
  const RootApp = opts.root;
  const ErrorPage = opts.error_page;
  let obj = {} as TRet;
  app.use((rev, next) => {
    rev.getBaseUrl = () => new URL(rev.request.url).origin;
    rev.isServer = true;
    rev.env = env;
    rev.pathname = rev.path;
    rev.fetchApi = async (pathname) => {
      const arr = app.route["ANY"];
      let i = 0, fns: TRet;
      const len = arr.length;
      while (i < len) {
        const obj = arr[i];
        if (obj.pathx.test(pathname)) {
          fns = obj.fns;
          break;
        }
        i++;
      }
      if (!fns) throw new HttpError(404, `${pathname} not found`);
      try {
        if (fns.length === 1) {
          const data = await fns[0](rev, next);
          return { data, error: void 0 };
        }
        let j = 0;
        const ret = (err?: Error) => {
          if (err) {
            if (err instanceof Error) throw err;
            else throw new HttpError(500, String(err));
          }
          return fns[j++](rev, ret);
        };
        const data = await ret();
        return { data, error: void 0 };
      } catch (error) {
        return {
          data: void 0,
          error: {
            status: error.status || 500,
            message: error.message || "Something went wrong",
          },
        };
      }
    };
    rev.render = async (Page, props) => {
      rev.response.type("text/html; charset=utf-8");
      const rootData = RootApp.initProps ? (await RootApp.initProps(rev)) : {};
      if (rootData) {
        const data = props.initData || {};
        props.initData = { ...data, ...rootData };
      }
      return ssr(
        <RootApp
          isServer={true}
          initData={props.initData}
          Page={Page}
          route={{
            url: rev.url,
            pathname: rev.path,
            path: props.path,
            params: rev.params,
          }}
        />,
        [
          props.initData
            ? `<script id="__INIT_DATA__" type="application/json">${
              JSON.stringify(props.initData)
            }</script>`
            : "",
          env === "development" ? '<script src="/js/refresh.js"></script>' : "",
          clientScript
            ? `<script type="module" src="${clientScript}"></script>`
            : "",
        ].join(""),
        { pathname: rev.path },
      );
    };
    return next();
  });
  app.on404((rev) => {
    throw new HttpError(404, `${rev.url} not found`);
  });
  app.onError((err, rev) => {
    const status = rev.response.status();
    if (rev.path.startsWith("/api/")) {
      return { status, message: err.message };
    }
    rev.response.type("text/html; charset=utf-8");
    return ssr(
      <ErrorPage message={err.message} status={status as number} />,
      "",
      { pathname: rev.path },
    );
  });
  if (routeCallback) {
    routeCallback(app);
    obj = app.route;
  }
  app.use(
    fetchFile(
      opts.meta_url.endsWith("/public")
        ? opts.meta_url
        : new URL("public", opts.meta_url).href,
      Number(build_id),
      opts.static_config,
    ),
  );
  app.use("/api", opts.apis);
  for (let i = 0; i < pages.length; i++) {
    const route: TRet = pages[i];
    const methods = route.methods || ["GET"];
    for (let j = 0; j < methods.length; j++) {
      const method = methods[j];
      if (!obj[method + route.path]) {
        app.on(method, route.path, async (rev) => {
          const Page = route.page as TRet;
          const initData = Page.initProps
            ? (await Page.initProps(rev))
            : void 0;
          return rev.render(Page, { path: route.path, initData });
        });
      }
    }
  }
  return {
    listen(
      opts: number | Deno.ListenOptions | Deno.ListenTlsOptions | TObject,
      callback?: (
        err?: Error,
        opts?:
          | Deno.ListenOptions
          | Deno.ListenTlsOptions
          | TObject,
      ) => void | Promise<void>,
    ) {
      if (typeof Deno === "undefined") {
        addEventListener("fetch", (e: TRet) => {
          e.respondWith(app.handleEvent(e));
        });
      } else {
        app.listen(opts, callback);
      }
    },
  };
};
