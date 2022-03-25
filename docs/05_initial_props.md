## Initial Props

Work for server-side and client-side.

## Data Fetching

```jsx
/** @jsx h */
import { Component, h } from "nano-jsx";
import { PageProps, InitProps } from "maze";

@InitProps(async () => {
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

## Fetch from internal api

```jsx
/** @jsx h */
import { Component, h } from "nano-jsx";
import { PageProps, InitProps } from "maze";

@InitProps(async ({ fetchApi }) => {
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
