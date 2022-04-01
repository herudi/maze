import { LINK, NANO_VERSION, NHTTP_VERSION } from "../core/constant.ts";
import { join } from "./deps.ts";

export default async function createApp() {
  const app = Deno.args[1];
  if (!app) {
    console.log("App Not Found !!\ntry => maze create my-app");
    return;
  }
  const link = LINK;
  const cwd = Deno.cwd();
  const dir = join(cwd, app);
  await Deno.mkdir(join(dir, "@shared"), { recursive: true });
  await Deno.mkdir(join(dir, "@shared", "result"));
  await Deno.mkdir(join(dir, "pages", "api"), { recursive: true });
  await Deno.mkdir(join(dir, "pages", "_default"));
  await Deno.mkdir(join(dir, ".vscode"));
  await Deno.mkdir(join(dir, "public"));
  await Deno.writeTextFile(
    join(dir, "deno.json"),
    `{
  "compilerOptions": {
    "lib": [
      "dom",
      "dom.asynciterable",
      "dom.iterable",
      "deno.ns",
      "deno.unstable"
    ],
    "jsx": "react",
    "jsxFactory": "h",
    "jsxFragmentFactory": "Fragment"
  },
  "fmt": {
    "files": {
      "exclude": [
        "@shared/",
        "public/",
        "server_prod.js"
      ]
    }
  },
  "lint": {
    "files": {
      "exclude": [
        "@shared/",
        "public/",
        "server_prod.js"
      ]
    }
  },
  "importMap": "import_map.json"
}`,
  );
  await Deno.writeTextFile(
    join(dir, "import_map.json"),
    `{
  "imports": {
    "nano-jsx": "https://deno.land/x/nano_jsx@${NANO_VERSION}/mod.ts",
    "nhttp": "https://deno.land/x/nhttp@${NHTTP_VERSION}/mod.ts",
    "maze": "${link}/mod.ts"
  }
}`,
  );
  await Deno.writeTextFile(
    join(dir, ".vscode", "settings.json"),
    `{
  "deno.enable": true,
  "deno.unstable": true,
  "deno.suggest.imports.hosts": {
    "https://deno.land": true,
    "https://esm.sh": true,
    "https://cdn.skypack.dev": true
  },
  "deno.importMap": "./import_map.json"
}`,
  );
  await Deno.writeTextFile(
    join(dir, "maze.config.ts"),
    `import type { MazeConfig } from "maze";
  
export default <MazeConfig>{ /* config */ }`,
  );
  await Deno.writeTextFile(
    join(dir, "server.ts"),
    `import maze from "./@shared/maze.ts";

maze(import.meta.url).listen(8080, () => {
  console.log("> Running on http://localhost:8080");
});
`,
  );
  await Deno.writeTextFile(
    join(dir, "pages", "_default", "app.tsx"),
    `/** @jsx h */
import { h, Helmet, Fragment } from "nano-jsx";
import { AppProps } from "maze";

export default function App({ Page, props }: AppProps) {
  return (
    <Fragment>
      <Helmet>
        <html lang="en" />
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Helmet>
      <div id="__MAZE_PAGE__"><Page {...props} /></div>
    </Fragment>
  );
}`,
  );

  await Deno.writeTextFile(
    join(dir, "pages", "_default", "error.tsx"),
    `/** @jsx h */
import { h, Helmet } from "nano-jsx";

export default function ErrorPage(
  { message = "something went wrong", status = 500 }: {
    message: string;
    status: number;
  },
) {
  return (
    <div>
      <Helmet>
        <title>{status} {message}</title>
      </Helmet>
      <div style="text-align: center">
        <h1>{status}</h1>
        <p>{message}</p>
      </div>
    </div>
  );
}
`,
  );
  await Deno.writeTextFile(
    join(dir, "pages", "_default", "ssr.ts"),
    `import { Helmet, renderSSR } from "nano-jsx";

export default function ssr(Component: any, mazeScript: string, opts: Record<string, any> = {}) {
  const app = renderSSR(Component, opts);
  const { body, head, footer, attributes } = Helmet.SSR(app);
  return ${"`<!DOCTYPE html>"}
${"<html ${attributes.html.toString()}>"}
  <head>
    ${"${head.join('\\n    ')}"}
  </head>
  ${"<body ${attributes.body.toString()}>"}
    ${"${body}"}
    ${"${footer.join('')}${mazeScript}"}
  </body>
${"</html>`"}
}
`,
  );
  await Deno.writeTextFile(
    join(dir, "pages", "_default", "client.ts"),
    `export function onHydrate() {/* set anything on hydrate at the client. */};`,
  );
  await Deno.writeTextFile(
    join(dir, "pages", "index.tsx"),
    `/** @jsx h */
import { Component, h, Helmet, Fragment } from "nano-jsx";
import { PageProps } from "maze";

export default class Home extends Component<PageProps> {

  render() {
    return (
      <Fragment>
        <Helmet>
          <title>Welcome Home Page</title>
        </Helmet>
        <div style={{ textAlign:"center" }}>
          <h1>Welcome Home</h1>
          <p>Try to modify file: /pages/index.tsx</p>
        </div>
      </Fragment>
    );
  }
} 
`,
  );
  await Deno.writeTextFile(
    join(dir, "@shared", "root_app.tsx"),
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
    join(dir, "@shared", "result", "pages.ts"),
    `
import $0 from "../../pages/index.tsx";
export const pages: any = [
  { 
    path: '/',
    page: $0,
    methods: ($0 as any).methods
  },
];
`,
  );
  await Deno.writeTextFile(
    join(dir, "@shared", "result", "constant.ts"),
    `export const BUILD_ID: string = '${Date.now()}';
export const ENV: string = 'development';`,
  );
  await Deno.writeTextFile(
    join(dir, "@shared", "result", "apis.ts"),
    `
import { Router } from "https://deno.land/x/nhttp@${NHTTP_VERSION}/mod.ts";
import { RequestEvent } from "${link}/core/types.ts";
const api = new Router<RequestEvent>();
export default api;
`,
  );
  await Deno.writeTextFile(
    join(dir, "@shared", "result", "server_pages.ts"),
    `
import $0 from "../../pages/index.tsx";
export const pages: any = [
  { 
    path: '/',
    page: $0,
    methods: ($0 as any).methods
  },
];
`,
  );
  await Deno.writeTextFile(
    join(dir, "@shared", "maze.ts"),
    `import { initApp as baseInitApp, NHttp, ReqEvent } from "${link}/core/server.ts";
import ErrorPage from "../pages/_default/error.tsx";
import ssr from "../pages/_default/ssr.ts";
import config from "../maze.config.ts";
import RootApp from "./root_app.tsx";
import apis from "./result/apis.ts";
import { pages } from "./result/pages.ts";
import { BUILD_ID } from "./result/constant.ts";
import { pages as server_pages } from "./result/server_pages.ts";

export default (url: string, {
  appCallback,
  staticConfig
}: {
  appCallback?: (app: NHttp<ReqEvent>) => any
  staticConfig?: (rev: ReqEvent) => void
} = {}) => {
  return baseInitApp({
    root: RootApp,
    error_page: ErrorPage,
    pages: pages,
    server_pages: server_pages,
    apis: apis,
    meta_url: url,
    build_id: BUILD_ID,
    ssr: ssr,
    static_config: staticConfig,
    etag: config.etag,
    cache_control: config.cache_control
  }, appCallback);
};
`,
  );
  await Deno.writeTextFile(
    join(dir, "@shared", "hydrate.tsx"),
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
window.addEventListener("load", () => {
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
  router.resolve();
});`,
  );
  console.log(`Success create ${app}.
    
cd ${app}

RUN DEVELOPMENT:
  maze dev

BUILD PRODUCTION:
  maze build

RUN PRODUCTION:
  deno run -A server_prod.js
  `);
}
