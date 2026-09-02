import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const htmlFiles = [
  '../index.html',
  '../pages/treino.html',
  '../pages/dieta.html',
  '../pages/perfil.html',
  '../pages/historico.html',
  '../pages/progresso.html',
  '../pages/configuracoes.html',
  '../pages/evolucao.html',
  '../pages/dados-pessoais.html',
  '../pages/login.html',
];

describe('contrato visual entre páginas', () => {
  it.each(htmlFiles)('%s carrega o tema antes das folhas de estilo', async file => {
    const html = await readFile(new URL(file, import.meta.url), 'utf8');
    const bootstrapIndex = html.indexOf('src="/theme-bootstrap.js"');
    const styleIndex = html.indexOf('css/style.css');
    expect(bootstrapIndex).toBeGreaterThan(-1);
    expect(styleIndex).toBeGreaterThan(bootstrapIndex);
    expect(html).toContain('<title>Mol</title>');
    expect(html).toContain('user-scalable=no');
  });

  it('as regras visuais dependem do tema no html, disponível na primeira pintura', async () => {
    const css = await readFile(new URL('../css/style.css', import.meta.url), 'utf8');
    expect(css).not.toContain('body[data-theme="light"]');
    expect(css).toContain('html[data-theme="light"] body');
    expect(css).toContain('prefers-reduced-motion: reduce');
    expect(css).toContain('html[data-reduce-motion="true"]');
    expect(css.match(/!important/g)?.length || 0).toBeLessThanOrEqual(60);
  });
});
