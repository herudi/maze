import { LINK, NHTTP_VERSION } from "../core/constant.ts";
import { join } from "./deps.ts";

export default async function createCore(create_tt = true) {
  const link = LINK;
  const dir = Deno.cwd();
  await Deno.mkdir(join(dir, ".maze"), { recursive: true });
  await Deno.mkdir(join(dir, ".maze", "result"));
  await Deno.writeTextFile(
    join(dir, ".maze", "maze.ts"),
    `import core from "./core.ts";

export default (static_url?: string) => core(static_url);
`,
  );
  await Deno.writeTextFile(
    join(dir, ".maze", "server.ts"),
    `import maze from "./maze.ts";
import config from "../maze.config.ts";

const PORT = config.port || 8080;

const app = maze(import.meta.url);

if (config.server) {
  config.server(app);
}

app.listen(PORT, () => {
  console.log("> Running on http://localhost:" + PORT);
});
`,
  );
  await Deno.writeTextFile(
    join(dir, ".maze", "root_app.tsx"),
    `/** @jsx h */
import { h } from "nano-jsx";
import App from "../pages/_default/app.tsx";

function RootApp({ Page, initData, route, isServer }: any) {
  return (
    <App
      Page={Page}
      props={{ ...initData, route, isServer }}
    />
  );
}

RootApp.initProps = (App as any).initProps;
RootApp.event = (App as any).event || {};

export default RootApp;
`,
  );
  await Deno.writeTextFile(
    join(dir, ".maze", "result", "pages.ts"),
    `
import $0 from "../../pages/index.tsx";
export const pages: any = [
  { 
    path: '/',
    page: $0,
    methods: ($0 as any).methods,
    hydrate: ($0 as any).hydrate
  },
];
`,
  );
  if (create_tt) {
    const TT = Date.now();
    await Deno.writeTextFile(
      join(dir, ".maze", "result", "constant.ts"),
      `export const BUILD_ID: string = '${TT}';
export const ENV: string = 'development';`,
    );
    await Deno.writeTextFile(
      join(dir, "maze.gen.ts"),
      `export const BUILD_ID: string = '${TT}';
export const ENV: string = 'development';`,
    );
  }

  await Deno.writeTextFile(
    join(dir, ".maze", "result", "apis.ts"),
    `import { Router } from "https://deno.land/x/nhttp@${NHTTP_VERSION}/mod.ts";
import { RequestEvent } from "${link}/core/types.ts";
const api = new Router<RequestEvent>();
export default api;
`,
  );
  await Deno.writeTextFile(
    join(dir, ".maze", "result", "server_pages.ts"),
    `import $0 from "../../pages/index.tsx";
export const pages: any = [
  { 
    path: '/',
    page: $0,
    methods: ($0 as any).methods,
    hydrate: ($0 as any).hydrate
  },
];
`,
  );
  await Deno.writeTextFile(
    join(dir, ".maze", "core.ts"),
    `import { initApp as baseInitApp } from "${link}/core/server.ts";
import ErrorPage from "../pages/_default/error.tsx";
import ssr from "../pages/_default/ssr.ts";
import config from "../maze.config.ts";
import RootApp from "./root_app.tsx";
import apis from "./result/apis.ts";
import { pages } from "./result/pages.ts";
import { BUILD_ID } from "./result/constant.ts";
import { pages as server_pages } from "./result/server_pages.ts";

export default (static_url?: string) => {
  return baseInitApp({
    root: RootApp,
    error_page: ErrorPage,
    pages: pages,
    server_pages: server_pages,
    apis: apis,
    meta_url: static_url,
    build_id: BUILD_ID,
    ssr: ssr,
    etag: config.etag,
    cache_control: config.cache_control
  });
};
`,
  );
  await Deno.writeTextFile(
    join(dir, ".maze", "hydrate.tsx"),
    `/** @jsx h */
import { h } from "nano-jsx";
import { pages } from "./result/pages.ts";
import RootApp from "./root_app.tsx";
import config from "../maze.config.ts";
import { onHydrate } from "../pages/_default/client.ts";
import ErrorPage from "../pages/_default/error.tsx";
import ClassicRouter from "${LINK}/core/classic_router.tsx";

async function lazy(url: string) {
  const mod = (await import(url)).default;
  return mod;
}
onHydrate();
let first = true;
let init: any = document.getElementById("__INIT_DATA__");
if (init) init = JSON.parse(init.textContent || "{}");
const router = new ClassicRouter(ErrorPage);
const _pages = router.buildPages(location.pathname, (config.zones || []) as string[], pages);
for (let i = 0; i < _pages.length; i++) {
  const obj: any = _pages[i];
  router.add(obj.path, async (rev) => {
    rev.isFirst = first;
    try {
      let rootData = {};
      if (!first) {
        rootData = RootApp.initProps ? (await RootApp.initProps(rev)) : {};
      }
      if (RootApp.event.onStart !== void 0) {
        await RootApp.event.onStart(rev);
      }
      const Page: any = typeof obj.page === "string"
        ? (await lazy(obj.page))
        : obj.page;
      const initData = first
        ? init || {}
        : (Page.initProps ? (await Page.initProps(rev)) : {});
      const initRender = () => {
        rev.render(
          <RootApp
            Page={Page}
            initData={{ ...initData, ...rootData }}
            route={{
              pathname: rev.pathname,
              url: rev.url,
              path: obj.path,
              params: rev.params,
            }}
            isServer={false}
          />,
        );
      }
      if (first) {
        initRender();
      } else {
        const myInitData = { ...initData, ...rootData };
        rev.render(
          <Page
            {...myInitData}
            route={{
              pathname: rev.pathname,
              url: rev.url,
              path: obj.path,
              params: rev.params,
            }}
            isServer={false}
          />, "__MAZE_PAGE__"
        );
      }
      if (RootApp.event.onEnd !== void 0) {
        RootApp.event.onEnd(rev);
      }
    } catch (err) {
      if (RootApp.event.onError !== void 0) {
        RootApp.event.onError(err, rev);
      }
    }
    first = false;
  });
}
router.resolve();`,
  );
}
