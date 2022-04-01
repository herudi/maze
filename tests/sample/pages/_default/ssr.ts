import { Helmet, renderSSR } from "../../deps_client.ts";

export default function ssr(
  Component: any,
  mazeScript: string,
  opts: Record<string, any> = {},
) {
  const app = renderSSR(Component, opts);
  const { body, head, footer, attributes } = Helmet.SSR(app);
  return `<!DOCTYPE html>
<html ${attributes.html.toString()}>
  <head>
    ${head.join("\n    ")}
  </head>
  <body ${attributes.body.toString()}>
    ${body}
    ${footer.join("")}${mazeScript}
  </body>
</html>`;
}
