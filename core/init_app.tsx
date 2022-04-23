/** @jsx h */
import { h } from "./nano_jsx.ts";
import { HttpError, NHttp } from "./deps.ts";
import fetchFile from "./fetch_file.ts";
import { ReqEvent, TObject, TRet } from "./types.ts";
import * as base64 from "https://deno.land/std@0.131.0/encoding/base64.ts";
import { join, toFileUrl } from "https://deno.land/std@0.132.0/path/mod.ts";

const encoder = new TextEncoder();
const def = '"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk"';

async function entityTag(entity: Uint8Array) {
  if (!entity) return def;
  if (entity.length === 0) return def;
  const digest = await crypto.subtle.digest("SHA-1", entity);
  const hash = base64.encode(digest).substring(0, 27);
  return `"${entity.length.toString(16)}-${hash}"`;
}

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
    etag?: boolean;
    cache_control?: string;
  },
  pages: TRet[],
  app: NHttp<ReqEvent>,
  routeCallback?: (app: NHttp<ReqEvent>) => TRet,
) => {
  const etag = opts.etag !== false;
  const cache_control = opts.cache_control;
  const env = opts.env;
  const ssr = opts.ssr;
  const build_id = opts.build_id;
  const clientScript = opts.clientScript;
  const RootApp = opts.root;
  const ErrorPage = opts.error_page;
  let obj = {} as TRet;
  app.use((rev, next) => {
    if (etag) {
      const { response, request, respondWith } = rev;
      const sendEtag = async function (body: TRet) {
        try {
          let fname = "noop";
          if (typeof body === "object") {
            if (body instanceof Response) return respondWith(body);
            if (
              body instanceof ReadableStream ||
              body instanceof FormData ||
              body instanceof Blob ||
              typeof (body as unknown as Deno.Reader).read === "function"
            ) {
              return respondWith(new Response(body, rev.responseInit));
            } else if (body instanceof Uint8Array) {
              fname = "Uint8Array";
            } else {
              body = JSON.stringify(body);
              fname = "json";
            }
          }
          if (!response.header("ETag")) {
            const etag = await entityTag(
              fname === "Uint8Array" ? body : encoder.encode(body),
            );
            response.header("ETag", `W/${etag}`);
          }
          if (
            request.headers.get("if-none-match") === response.header("ETag")
          ) {
            response.status(304);
            return respondWith(new Response(void 0, rev.responseInit));
          }
          if (fname === "json") {
            response.header(
              "content-type",
              "application/json; charset=utf-8",
            );
          }
          return respondWith(new Response(body, rev.responseInit));
        } catch (_e) {
          return respondWith(new Response(body, rev.responseInit));
        }
      };
      rev.response.send = sendEtag as TRet;
    }
    if (env === "production" && cache_control) {
      rev.response.header("cache-control", cache_control);
    }
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
        : toFileUrl(join(Deno.cwd(), "public")).href,
      etag,
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
      app.listen(opts, callback);
    },
    handleEvent(event: TRet) {
      return app.handleEvent(event);
    },
  };
};
