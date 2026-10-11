import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');
const csp = JSON.stringify(JSON.parse(read('../firebase.json')));
const connectSrc = (/connect-src([^;]*)/.exec(csp)?.[1] || '').trim().split(/\s+/);

describe('política de segurança (CSP)', () => {
  it('libera toda origem externa que o assistente consulta', () => {
    // Sem isso o navegador bloqueia a pesquisa em produção e o teste local (sem CSP) não percebe.
    const origins = [...new Set([...read('../js/modules/assistant-web.js').matchAll(/https:\/\/[a-z0-9.-]+/g)].map(match => match[0]))];
    expect(origins.length).toBeGreaterThan(0);
    for (const origin of origins) expect(connectSrc, origin).toContain(origin);
  });
});
