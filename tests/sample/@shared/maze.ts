import core from "./core.ts";
import { NHttp, ReqEvent } from "../../../core/server.ts";

export default (static_url?: string, {
  routerCallback,
  staticConfig,
}: {
  routerCallback?: (router: NHttp<ReqEvent>) => any;
  staticConfig?: (rev: ReqEvent) => void;
} = {}) => core(static_url, { routerCallback, staticConfig });
