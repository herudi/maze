import { hydrate } from "https://cdn.skypack.dev/nano-jsx@v0.0.30";

function wildcard(path, wild, match) {
  const params = match.groups || {};
  if (!wild) return params;
  if (path.indexOf("*") !== -1) {
    match.shift();
    const wild = match.filter((el) => el !== void 0
    ).filter((el) => el.startsWith("/")
    ).join("").split("/");
    wild.shift();
    const ret = {
      ...params,
      wild: wild.filter((el) => el !== ""
      )
    };
    if (path === "*" || path.indexOf("/*") !== -1) return ret;
    let wn = path.split("/").find((el) => el.startsWith(":") && el.endsWith("*")
    );
    if (!wn) return ret;
    wn = wn.slice(1, -1);
    ret[wn] = [
      ret[wn]
    ].concat(ret.wild).filter((el) => el !== ""
    );
    delete ret.wild;
    return ret;
  }
  return params;
}
function decURI(str) {
  try {
    return decodeURI(str);
  } catch (_e) {
    return str;
  }
}
export default class ClassicRouter {
  routes = [];
  current;
  id;
  errorPage;
  notFoundPage;
  constructor(opts = {}) {
    this.id = opts.id || "root";
    this.errorPage = opts.errorPage || h("div", null, "Error: Something went wrong");
    this.notFoundPage = opts.notFoundPage || h("div", null, "404: Page not found");
  }
  add(path, fn) {
    let wild = false;
    const str = path.replace(/\/$/, "").replace(/:(\w+)(\?)?(\.)?/g, "$2(?<$1>[^/]+)$2$3").replace(/(\/?)\*/g, (_, p) => {
      wild = true;
      return `(${p}.*)?`;
    }).replace(/\.(?=[\w(])/, "\\.");
    const regex = new RegExp(`^${str}/*$`);
    this.routes.push({
      path,
      fn,
      regex,
      wild
    });
    return this;
  }
  find(pathname) {
    let fn, params = {}, j = 0, el, arr = this.routes, len = arr.length;
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
    return {
      fn,
      params
    };
  }
  handle() {
    const { pathname: pathname1, search, origin } = window.location;
    if (this.current === pathname1 + search) return;
    let { fn, params } = this.find(pathname1);
    this.current = pathname1 + search;
    const _id = this.id;
    const rev = {};
    rev.pathname = pathname1;
    rev.url = this.current;
    rev.path = pathname1;
    rev.isServer = false;
    rev.getBaseUrl = () => origin
      ;
    rev.params = params;
    rev.fetchApi = async (pathname, opts) => {
      try {
        const res = await fetch(origin + pathname, opts);
        if (!res.ok) throw res;
        const json = await res.json();
        return {
          data: json,
          error: void 0
        };
      } catch (error) {
        const json = await error.json();
        json.message = decURI(json.message);
        return {
          data: void 0,
          error: json
        };
      }
    };
    rev.render = (elem, id) => {
      hydrate(elem, document.getElementById(id || _id));
    };
    if (!fn) return rev.render(this.notFoundPage);
    fn(rev);
  }
  resolve() {
    const handle = () => this.handle()
      ;
    handle();
    window.addEventListener("pushstate", (e) => {
      e.preventDefault();
      handle();
    });
    window.addEventListener("replacestate", (e) => {
      e.preventDefault();
      handle();
    });
    window.addEventListener("popstate", () => {
      handle();
    });
  }
};