export {
  join,
  resolve,
  toFileUrl,
} from "https://deno.land/std@0.132.0/path/mod.ts";
export { walk } from "https://deno.land/std@0.132.0/fs/walk.ts";
export function isExist(pathfile: string) {
  try {
    Deno.readTextFileSync(pathfile);
    return true;
  } catch (_e) {
    return false;
  }
}
