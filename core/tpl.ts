// original from https://crux.land/nanossr@0.0.1
// include maze core script

import { Helmet, renderSSR } from "./deps_client.ts";
import { setup } from "https://cdn.skypack.dev/twind@0.16.16";
import {
  getStyleTag,
  virtualSheet,
} from "https://cdn.skypack.dev/twind@0.16.16/sheets";

let SHEET_SINGLETON: any = null;
function sheet(twOptions = {}) {
  return SHEET_SINGLETON ?? (SHEET_SINGLETON = setupSheet(twOptions));
}

// Setup TW sheet singleton
function setupSheet(twOptions: Record<string, any>) {
  const sheet = virtualSheet();
  setup({ ...twOptions, sheet });
  return sheet;
}

const html = (
  { body, attributes, head, footer, styleTag, clientScript, env, initData, tt }:
    any,
) => (`<!DOCTYPE html>
<html ${attributes.html.toString()}>
  <head>
    ${head.join("\n    ")}
    ${styleTag}
  </head>
  ${
  attributes.body.size === 0 ? "<body>" : `<body ${attributes.body.toString()}>`
}
    ${body}
    ${
  initData !== void 0
    ? `<script id="__INIT_DATA__" type="application/json">${
      JSON.stringify(initData)
    }</script>`
    : ""
}${footer.join("\n    ")}${
  env === "development" ? '<script src="/js/refresh.js"></script>' : ""
}${
  clientScript
    ? `<script type="module" src="${clientScript + "?v=" + tt}"></script>`
    : ""
}
  </body>
<html>
`);

export function jsx(
  Component: any,
  twOptions: Record<string, any>,
  options: Record<string, any> = {},
  ssrOptions: Record<string, any> = {},
) {
  sheet(twOptions ?? {}).reset();
  const app = renderSSR(Component, ssrOptions);
  const { body, head, footer, attributes } = Helmet.SSR(app);
  const styleTag = getStyleTag(sheet());
  return html({ ...options, body, head, footer, styleTag, attributes });
}
