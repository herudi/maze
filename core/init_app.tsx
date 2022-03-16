/** @jsx h */
import { h, HttpError, NHttp } from "./deps.ts";
import { jsx } from "./tpl.ts";
import fetchFile from "./fetch_file.ts";
import { ReqEvent } from "./types.ts";

export default (
  opts: {
    root: any;
    error_page: any;
    twind_setup: Record<string, any>;
    apis: any;
    meta_url: string;
    env: string;
    clientScript: string;
    tt: number;
  },
  pages: any[],
  app: NHttp<ReqEvent>,
  routeCallback?: (app: NHttp<ReqEvent>) => any,
) => {
  const env = opts.env;
  const clientScript = opts.clientScript;
  const tt = opts.tt;
  app.use((rev, next) => {
    rev.getBaseUrl = () => new URL(rev.request.url).origin;
    rev.isServer = true;
    rev.env = env;
    rev.pathname = rev.path;
    rev.fetchApi = async (pathname) => {
      const arr = app.route["ANY"];
      let i = 0, len = arr.length, fns: any;
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
    return next();
  });

  app.on404((rev) => {
    throw new HttpError(404, `${rev.url} not found`);
  });
  let obj = {} as any;
  const RootApp = opts.root;
  app.use(
    fetchFile(
      opts.meta_url.endsWith("/public")
        ? opts.meta_url
        : new URL("public", opts.meta_url).href,
    ),
  );
  app.use("/api", opts.apis);
  app.use((rev, next) => {
    rev.render = async (Page, props) => {
      rev.response.type("text/html; charset=utf-8");
      const rootData = RootApp.initProps ? (await RootApp.initProps(rev)) : {};
      if (rootData) {
        const data = props.initData || {};
        props.initData = { ...data, ...rootData };
      }
      return jsx(
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
        opts.twind_setup,
        { clientScript, env, initData: props.initData, tt },
        { pathname: rev.path },
      );
    };
    return next();
  });
  if (routeCallback) {
    routeCallback(app);
    obj = app.route;
  }
  for (let i = 0; i < pages.length; i++) {
    const route: any = pages[i];
    const methods = route.methods || ["GET"];
    for (let j = 0; j < methods.length; j++) {
      const method = methods[j];
      if (!obj[method + route.path]) {
        app.on(method, route.path, async (rev) => {
          const Page = route.page as any;
          const initData = Page.initProps
            ? (await Page.initProps(rev))
            : void 0;
          return rev.render(Page, { path: route.path, initData });
        });
      }
    }
  }
  const ErrorPage = opts.error_page;
  app.onError((err, rev) => {
    const status = rev.response.status();
    if (rev.path.startsWith("/api/")) {
      return { status, message: err.message };
    }
    rev.response.type("text/html; charset=utf-8");
    return jsx(
      <ErrorPage message={err.message} status={status as number} />,
      opts.twind_setup,
      {},
      { pathname: rev.path },
    );
  });
  return app;
};