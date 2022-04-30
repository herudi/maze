import { NHttp, RequestEvent as BRequestEvent } from "./deps.ts";

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
    hydrate?: boolean,
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
   * Etag headers. default is true (production only).
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
  /**
   * Build server config.
   */
  build_server?: Record<string, TRet>;
  /**
   * PORT number
   */
  port?: number;
  /**
   * PORT number
   */
  server?: (app: NHttp<ReqEvent>) => void;
};
