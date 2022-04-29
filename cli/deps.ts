export {
  join,
  resolve,
  toFileUrl,
} from "https://deno.land/std@0.132.0/path/mod.ts";
export { walk } from "https://deno.land/std@0.132.0/fs/walk.ts";
export { default as esbuild } from "https://deno.land/x/esbuild@v0.14.25/mod.js";
export { denoPlugin } from "https://deno.land/x/esbuild_deno_loader@0.4.1/mod.ts";
export function isExist(pathfile: string) {
  try {
    Deno.readTextFileSync(pathfile);
    return true;
  } catch (_e) {
    return false;
  }
}
