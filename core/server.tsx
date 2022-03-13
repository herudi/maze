/** @jsx h */
import { h } from "./deps_client.ts";
import { jsx } from "./tpl.ts";
import { HttpError, NHttp } from "./deps_server.ts";
import { RequestEvent } from "./types.ts";
import staticFiles from "https://deno.land/x/static_files@1.1.6/mod.ts";
import { join, resolve, toFileUrl } from "../cli/deps.ts";

const env = (Deno.args || []).includes("--dev") ? "development" : "production";
const clientScript = "/__maze/pages/_app.js";
const tt = Date.now();
export type ReqEvent = RequestEvent & {
  render: (
    Page: any,
    props: { path: string; initData?: any },
  ) => Record<string, any>;
};
export { NHttp };
const app = new NHttp<ReqEvent>({ env });

async function serverApp({ map_pages, map_server_pages }: any) {
  let pages: any = [];
  if (env === "development") {
    const dir = Deno.cwd();
    try {
      await Deno.remove(join(resolve(dir, "./public/__maze/pages")), {
        recursive: true,
      });
    } catch (_e) { /* noop */ }
    const { genPages } = await import("./gen.ts");

    const import_map =
      (await import(toFileUrl(join(resolve(dir, "./import_map.json"))).href, {
        assert: {
          type: "json",
        },
      })).default;
    const esbuild = await import("https://deno.land/x/esbuild@v0.14.22/mod.js");
    const es_map = await import(
      "https://esm.sh/esbuild-plugin-import-map?no-check"
    );

    pages = map_pages;
    await genPages();
    import_map.imports["nano-jsx"] = "https://cdn.skypack.dev/nano-jsx@v0.0.30";
    delete import_map.imports["types"];
    es_map.load(import_map as any);
    const result = await esbuild.build({
      jsxFactory: "h",
      jsxFragment: "Fragment",
      format: "esm",
      write: false,
      bundle: true,
      plugins: [es_map.plugin()],
      entryPoints: [join(resolve(dir, "./@shared/hydrate.tsx"))],
      minify: true,
    });
    const source = result.outputFiles[0]?.contents;
    if (source) {
      app.get(clientScript, ({ response }) => {
        response.type("application/javascript");
        return source;
      });
    }
    app.get("/__REFRESH__", ({ response }) => {
      response.type("text/event-stream");
      return new ReadableStream({
        start(controller) {
          controller.enqueue(`data: reload\nretry: 100\n\n`);
        },
        cancel(err) {
          console.log(err);
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
  } else {
    pages = map_server_pages;
  }
  return pages;
}

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

export const initApp = async (opts: {
  root: any;
  error_page: any;
  twind_setup: Record<string, any>;
  pages: Record<string, any>[];
  server_pages: Record<string, any>[];
  apis: any;
  meta_url: string;
}, routeCallback?: (app: NHttp<ReqEvent>) => any) => {
  let obj = {} as any;
  const RootApp = opts.root;
  const assets = env === 'development' ? "../public" : "./public";
  app.use(staticFiles(new URL(assets, opts.meta_url).href));
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
  const pages = await serverApp({
    map_pages: opts.pages,
    map_server_pages: opts.server_pages,
  });
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
