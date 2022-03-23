import { Component, h } from "https://cdn.skypack.dev/nano-jsx@v0.0.30";
import { ReqEvent } from "./types.ts";

export const InitProps = (handler: (rev: ReqEvent) => any) => (WrappedComponent: any) => {
  return class extends Component {
    public static async initProps(rev: ReqEvent) {
      const data = await handler(rev);
      return data;
    }
    render() {
      return h(WrappedComponent, { ...this.props });
    }
  }
}