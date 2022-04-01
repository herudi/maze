## Initial Props

Work for server-side and client-side.

## Data Fetching

```jsx
/** @jsx h */
import { Component, h } from "nano-jsx";
import { PageProps, InitProps } from "maze";

// decorator
@InitProps(async (rev) => {
  const res = await fetch("http://..../items");
  const items = await res.json();
  return { items };
})
class Home extends Component<PageProps> {
  render() {
    return <ul>{this.props.items.map((el) => <li>{el}</li>)}</ul>;
  }
}

export default Home;
```

Example in functional

```jsx
/** @jsx h */
import { Component, h } from "nano-jsx";
import { PageProps, RequestEvent } from "maze";

function Home() {
  return <ul>{this.props.items.map((el) => <li>{el}</li>)}</ul>;
}

Home.initProps = async (rev: RequestEvent) => {
  const res = await fetch("http://..../items");
  const items = await res.json();
  return { items };
}

export default Home;
```

## Fetch from internal api

```jsx
/** @jsx h */
import { Component, h } from "nano-jsx";
import { PageProps, InitProps } from "maze";

@InitProps(async ({ fetchApi }) => {
  // don't use window.fetch. use rev.fetchApi instead.
  const { data, error } = await fetchApi("/api/home");
  return { data, error };
})
class Home extends Component<PageProps> {
  render() {
    if (this.props.error) return <h1>error</h1>;
    return <ul>{this.props.data.map((el) => <li>{el}</li>)}</ul>;
  }
}

export default Home;
```
