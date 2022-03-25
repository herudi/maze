## Api

list api to route paths :

- /pages/api/home.ts => /api/home
- /pages/api/about.ts => /api/about
- /pages/api/about/index.ts => /api/about

list api to route paths to params :

- /pages/api/blog/[title].ts => /api/blog/:title => { title: "my-title" }
- /pages/api/blog/[...slug].ts => /api/blog/:slug* => { slug: ["my-slug-1",
  "my-slug-2"] }

Examples for /pages/api/blog/[title].ts :

```ts
import { HttpError, RequestEvent } from "nhttp";

export default async function handler(rev: RequestEvent) {
  if (rev.request.method == "GET") {
    return { title: "Welcome From Api" };
  }
  throw new HttpError(405, "method not allowed");
}
```

Example using auth middleware :

```ts
import { HttpError, NextFunction, RequestEvent } from "nhttp";

// example auth
async function my_auth(rev: RequestEvent, next: NextFunction) {
  const user = await User.find(id);
  if (!user) {
    throw new HttpError(401, "unauthorized");
  }
  rev.user = user;
  return next();
}

async function handler(rev: RequestEvent) {
  if (rev.request.method == "GET") {
    return { title: `Welcome ${rev.user.username}` };
  }
  throw new HttpError(405, "method not allowed");
}

export default [my_auth, handler];
```
