import { Component, h } from "./deps.ts";
import { ReqEvent } from "./types.ts";

export const InitProps = (handler: (rev: ReqEvent) => any) => (WrappedComponent: any) => {
  return (class extends Component {
    public static async initProps(rev: ReqEvent) {
      const data = await handler(rev);
      return data;
    }
    render() {
      return h(WrappedComponent, { ...this.props });
    }
  } as any);
}