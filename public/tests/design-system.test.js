import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const htmlFiles = [
  '../index.html',
  '../pages/treino.html',
  '../pages/dieta.html',
  '../pages/marmitas.html',
  '../pages/perfil.html',
  '../pages/historico.html',
  '../pages/progresso.html',
  '../pages/configuracoes.html',
  '../pages/evolucao.html',
  '../pages/dados-pessoais.html',
  '../pages/login.html',
  '../pages/admin.html',
];

describe('contrato visual entre páginas', () => {
  it.each(htmlFiles)('%s carrega o tema antes das folhas de estilo', async file => {
    const html = await readFile(new URL(file, import.meta.url), 'utf8');
    const bootstrapIndex = html.indexOf('src="/theme-bootstrap.js"');
    const styleIndex = html.indexOf('css/style.css');
    expect(bootstrapIndex).toBeGreaterThan(-1);
    expect(styleIndex).toBeGreaterThan(bootstrapIndex);
    expect(html).toContain('<title>Mol</title>');
    const viewport = html.match(/<meta\s+name=["']viewport["']\s+content=["']([^"']+)["']/i)?.[1] || '';
    expect(viewport).toContain('width=device-width');
    expect(viewport).toContain('initial-scale=1');
    expect(viewport).toContain('viewport-fit=cover');
    expect(viewport).not.toContain('maximum-scale');
    expect(viewport).not.toContain('user-scalable');
  });

  it('as regras visuais dependem do tema no html, disponível na primeira pintura', async () => {
    const css = await readFile(new URL('../css/style.css', import.meta.url), 'utf8');
    expect(css).not.toContain('body[data-theme="light"]');
    expect(css).toContain('html[data-theme="light"] body');
    expect(css).toContain('prefers-reduced-motion: reduce');
    expect(css).toContain('html[data-reduce-motion="true"]');
    expect(css.match(/!important/g)?.length || 0).toBeLessThanOrEqual(100);
  });
});
