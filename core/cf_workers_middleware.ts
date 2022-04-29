import { Handler } from "https://deno.land/x/nhttp@1.1.11/src/types.ts";
import {
  getAssetFromKV,
  mapRequestToAsset,
} from "https://esm.sh/@cloudflare/kv-asset-handler";
import { ReqEvent, TRet } from "./types.ts";

type TConfig = {
  browserTTL?: number;
  edgeTTL?: number;
  bypassCache?: boolean;
};

function handlePrefix(prefix: string) {
  return (request: Request) => {
    const defaultAssetKey = mapRequestToAsset(request);
    const url = new URL(defaultAssetKey.url);
    url.pathname = url.pathname.replace(prefix, "/");
    return new Request(url.toString(), defaultAssetKey);
  };
}

export default function middleware(config?: TConfig): Handler<ReqEvent> {
  return async (rev, next) => {
    if (rev.request.method === "GET") {
      if (rev.path.startsWith("/static")) {
        rev.path = rev.path.replace("/static", "");
        rev.url = rev.url.replace("/static", "");
        try {
          const cacheControl = (config || {
            browserTTL: null,
            edgeTTL: 2 * 60 * 60 * 24,
            bypassCache: false,
          }) as TRet;
          const page = await getAssetFromKV(rev as TRet, {
            mapRequestToAsset: handlePrefix("/static"),
            cacheControl,
          });
          const response = new Response(page.body, page);
          response.headers.set("X-XSS-Protection", "1; mode=block");
          response.headers.set("X-Content-Type-Options", "nosniff");
          response.headers.set("X-Frame-Options", "DENY");
          response.headers.set("Referrer-Policy", "unsafe-url");
          response.headers.set("Feature-Policy", "none");
          return response;
        } catch (_e) {
          console.log(_e.message);
        }
      }
    }
    return next();
  };
}
