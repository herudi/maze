import { Component, h } from "./nano_jsx.ts";
import { ReqEvent, TRet } from "./types.ts";

type TInitPage = {
  /**
   * Initial props for page.
   */
  props?: (rev: ReqEvent) => TRet;
  /**
   * Optional rehydration default to true. if false, can't send client script.
   */
  hydrate?: boolean;
  /**
   * Allow methods default to ["GET"].
   */
  methods?: string[];
};

export const InitPage = ({
  props,
  hydrate,
  methods,
}: TInitPage) =>
  (WrappedComponent: TRet) => {
    return (class extends Component {
      static hydrate = hydrate;
      static initProps = props;
      static methods = methods;
      render() {
        return h(WrappedComponent, { ...this.props });
      }
    } as TRet);
  };
