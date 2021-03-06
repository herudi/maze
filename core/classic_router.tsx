import { h, hydrate } from "./nano_jsx.ts";
import { RequestEvent, TRet } from "./types.ts";

type ReqEvent = RequestEvent & {
  render: (elem: TRet, id?: string) => TRet;
};

type THandler = (
  rev: ReqEvent,
) => TRet;

function wildcard(path: string, wild: boolean, match: TRet) {
  const params = match.groups || {};
  if (!wild) return params;
  if (path.indexOf("*") !== -1) {
    match.shift();
    const wild = match.filter((el: TRet) => el !== void 0).filter((
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
  ErrorPage: TRet;
  render: (elem: TRet, id?: string) => TRet;
  is_reload = false;
  constructor(ErrorPage: TRet, render?: (elem: TRet, id?: string) => TRet) {
    this.ErrorPage = ErrorPage;
    this.render = render || ((elem, id) => {
      hydrate(elem, id ? document.getElementById(id) : document.body);
    });
  }

  buildPages(path: string, zones: string[], pages: TRet) {
    this.is_reload = zones.length !== 0;
    if (zones.length === 0) return pages;
    let _pages = pages, is_zone = false;
    for (let i = 0; i < zones.length; i++) {
      const zone = zones[i];
      if (path.startsWith(zone)) {
        _pages = pages.filter((el: TRet) => el.path.startsWith(zone));
        is_zone = true;
      }
    }
    if (!is_zone) {
      _pages = pages.filter((el: TRet) =>
        !zones.some((str) => el.path.startsWith(str))
      );
    }
    return _pages;
  }

  add(path: string, fn: THandler) {
    let wild = false;
    const str = path
      .replace(/\/$/, "")
      .replace(/:(\w+)(\?)?(\.)?/g, "$2(?<$1>[^/]+)$2$3")
      .replace(/(\/?)\*/g, (_, p) => {
        wild = true;
        return `(${p}.*)?`;
      })
      .replace(/\.(?=[\w(])/, "\\.");
    const regex = new RegExp(`^${str}/*$`);
    this.routes.push({ path, fn, regex, wild });
    return this;
  }

  find(pathname: string) {
    let fn: TRet, params = {}, j = 0, el;
    const arr = this.routes, len = arr.length;
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
    const { fn, params } = this.find(pathname);
    const ErrorPage = this.ErrorPage;
    const isReload = this.is_reload;
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
    rev.render = this.render;
    if (!fn) {
      if (isReload) {
        return location.reload();
      }
      return rev.render(<ErrorPage message="Not Found" status={404} />);
    }
    fn(rev);
  }

  resolve() {
    const handle = () => this.handle();
    handle();

    // deno-lint-ignore no-window-prefix
    window.addEventListener("pushstate", (e: TRet) => {
      e.preventDefault();
      handle();
    });

    // deno-lint-ignore no-window-prefix
    window.addEventListener("replacestate", (e: TRet) => {
      e.preventDefault();
      handle();
    });

    // deno-lint-ignore no-window-prefix
    window.addEventListener("popstate", () => {
      handle();
    });
  }
}
