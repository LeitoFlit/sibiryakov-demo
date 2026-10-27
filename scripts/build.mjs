import { readFile, writeFile, mkdir, cp } from 'node:fs/promises';
import { resolve, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(await readFile(resolve(root, 'build.config.json'), 'utf8'));
const destination = resolve(root, 'dist');
await mkdir(destination, { recursive: true });
async function render(file, ancestors = []) {
  if (ancestors.includes(file)) throw new Error(`Circular include: ${file}`);
  const path = resolve(root, file);
  if (!path.startsWith(root + sep)) throw new Error('Include outside project');
  const template = await readFile(path, 'utf8');
  const matches = [...template.matchAll(/\{\{>\s*([^}]+?)\s*\}\}/g)];
  let output = '', cursor = 0;
  for (const match of matches) {
    output += template.slice(cursor, match.index);
    output += await render(match[1].trim(), [...ancestors, file]);
    cursor = match.index + match[0].length;
  }
  return output + template.slice(cursor);
}
for (const page of config.pages) {
  await writeFile(resolve(destination, page), await render('src/pages/' + page));
}
for (const style of config.styles) {
  await cp(resolve(root, style.source), resolve(destination, style.output));
}
// These classic scripts share a scope. Preserve the explicit dependency order.
const scripts = await Promise.all(config.scripts.map(path => readFile(resolve(root, path), 'utf8')));
await writeFile(resolve(destination, 'app.js'), scripts.join(''));
await cp(resolve(root, 'public'), destination, { recursive: true });
console.log('Built dist/: index.html, hotel.html, styles, app.js and all assets.');
