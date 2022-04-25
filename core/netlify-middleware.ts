import { Handler } from "https://deno.land/x/nhttp@1.1.11/src/types.ts";

const middleware: Handler = async (rev, next) => {
  if (rev.request.method === "GET") {
    if (rev.path.startsWith("/static")) {
      rev.path = rev.path.replace("/static", "");
      rev.url = rev.url.replace("/static", "");
      const asset = await rev.context.rewrite(rev.url);
      if (asset.status !== 404) return asset;
    }
  }
  return next();
};

export default middleware;