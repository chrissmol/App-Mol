import { readFile } from 'node:fs/promises';

const css = await readFile(new URL('../css/style.css', import.meta.url), 'utf8');
const importantCount = (css.match(/!important/g) || []).length;
const mediaQueries = (css.match(/@media\s*\([^{}]+\)/g) || []).length;
const forbiddenDesktopTabletMix = /@media\s*\([^)]*min-width:\s*1024px[^)]*hover:\s*hover[^)]*pointer:\s*fine/.test(css);

const failures = [];
if (importantCount > 94) failures.push(`!important acima do limite: ${importantCount}/94`);
if (mediaQueries > 45) failures.push(`muitas media queries: ${mediaQueries}/45`);
if (forbiddenDesktopTabletMix) failures.push('breakpoint desktop deve exigir largura minima de 1200px');

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`CSS audit OK: ${importantCount} !important, ${mediaQueries} media queries`);
