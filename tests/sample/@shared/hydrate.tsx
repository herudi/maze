/** @jsx h */
import { h } from "../deps_client.ts";
import { pages } from "./result/pages.ts";
import RootApp from "./root_app.tsx";
import config from "../config.ts";
import ErrorPage from "../pages/_default/error.tsx";
import ClassicRouter from "../../../core/classic_router.tsx";

async function lazy(url: string) {
  const mod = (await import(url)).default;
  return mod;
}
const { target, onHydrate } = config as any;

window.addEventListener("load", () => {
  onHydrate();
  let first = true;
  let init: any = document.getElementById("__INIT_DATA__");
  if (init) init = JSON.parse(init.textContent || "{}");
  const router = new ClassicRouter(ErrorPage);
  for (let i = 0; i < pages.length; i++) {
    const obj: any = pages[i];
    router.add(obj.path, async (rev) => {
      rev.isFirst = first;
      try {
        const target_id = typeof target === "string" ? target : target(rev);
        if (!target_id && !first) return window.location.href = rev.url;
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
        };
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
            />,
            target_id,
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
