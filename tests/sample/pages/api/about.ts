import { HttpError } from "../../deps_server.ts";
import { RequestEvent } from "../../../../core/types.ts";

export default async function handler(rev: RequestEvent) {
  if (rev.request.method == "GET") {
    return { title: "Welcome About From Api" };
  }
  throw new HttpError(405, "method not allowed");
}
