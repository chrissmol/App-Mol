import { describe, expect, it, vi } from 'vitest';
import { authErrorMessage, LEGAL_DOCUMENTS, withTimeout } from '../js/modules/login-utils.js';

describe('login', () => {
  it('traduz erros conhecidos e preserva um fallback seguro', () => {
    expect(authErrorMessage({ code: 'auth/popup-blocked' })).toContain('bloqueou');
    expect(authErrorMessage({ code: 'auth/unauthorized-domain' })).toContain('autorizado');
    expect(authErrorMessage({ code: 'desconhecido' })).toContain('Não foi possível');
  });

  it('limita autenticações que não respondem', async () => {
    vi.useFakeTimers();
    const result = withTimeout(new Promise(() => {}), 100);
    const assertion = expect(result).rejects.toMatchObject({ code: 'auth/timeout' });
    await vi.advanceTimersByTimeAsync(100);
    await assertion;
    vi.useRealTimers();
  });

  it('mantém documentos jurídicos estruturados', () => {
    expect(LEGAL_DOCUMENTS.terms.sections.length).toBeGreaterThanOrEqual(8);
    expect(LEGAL_DOCUMENTS.privacy.sections.length).toBeGreaterThanOrEqual(8);
  });
});
