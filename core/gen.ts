import { join, resolve, toFileUrl, walk } from "../cli/deps.ts";
import {
  LINK,
  NHTTP_VERSION,
  STORAGE_KEY_API,
  STORAGE_KEY_PAGE,
} from "./constant.ts";
import { TRet } from "./types.ts";

const link = LINK;

export async function getListPages() {
  const dir = Deno.cwd();
  const page_list = [];
  const pages_dir = join(resolve(dir, "./pages"));
  const url = toFileUrl(pages_dir);
  const it = walk(pages_dir, {
    includeDirs: false,
    includeFiles: true,
    exts: ["tsx", "jsx", "ts", "js"],
  });
  for await (const entry of it) {
    if (entry.isFile) {
      const file = toFileUrl(entry.path).href.substring(url.href.length);
      if (!file.startsWith("/_default")) {
        if (!file.startsWith("/api/")) {
          page_list.push("./pages" + file);
        }
      }
    }
  }
  return page_list;
}

async function checkStat(arr: string[], dir: string, storage: TRet) {
  const base = join(resolve(dir, "./pages"));
  let status = false, new_entry = false;
  for (let i = 0; i < arr.length; i++) {
    const filename = arr[i];
    const path = join(resolve(base, "." + filename));
    const stat = await Deno.stat(path);
    const mtime = stat.mtime?.getTime();
    if (!storage[filename]) {
      storage[filename] = mtime;
      if (!new_entry) {
        new_entry = true;
      }
    }
    if (storage[filename] !== mtime) {
      storage[filename] = mtime;
      if (!status) {
        status = true;
      }
    }
  }
  return { storage, status, new_entry };
}

function genPath(el: string) {
  let path = el.substring(0, el.lastIndexOf("."));
  if (path.endsWith("/index")) {
    path = path.substring(0, path.lastIndexOf("/index"));
  }
  if (path === "") path = "/";
  path = "/" + path.split("/").reduce((curr, val) => {
    if (val.startsWith("[...") && val.endsWith("]")) {
      return curr + "/:" + val.slice(4, val.length - 1) + "*";
    }
    if (val.startsWith("[") && val.endsWith("]")) {
      return curr + "/:" + val.slice(1, val.length - 1);
    }
    if (!curr.startsWith("api") && curr !== "") {
      return curr + "/" + val;
    }
    return val;
  }, "");
  return path;
}

function genRoutes(arr: string[], target: string, env: string) {
  if (
    target === "page" && (env === "development" || env === "production_bundles")
  ) {
    return `
${arr.map((el, i) => `import $${i} from "../../pages${el}";`).join("\n")}
export const pages: any = [
  ${
      arr.map((el, i) => {
        const path = genPath(el);
        return `{ 
    path: '${path}',
    page: $${i},
    methods: ($${i} as any).methods,
    hydrate: ($${i} as any).hydrate
  },`;
      }).join("\n  ")
    }
];
`;
  }
  if (target === "page" && env === "production") {
    return `
export const pages = [
  ${
      arr.map((el) => {
        const path = genPath(el);
        const pathfile = el.replace(".tsx", ".js").replace(".jsx", ".js");
        return `{ 
    path: '${path}',
    page: '.${pathfile}'
  },`;
      }).join("\n  ")
    }
];
`;
  }
  return `
import { Router } from "https://deno.land/x/nhttp@${NHTTP_VERSION}/mod.ts";
import { RequestEvent } from "${link}/core/types.ts";
${arr.map((el, i) => `import $${i} from "../../pages${el}";`).join("\n")}
const api = new Router<RequestEvent>();
  ${
    arr.map((el, i) => {
      const path = genPath(el);
      return `api.any('${path}', $${i});`;
    }).join("\n  ")
  }
export default api;
`;
}

export async function genPages(
  refresh = false,
  env = "development",
  dir: string = Deno.cwd(),
) {
  try {
    dir = resolve(dir);
    const curr_stat_page = JSON.parse(
      localStorage.getItem(STORAGE_KEY_PAGE) || "{}",
    );
    const curr_stat_api = JSON.parse(
      localStorage.getItem(STORAGE_KEY_API) || "{}",
    );
    const page_list = [];
    const api_list = [];
    const pages_dir = join(resolve(dir, "./pages"));
    const url = toFileUrl(pages_dir);
    const it = walk(pages_dir, {
      includeDirs: false,
      includeFiles: true,
      exts: ["tsx", "jsx", "ts", "js"],
    });
    for await (const entry of it) {
      if (entry.isFile) {
        const file = toFileUrl(entry.path).href.substring(url.href.length);
        if (!file.startsWith("/_default")) {
          if (file.startsWith("/api/")) {
            api_list.push(file);
          } else {
            page_list.push(file);
          }
        }
      }
    }
    // return;
    const stat_page = await checkStat(page_list, dir, curr_stat_page);
    const stat_api = await checkStat(api_list, dir, curr_stat_api);

    // check page storage
    if (stat_page.new_entry || stat_page.status || refresh) {
      localStorage.setItem(STORAGE_KEY_PAGE, JSON.stringify(stat_page.storage));
    }

    // check api storage
    if (stat_api.new_entry || stat_api.status || refresh) {
      localStorage.setItem(STORAGE_KEY_API, JSON.stringify(stat_api.storage));
    }

    // save pages.ts
    if (stat_page.status || refresh) {
      const str_file = genRoutes(page_list, "page", env);
      const path = join(resolve(dir, "./.maze/result/pages.ts"));
      await Deno.writeTextFile(path, str_file);
      if (env === "production" || env === "production_bundles") {
        const str_file = genRoutes(page_list, "page", "development");
        const path = join(resolve(dir, "./.maze/result/server_pages.ts"));
        await Deno.writeTextFile(path, str_file);
      }
    }

    // save apis.ts
    if (stat_api.status || refresh) {
      const str_file = genRoutes(api_list, "api", env);
      const path = join(resolve(dir, "./.maze/result/apis.ts"));
      await Deno.writeTextFile(path, str_file);
    }
  } catch (error) {
    console.log(error);
    return error;
  }
}

export async function genRoutesWithRefresh(env: string) {
  localStorage.clear();
  return await genPages(true, env);
}
