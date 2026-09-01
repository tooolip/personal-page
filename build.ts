/** Build the site into dist/, then drop in the files Pages needs verbatim. */
import { $ } from "bun";

await $`rm -rf dist`;
await $`bun build ./index.html --outdir dist --minify`;

// CNAME tells Pages which custom domain serves this build.
// .nojekyll stops Pages from ever running the file list through Jekyll.
await Bun.write("dist/CNAME", await Bun.file("CNAME").text());
await Bun.write("dist/.nojekyll", "");

console.log("built -> dist/");
