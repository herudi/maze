## Initial Page

Initial Page or `InitPage` is simple decorator config for page.

### Type InitPage

```ts
type TInitPage = {
  /**
   * Initial props for page.
   */
  props?: (rev: ReqEvent) => TRet;
  /**
   * Allow methods default to ["GET"].
   */
  methods?: string[];
  /**
   * Optional rehydration default to true. if false, can't send client script.
   */
  hydrate?: boolean;
};
```

### Example With Class

```jsx
/** @jsx h */
import { Component, h } from "nano-jsx";
import { PageProps, InitPage } from "maze";

// decorator
@InitPage({

  // initial props default to undefined
  props: async (rev) => {...},

  // allow methods default to ["GET"].
  methods: ["GET", "POST"],

  // optional rehydration default to true.
  hydrate: true
  
})
class Home extends Component<PageProps> {...}

export default Home;
```

### Example With Functional

```jsx
/** @jsx h */
import { Component, h } from "nano-jsx";
import { PageProps, RequestEvent } from "maze";

function Home() {...}

// initial props default to undefined
Home.initProps = async (rev: RequestEvent) => {...}

// allow methods default to ["GET"].
Home.methods = ["GET", "POST"];

// optional rehydration default to true.
Home.hydrate = true;

export default Home;
```
