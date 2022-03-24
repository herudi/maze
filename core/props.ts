import { Component, h } from "./nano_jsx.ts";
import { ReqEvent } from "./types.ts";

export const InitProps = (
  handler: (rev: ReqEvent) => any,
  allowMethods: string[] = ["GET"],
) =>
  (WrappedComponent: any) => {
    return (class extends Component {
      static async initProps(rev: ReqEvent) {
        const data = await handler(rev);
        return data;
      }
      static methods = allowMethods;
      render() {
        return h(WrappedComponent, { ...this.props });
      }
    } as any);
  };
