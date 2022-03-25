import { superdeno } from "./deps.ts";
import maze from "./sample/@shared/maze.ts";

const mock: (request: Request) => any = await new Promise((ok) => {
  maze(import.meta.url, {
    appCallback: (app) => {
      ok((request: Request) => app.handleEvent({ request }));
    },
  });
});

Deno.test("GET /", async () => {
  await superdeno(mock)
    .get("/")
    .expect(200)
    .expect("Content-Type", /html/)
    .expect(/Welcome Home/);
});

Deno.test("GET /about", async () => {
  await superdeno(mock)
    .get("/about")
    .expect(200)
    .expect("Content-Type", /html/)
    .expect(/Welcome About From Api/);
});

Deno.test("GET /noop not found", async () => {
  await superdeno(mock)
    .get("/noop")
    .expect(404)
    .expect("Content-Type", /html/);
});

Deno.test("POST /api/about method not allowed 405", async () => {
  await superdeno(mock)
    .post("/api/about")
    .expect(405)
    .expect("Content-Type", /json/);
});
