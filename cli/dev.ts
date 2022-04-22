import { LINK, STORAGE_KEY_API, STORAGE_KEY_PAGE } from "../core/constant.ts";
import { genRoutesWithRefresh } from "../core/gen.ts";
import { join, resolve, toFileUrl } from "./deps.ts";

export default async function dev_server() {
  const reload = Deno.args[1] ? " " + Deno.args[1] : "";
  const dir = Deno.cwd();
  const sleep = (ms = 100) => new Promise((ok) => setTimeout(ok, ms));
  try {
    await Deno.writeTextFile(
      join(resolve(dir, "./@shared/result/constant.ts")),
      `export const BUILD_ID: string = '${Date.now()}';
export const ENV: string = 'development';`,
    );
  } catch (_e) { /* noop */ }
  try {
    await Deno.writeTextFile(
      join(resolve(dir, "./@shared/result/server_pages.ts")),
      `export const pages: any = [];`,
    );
  } catch (_e) { /* noop */ }
  await genRoutesWithRefresh("development");
  try {
    let maze_file = await Deno.readTextFile(
      join(resolve(dir, "./@shared/maze.ts")),
    );
    if (maze_file.includes(`${LINK}/core/server_prod.ts`)) {
      maze_file = maze_file.replace(
        `${LINK}/core/server_prod.ts`,
        `${LINK}/core/server.ts`,
      );
      await Deno.writeTextFile(
        join(resolve(dir, "./@shared/maze.ts")),
        maze_file,
      );
    }
  } catch (_e) { /* noop */ }
  await sleep(1000);
  const CMD = Deno.build.os === "windows" ? "cmd /c " : "";
  const script = CMD +
    `deno run -A --watch --no-check --unstable${reload} ./server.ts --dev`;
  const p = Deno.run({ cmd: script.split(" ") });
  const pages_dir = join(resolve(dir, "./pages"));
  const url = toFileUrl(pages_dir);
  const getFilePathUrl = (entry: string) =>
    toFileUrl(resolve(entry)).href.substring(url.href.length);

  const watcher = Deno.watchFs(pages_dir + "/", { recursive: true });
  let stts = false;
  async function watch(_watch: Deno.FsWatcher) {
    for await (const { paths, kind } of _watch) {
      if (["remove", "modify"].includes(kind)) {
        if (!stts) {
          stts = true;
          (async () => {
            if (kind === "remove") {
              await genRoutesWithRefresh("development");
            } else if (kind === "modify") {
              let status_page = false, status_api = false;
              if (localStorage.getItem(STORAGE_KEY_PAGE)) {
                const obj = JSON.parse(
                  localStorage.getItem(STORAGE_KEY_PAGE) || "{}",
                );
                for (let i = 0; i < paths.length; i++) {
                  const path = getFilePathUrl(paths[i]);
                  if (!obj[path]) {
                    status_page = true;
                    break;
                  }
                }
              }
              if (localStorage.getItem(STORAGE_KEY_API)) {
                const obj = JSON.parse(
                  localStorage.getItem(STORAGE_KEY_API) || "{}",
                );
                for (let i = 0; i < paths.length; i++) {
                  const path = getFilePathUrl(paths[i]);
                  if (!obj[path]) {
                    status_api = true;
                    break;
                  }
                }
              }
              if (status_page || status_api) {
                await genRoutesWithRefresh("development");
              }
            }
            await sleep(1000);
            stts = false;
          })();
        }
      }
    }
  }

  await watch(watcher);

  await p.status();
}
