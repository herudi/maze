import { Handler } from "https://deno.land/x/nhttp@1.1.11/src/types.ts";
import { RequestEvent as BRequestEvent } from "https://deno.land/x/nhttp@1.1.11/src/request_event.ts";

// deno-lint-ignore no-explicit-any
export type TRet = any;
export type TObject = { [k: string]: TRet };
export type RequestEvent = BRequestEvent & {
  getBaseUrl: () => string;
  pathname: string;
  isServer: boolean;
  isFirst: boolean;
  /**
   * Fetch data from internal API.
   * @example
   * const { data, error } = await fetchApi("/api/home");
   */
  fetchApi: (pathname: string, options?: RequestInit) => Promise<TRet>;
};

export type ReqEvent = RequestEvent & {
  render: (
    Page: TRet,
    props: { path: string; initData?: TRet },
  ) => Record<string, TRet>;
};

export type RouteProps = {
  url: string;
  pathname: string;
  path: string;
  params: Record<string, TRet>;
  [k: string]: TRet;
};

export type PageProps = {
  route: RouteProps;
  isServer: boolean;
  [k: string]: TRet;
};

export type AppProps = {
  Page: TRet;
  props: PageProps;
};

export type Middlewares<
  Rev extends RequestEvent = RequestEvent,
> = Handler<Rev> | Handler<Rev>[];

export type TOptionsInitApp = {
  root: TRet;
  error_page: TRet;
  pages: Record<string, TRet>[];
  server_pages: Record<string, TRet>[];
  apis: TRet;
  meta_url?: string;
  build_id: string;
  ssr: (
    Component: TRet,
    mazeScript: string,
    opts?: Record<string, TRet>,
  ) => TRet;
  static_config?: (rev: ReqEvent) => void;
  etag?: boolean;
  cache_control?: string;
  [k: string]: TRet;
};

export type MazeConfig = {
  /**
   * Cache control default undefined or no cache (production only).
   */
  cache_control?: string;
  /**
   * Etag headers. default is true.
   */
  etag?: boolean;
  /**
   * Zone routes
   * @example
   * // Route only add path startsWith /dashboard.
   * zones: ["/dashboard"]
   */
  zones?: string[];
  /**
   * Build config.
   */
  build?: Record<string, TRet>;
};
