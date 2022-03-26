import { Router } from "https://deno.land/x/nhttp@1.1.11/mod.ts";
import { RequestEvent } from "../../../../core/types.ts";
import $0 from "../../pages/api/about.ts";
const api = new Router<RequestEvent>();
api.any("/about", $0);
export default api;
