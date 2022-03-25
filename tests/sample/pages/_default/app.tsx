/** @jsx h */
import { Fragment, h, Helmet } from "../../deps_client.ts";
import { AppProps } from "../../deps_client.ts";

export default function App({ Page, props }: AppProps) {
  return (
    <Fragment>
      <Helmet>
        <html lang="en" />
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Helmet>
      <div id="__MY_PAGE__">
        <Page {...props} />
      </div>
    </Fragment>
  );
}
