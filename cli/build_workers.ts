import { denoPlugin, esbuild, join, resolve, toFileUrl } from "./deps.ts";

const dir = Deno.cwd();

try {
  await esbuild.build({
    minify: true,
    treeShaking: true,
    platform: "neutral",
    bundle: true,
    plugins: [denoPlugin()],
    entryPoints: [
      toFileUrl(join(resolve(dir, "./cloudflare/worker.ts"))).href,
    ],
    outfile: join(resolve(dir, `./cloudflare/worker.js`)),
  });
  esbuild.stop();
} catch (error) {
  console.log(error);
  esbuild.stop();
}
