/** @jsx h */
import { h } from "../deps_client.ts";
import App from "../pages/_default/app.tsx";

function RootApp({ Page, initData, route, isServer }: any) {
  return (
    <App
      Page={Page}
      props={{ ...initData, route, isServer }}
    />
  );
}

RootApp.initProps = (App as any).initProps;
RootApp.event = (App as any).event || {};

export default RootApp;
