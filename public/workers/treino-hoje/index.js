import { resumo } from './summary.js';

// GET /treino-hoje  (Authorization: Bearer <API_TOKEN>) -> JSON curto do treino de hoje (fuso de São Paulo).
// Secrets: API_TOKEN, SA_JSON (conta de serviço Firebase, só leitura), MOL_UID. Var: PROJECT_ID.
const b64 = b => btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const enc = s => b64(new TextEncoder().encode(s));

async function accessToken(sa) {
  const now = Math.floor(Date.now() / 1000);
  const head = enc(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const body = enc(JSON.stringify({ iss: sa.client_email, scope: 'https://www.googleapis.com/auth/datastore', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 }));
  const pem = sa.private_key.replace(/-----[^-]+-----|\s/g, '');
  const key = await crypto.subtle.importKey('pkcs8', Uint8Array.from(atob(pem), c => c.charCodeAt(0)), { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const sig = b64(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(`${head}.${body}`)));
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${head}.${body}.${sig}` }) });
  if (!r.ok) throw new Error('auth');
  return (await r.json()).access_token;
}

const val = v => v == null ? null : 'stringValue' in v ? v.stringValue : 'timestampValue' in v ? v.timestampValue : 'integerValue' in v ? +v.integerValue : 'doubleValue' in v ? v.doubleValue : 'booleanValue' in v ? v.booleanValue : 'arrayValue' in v ? (v.arrayValue.values || []).map(val) : 'mapValue' in v ? Object.fromEntries(Object.entries(v.mapValue.fields || {}).map(([k, x]) => [k, val(x)])) : null;

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname !== '/treino-hoje' || req.method !== 'GET') return new Response('not found', { status: 404 });
    if (req.headers.get('Authorization') !== `Bearer ${env.API_TOKEN}`) return new Response('unauthorized', { status: 401 });
    // São Paulo é UTC-3 sem horário de verão: meia-noite local = 03:00Z.
    const dia = new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);
    const inicio = `${dia}T03:00:00Z`;
    try {
      const token = await accessToken(JSON.parse(env.SA_JSON));
      const r = await fetch(`https://firestore.googleapis.com/v1/projects/${env.PROJECT_ID}/databases/(default)/documents:runQuery`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ structuredQuery: { from: [{ collectionId: 'sessoes' }], limit: 20, where: { compositeFilter: { op: 'AND', filters: [
          { fieldFilter: { field: { fieldPath: 'userId' }, op: 'EQUAL', value: { stringValue: env.MOL_UID } } },
          { fieldFilter: { field: { fieldPath: 'concluidoEm' }, op: 'GREATER_THAN_OR_EQUAL', value: { timestampValue: inicio } } }] } } } })
      });
      if (!r.ok) throw new Error('firestore');
      const sessoes = (await r.json()).filter(x => x.document).map(x => val({ mapValue: { fields: x.document.fields } }));
      return Response.json(resumo(sessoes), { headers: { 'Cache-Control': 'max-age=60' } });
    } catch {
      return Response.json({ erro: true }, { status: 502 });
    }
  }
};
