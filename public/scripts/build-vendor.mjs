import { resolve } from 'node:path';
import { build } from 'vite';

const root = resolve(import.meta.dirname, '..');

async function bundle(name) {
  await build({
    configFile: false,
    root,
    build: {
      emptyOutDir: false,
      minify: true,
      outDir: resolve(root, 'vendor'),
      lib: {
        entry: resolve(root, `vendor-src/${name}.js`),
        formats: ['es'],
        fileName: () => `${name}.js`
      },
      rollupOptions: { output: { codeSplitting: false } }
    }
  });
}

await bundle('firebase');
await bundle('lucide');
