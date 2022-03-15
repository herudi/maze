import {
  readAll,
  readerFromStreamReader,
} from "https://deno.land/std@0.128.0/streams/conversion.ts";
import { NextFunction, RequestEvent } from "./deps.ts";
import mime from "https://esm.sh/mime/lite?no-check";

const now = new Date();

export default function fetchFile(fetch_url: string, ssg = false) {
  return async (
    { request, response, url }: RequestEvent,
    next: NextFunction,
  ) => {
    let isDirectory = url.slice((url.lastIndexOf(".") - 1 >>> 0) + 2) === "";
    let fetchFile = fetch_url + url;
    if (isDirectory && ssg) {
      if (fetchFile[fetchFile.length - 1] !== "/") {
        fetchFile += "/";
      }
      fetchFile += "index.html";
    }
    try {
      const res = await fetch(fetchFile);
      if (!res.ok || !res.body) return next();
      const etag = res.headers.get("ETag");
      const lastMod = res.headers.get("last-modified");
      let status = 200;
      if (etag) {
        response.header("ETag", etag || "");
      } else if (lastMod) {
        const key = btoa(lastMod);
        response.header("Last-Modified", lastMod);
        response.header("ETag", `W/"${key}"`);
      } else if (typeof Deno !== "undefined" && Deno.stat) {
        const stats = await Deno.stat(new URL(fetchFile));
        response.header("Last-Modified", (stats.mtime || now).toUTCString());
        response.header(
          "ETag",
          `W/"${stats.size}-${(stats.mtime || now).getTime()}"`,
        );
        if (request.headers.get("range")) {
          status = 206;
          let start = 0;
          let end = stats.size - 1;
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
      if (request.headers.get("if-none-match") === response.header("ETag")) {
        return response.status(304).send();
      }
      if (request.headers.get("range")) {
        response.header("Accept-Ranges", "bytes");
      }
      const ext = fetchFile.substring(fetchFile.lastIndexOf(".") + 1);
      response.header("Content-Type", mime.getType(ext));
      const reader = readerFromStreamReader(res.body.getReader());
      const body = await readAll(reader);
      return response.status(status).send(body);
    } catch (_e) {
      return next();
    }
  };
}
