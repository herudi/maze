import { Component, h } from "./nano_jsx.ts";
import { ReqEvent, TRet } from "./types.ts";

type TInitPage = {
  props?: (rev: ReqEvent) => TRet;
  hydrate?: boolean;
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
