import { Helmet, renderSSR } from "./deps_client.ts";

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
  twind_sheet: () => string,
  opts: Record<string, any> = {},
) {
  const styleTag = twind_sheet();
  const app = renderSSR(Component, opts);
  const { body, head, footer, attributes } = Helmet.SSR(app);
  return html({ ...opts, body, head, footer, styleTag, attributes });
}
