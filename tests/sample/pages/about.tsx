/** @jsx h */
import { Component, h } from "../deps_client.ts";
import { InitPage, PageProps } from "../deps_client.ts";

@InitPage({
  props: async ({ fetchApi }) => {
    const { data, error } = await fetchApi("/api/about");
    return { data, error };
  },
})
export default class About extends Component<PageProps> {
  render() {
    return <h1>{this.props.data.title}</h1>;
  }
}
