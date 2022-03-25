/** @jsx h */
import { h, Helmet } from "../../deps_client.ts";

export default function ErrorPage(
  { message = "something went wrong", status = 500 }: {
    message: string;
    status: number;
  },
) {
  return (
    <div>
      <Helmet>
        <title>{status} {message}</title>
      </Helmet>
      <div style="text-align: center">
        <h1>{status}</h1>
        <p>{message}</p>
      </div>
    </div>
  );
}
