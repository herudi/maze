/** @jsx h */
import { Component, h } from "../deps_client.ts";
import { InitProps, PageProps } from "../deps_client.ts";

@InitProps(async ({ fetchApi }) => {
  const { data, error } = await fetchApi("/api/about");
  return { data, error };
})
export default class About extends Component<PageProps> {
  render() {
    return <h1>{this.props.data.title}</h1>;
  }
}
