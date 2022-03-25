## Pages

list pages to route paths :

- /pages/index.tsx => /
- /pages/about.tsx => /about
- /pages/about/index.tsx => /about

list pages to route paths to params :

- /pages/blog/[title].tsx => /blog/:title => { title: "my-title" }
- /pages/blog/[...slug].tsx => /blog/:slug* => { slug: ["my-slug-1",
  "my-slug-2"] }

Examples for /pages/blog/[title].tsx :

```jsx
/** @jsx h */
import { Component, h } from "nano-jsx";
import { PageProps } from "maze";

export default class BlogTitle extends Component<PageProps> {
  render() {
    const route = this.props.route;
    return <h1>{route.params.title}</h1>;
  }
}
```
