import { LINK } from "../core/constant.ts";
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
  await Deno.mkdir(join(dir, "components"), { recursive: true });
  await Deno.mkdir(join(dir, "@shared"));
  await Deno.mkdir(join(dir, "config"));
  await Deno.mkdir(join(dir, "@shared", "result"));
  await Deno.mkdir(join(dir, "pages", "api"), { recursive: true });
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
  "importMap": "./import_map.json"
}`,
  );
  await Deno.writeTextFile(
    join(dir, "import_map.json"),
    `
{
  "imports": {
    "nano-jsx": "https://deno.land/x/nano_jsx@v0.0.30/mod.ts",
    "twind": "https://cdn.skypack.dev/twind@0.16.16",
    "nhttp": "https://deno.land/x/nhttp@1.1.10/mod.ts",
    "types": "${link}/core/types.ts"
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
    join(dir, "config", "style_tag.ts"),
    `import { setup } from "https://cdn.skypack.dev/twind@0.16.16";
import { virtualSheet, getStyleTag } from "https://cdn.skypack.dev/twind@0.16.16/sheets";

const sheet = virtualSheet();
setup({ sheet });

export default getStyleTag(sheet);`,
  );
  await Deno.writeTextFile(
    join(dir, "server.ts"),
    `import { initApp } from "./@shared/http.ts";

const app = await initApp(/* callback app */);
app.listen(8080, () => {
  console.log("> Running on http://localhost:8080");
});
`,
  );
  await Deno.writeTextFile(
    join(dir, "components", "navbar.tsx"),
    `/** @jsx h */
import { Component, h, Router } from "nano-jsx";
import { tw } from "twind";

const { Link, Listener } = Router;
const active = "bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-medium";
const in_active = "text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium";

export default class Navbar extends Component {
  listener = Listener().use();
  didMount() {
    this.listener.subscribe((curr, prev) => {
      if (curr !== prev) {
        this.update({ pathname: location.pathname });
      }
    })
  }
  didUnmount() {
    this.listener.cancel();
  }
  render(loc: Location) {
    const route = loc || this.props.route;
    return (
      <nav class={tw${"`bg-gray-800 sticky top-0 z-10`"}}>
        <div class={tw${"`max-w-7xl mx-auto px-2 sm:px-6 lg:px-8`"}}>
          <div class={tw${"`relative flex items-center justify-between h-16`"}}>
            <div class={tw${"`flex-1 flex items-center justify-center sm:items-stretch sm:justify-start`"}}>
              <div class={tw${"`sm:block sm:ml-6`"}}>
                <div class={tw${"`flex space-x-4`"}}>
                  <Link to="/" class={tw${"`${route.pathname === '/' ? active : in_active}`"}}>
                    Home
                  </Link>
                  <Link to="/about" class={tw${"`${route.pathname === '/about' ? active : in_active}`"}}>
                    About
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }
}
`,
  );
  await Deno.writeTextFile(
    join(dir, "pages", "_app.tsx"),
    `/** @jsx h */
import { h, Helmet } from "nano-jsx";
import { AppProps } from "types";
import Navbar from "../components/navbar.tsx";

export default function App({ Component, props }: AppProps) {
  return (
    <div>
      <Helmet>
        <html lang="en" />
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Helmet>
      <Navbar route={props.route} />
      <Component {...props} />
    </div>
  );
}
`,
  );

  await Deno.writeTextFile(
    join(dir, "pages", "_error.tsx"),
    `/** @jsx h */
import { h, Helmet } from "nano-jsx";
import { tw } from "twind";

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
      <div class={tw${"`flex items-center justify-center w-screen h-screen`"}}>
        <div class={tw${"`px-40 py-20 bg-white rounded-md`"}}>
          <div class={tw${"`flex flex-col items-center`"}}>
            <h1 class={tw${"`font-bold text-blue-600 text-9xl`"}}>{status}</h1>
            <h6 class={tw${"`mb-2 text-2xl font-bold text-center text-gray-800 md:text-3xl`"}}>
              <span class={tw${"`text-red-500`"}}>Oops!</span> Error
            </h6>
            <p class={tw${"`mb-8 text-center text-gray-500 md:text-lg`"}}>
              {message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
`,
  );
  await Deno.writeTextFile(
    join(dir, "pages", "about.tsx"),
    `/** @jsx h */
import { Component, h, Helmet } from "nano-jsx";
import { tw } from "twind";
import { PageProps, RequestEvent } from "types";
import ErrorPage from "./_error.tsx";

const style = {
  button: "group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
}

export default class About extends Component<PageProps> {
  // initial props (server-side or client-side)
  static async initProps(rev: RequestEvent) {
    const { data, error } = await rev.fetchApi("/api/about");
    return { data, error };
  }

  render() {
    if (this.props.error) return <ErrorPage {...this.props.error}/>;
    return (
      <div>
        <Helmet>
          <title>{this.props.data.title}</title>
        </Helmet>
        <div class={tw${"`bg-white flex justify-center h-screen`"}}>
          <div class={tw${"`text-center mt-20 mb-10 text-gray-600`"}}>
            <h3 class={tw${"`text-5xl`"}}>
              {this.props.data.title}
            </h3>
            <p class={tw${"`text-2xl`"}}>This about from API /api/about</p>
            <p class={tw${"`mt-5`"}}>try to modify at file : /pages/about.tsx</p>
            <div class={tw${"`mt-10`"}}>
              <a target="_blank" href="https://github.com/herudi/maze" class={tw${"`${style.button}`"}}>
                Read the doc on github
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
`,
  );
  await Deno.writeTextFile(
    join(dir, "pages", "index.tsx"),
    `/** @jsx h */
import { Component, h, Helmet } from "nano-jsx";
import { tw } from "twind";
import { PageProps } from "types";

const style = {
  button: "group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
}

export default class Home extends Component<PageProps> {

  render() {
    return (
      <div>
        <Helmet>
          <title>Hello Home Page</title>
        </Helmet>
        <div class={tw${"`bg-white flex justify-center h-screen`"}}>
          <div class={tw${"`text-center mt-20 mb-10 text-gray-600`"}}>
            <h3 class={tw${"`text-5xl`"}}>
              Welcome Home
            </h3>
            <p class={tw${"`text-2xl`"}}>Maze Application Home</p>
            <p class={tw${"`mt-5`"}}>try to modify at file : /pages/index.tsx</p>
            <div class={tw${"`mt-10`"}}>
              <a target="_blank" href="https://github.com/herudi/maze" class={tw${"`${style.button}`"}}>
                Read the doc on github
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
`,
  );
  await Deno.writeTextFile(
    join(dir, "pages", "api", "about.ts"),
    `import { HttpError } from "nhttp";
import { RequestEvent } from "types";

export default async function handler(rev: RequestEvent) {
  if (rev.request.method == "GET") {
    // some code here

    return { title: "Welcome About" };
  }
  throw new HttpError(405, "method not allowed");
}
`,
  );
  await Deno.writeTextFile(
    join(dir, "@shared", "root_app.tsx"),
    `/** @jsx h */
import { h } from "nano-jsx";
import App from "../pages/_app.tsx";

function RootApp({ Page, initData, route, isServer }: any) {
  const Comp = (props: any) => <div id="__ROUTE_APP__"><Page {...props}/></div>
  return (
    <App
      Component={Comp}
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
import $1 from "../../pages/about.tsx";
export const pages: any = [
  { 
    path: '/',
    page: $0,
    methods: ($0 as any).methods
  },
  { 
    path: '/about',
    page: $1,
    methods: ($1 as any).methods
  },
];
export const tt: string = '1646808121930';
`,
  );
  await Deno.writeTextFile(
    join(dir, "@shared", "result", "apis.ts"),
    `
import { Router } from "https://deno.land/x/nhttp@1.1.10/mod.ts";
import { RequestEvent } from "${link}/core/types.ts";
import $0 from "../../pages/api/about.ts";
const api = new Router<RequestEvent>();
api.any('/about', $0);
export default api;
`,
  );
  await Deno.writeTextFile(
    join(dir, "@shared", "result", "server_pages.ts"),
    `
import $0 from "../../pages/index.tsx";
import $1 from "../../pages/about.tsx";
export const pages: any = [
  { 
    path: '/',
    page: $0,
    methods: ($0 as any).methods
  },
  { 
    path: '/about',
    page: $1,
    methods: ($1 as any).methods
  },
];
export const tt: string = '1646808121930';
`,
  );
  await Deno.writeTextFile(
    join(dir, "@shared", "http.ts"),
    `
import { initApp as baseInitApp, NHttp, ReqEvent } from "${link}/core/server.tsx";
import ErrorPage from "../pages/_error.tsx";
import RootApp from "./root_app.tsx";
import apis from "./result/apis.ts";
import style_tag from "../config/style_tag.ts";
import { pages } from "./result/pages.ts";
import { pages as server_pages } from "./result/server_pages.ts";

export const initApp = async (appCallback?: (app: NHttp<ReqEvent>) => any) => {
  return await baseInitApp({
    style_tag: style_tag,
    root: RootApp,
    error_page: ErrorPage,
    pages: pages,
    server_pages: server_pages,
    apis: apis
  }, appCallback);
};
`,
  );
  await Deno.writeTextFile(
    join(dir, "@shared", "hydrate.tsx"),
    `/** @jsx h */
import { h, hydrate } from "nano-jsx";
import { pages, tt } from "./result/pages.ts";
import RootApp from "./root_app.tsx";
import { RequestEvent } from "types";
import ErrorPage from "../pages/_error.tsx";

type ReqEvent = RequestEvent & {
  render: (elem: any, id?: string) => any;
};

type THandler = (
  rev: ReqEvent,
) => any;

function wildcard(path: string, wild: boolean, match: any) {
  const params = match.groups || {};
  if (!wild) return params;
  if (path.indexOf("*") !== -1) {
    match.shift();
    const wild = match.filter((el: any) => el !== void 0).filter((
      el: string,
    ) => el.startsWith("/")).join("").split("/");
    wild.shift();
    const ret = { ...params, wild: wild.filter((el: string) => el !== "") };
    if (path === "*" || path.indexOf("/*") !== -1) return ret;
    let wn = path.split("/").find((el: string) =>
      el.startsWith(":") && el.endsWith("*")
    );
    if (!wn) return ret;
    wn = wn.slice(1, -1);
    ret[wn] = [ret[wn]].concat(ret.wild).filter((el) => el !== "");
    delete ret.wild;
    return ret;
  }
  return params;
}

function decURI(str: string) {
  try {
    return decodeURI(str);
  } catch (_e) {
    return str;
  }
}

export default class ClassicRouter {
  routes: { path: string; regex: RegExp; wild: boolean; fn: THandler }[] = [];
  current: string | undefined;

  add(path: string, fn: THandler) {
    let wild = false;
    const str = path
      .replace(/\\/$/, "")
      .replace(/:(\\w+)(\\?)?(\\.)?/g, "$2(?<$1>[^/]+)$2$3")
      .replace(/(\\/?)\\*/g, (_, p) => {
        wild = true;
        return ${"`(${p}.*)?`"};
      })
      .replace(/\\.(?=[\\w(])/, "\\\\.");
    const regex = new RegExp(${"`^${str}/*$`"});
    this.routes.push({ path, fn, regex, wild });
    return this;
  }

  find(pathname: string) {
    let fn: any, params = {}, j = 0, el, arr = this.routes, len = arr.length;
    pathname = decURI(pathname);
    while (j < len) {
      el = arr[j];
      if (el.regex.test(pathname)) {
        const match = el.regex.exec(pathname);
        fn = el.fn;
        params = wildcard(el.path, el.wild, match);
        break;
      }
      j++;
    }
    return { fn, params };
  }

  handle() {
    const { pathname, search, origin } = window.location;
    if (this.current === pathname + search) return;
    let { fn, params } = this.find(pathname);
    this.current = pathname + search;
    const rev = {} as ReqEvent;
    rev.pathname = pathname;
    rev.url = this.current;
    rev.path = pathname;
    rev.isServer = false;
    rev.getBaseUrl = () => origin;
    rev.params = params;
    rev.fetchApi = async (pathname, opts) => {
      try {
        const res = await fetch(origin + pathname, opts);
        if (!res.ok) throw res;
        const json = await res.json();
        return { data: json, error: void 0 };
      } catch (error) {
        const json = await error.json();
        json.message = decURI(json.message);
        return { data: void 0, error: json };
      }
    };
    rev.render = (elem, id) => {
      hydrate(elem, id ? document.getElementById(id) : document.body);
    };
    if (!fn) return rev.render(<ErrorPage message="Not Found" status={404} />);
    fn(rev);
  }

  resolve() {
    const handle = () => this.handle();
    handle();
    window.addEventListener("pushstate", (e: any) => {
      e.preventDefault();
      handle();
    });
    window.addEventListener("replacestate", (e: any) => {
      e.preventDefault();
      handle();
    });
    window.addEventListener("popstate", () => {
      handle();
    });
  }
}

async function lazy(url: string) {
  const mod = (await import(url + "?v=" + tt)).default;
  return mod;
}
let first = true;
window.addEventListener("load", async () => {
  let init: any = document.getElementById("__INIT_DATA__");
  if (init) init = JSON.parse(init.textContent || "{}");
  const router = new ClassicRouter();
  for (let i = 0; i < pages.length; i++) {
    const obj: any = pages[i];
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
        if (first) {
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
            />, "__ROUTE_APP__"
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
});
  `,
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
