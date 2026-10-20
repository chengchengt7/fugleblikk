import { execFile } from "node:child_process";
import { readFile, rename, writeFile } from "node:fs/promises";
import { promisify } from "node:util";
import { enrichBirds } from "./lib/bird-media.mjs";

const path = "data/observed-birds.json";
const snapshot = JSON.parse(await readFile(path, "utf8"));
await enrichBirds(snapshot.birds, snapshot.birds);
snapshot.mediaPreparedAt = new Date().toISOString();
await writeFile(`${path}.tmp`, `${JSON.stringify(snapshot, null, 2)}\n`);
await promisify(execFile)(process.env.CUTOUT_PYTHON || "python3", [
  "data-preparation/prepare-cutouts.py",
  `${path}.tmp`,
]);
await rename(`${path}.tmp`, path);
console.log(`Saved media for ${snapshot.birds.length} birds`);
