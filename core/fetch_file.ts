import {
  readAll,
  readerFromStreamReader,
} from "https://deno.land/std@0.128.0/streams/conversion.ts";
import { NextFunction } from "./deps.ts";
import mime from "https://esm.sh/mime/lite?no-check";
import { ReqEvent } from "./types.ts";

export default function myFetchFile(
  fetch_url: string,
  etager: boolean,
  BUILD_ID: number,
  ssg = false,
) {
  return async (
    rev: ReqEvent,
    next: NextFunction,
  ) => {
    const { request, response } = rev;
    if (rev.path.startsWith("/static")) {
      rev.path = rev.path.replace("/static", "");
      rev.url = rev.url.replace("/static", "");
    } else return next();
    const path = rev.path;
    const isDirectory =
      path.slice((path.lastIndexOf(".") - 1 >>> 0) + 2) === "";
    let fetchFile = fetch_url + path;
    if (isDirectory && ssg) {
      if (fetchFile[fetchFile.length - 1] !== "/") {
        fetchFile += "/";
      }
      fetchFile += "index.html";
    }
    try {
      const res = await fetch(fetchFile);
      if (!res.ok || !res.body) return next();
      let status = 200;
      const etag = res.headers.get("ETag");
      const lastMod = res.headers.get("last-modified");
      if (etag) {
        if (etager) {
          response.header("ETag", etag || "");
        }
      } else if (lastMod) {
        if (etager) {
          const key = btoa(lastMod);
          response.header("Last-Modified", lastMod);
          response.header("ETag", `W/"${key}"`);
        }
      } else if (typeof Deno !== "undefined" && Deno.stat) {
        const stats = await Deno.stat(new URL(fetchFile));
        if (etager) {
          response.header(
            "Last-Modified",
            (stats.mtime || new Date(BUILD_ID)).toUTCString(),
          );
          response.header(
            "ETag",
            `W/"${stats.size}-${
              (stats.mtime || new Date(BUILD_ID)).getTime()
            }"`,
          );
        }
        if (request.headers.get("range")) {
          status = 206;
          const start = 0;
          const end = stats.size - 1;
          if (start >= stats.size || end >= stats.size) {
            response.header("Content-Range", `bytes */${stats.size}`);
            return response.status(416).send();
          }
          response.header(
            "Content-Range",
            `bytes ${start}-${end}/${stats.size}`,
          );
          response.header("Content-Length", (end - start + 1).toString());
        }
      }
      if (
        etager &&
        request.headers.get("if-none-match") === response.header("ETag")
      ) {
        return response.status(304).send();
      }
      if (request.headers.get("range")) {
        const range = response.header("Accept-Ranges") as string | undefined;
        response.header("Accept-Ranges", range || "bytes");
      }
      const ext = fetchFile.substring(fetchFile.lastIndexOf(".") + 1);
      const ct = response.header("Content-Type") as string | undefined;
      response.header("Content-Type", ct || mime.getType(ext));
      const reader = readerFromStreamReader(res.body.getReader());
      const body = await readAll(reader);
      return response.status(status).send(body);
    } catch (_e) {
      return next();
    }
  };
}
