import sharp from "sharp";
import { readdir } from "node:fs/promises";
import { resolve, parse } from "node:path";

const directory = resolve(import.meta.dirname, "../assets/photos");
for (const file of (await readdir(directory)).filter((name) =>
  name.endsWith(".png"),
)) {
  const output = resolve(directory, `${parse(file).name}.webp`);
  await sharp(resolve(directory, file))
    .resize({ width: 1440, withoutEnlargement: true })
    .webp({ quality: 78, effort: 6 })
    .toFile(output);
  console.log(`Optimized ${file} -> ${parse(file).name}.webp`);
}
