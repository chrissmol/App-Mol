import { readFile } from 'node:fs/promises';
import { describe, expect, it, vi } from 'vitest';
import { subscribeAfterAuthReady } from '../js/utils/auth-state.js';

function deferred() {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
}

describe('restauração da sessão', () => {
  it('não observa um estado nulo antes da persistência estar pronta', async () => {
    const ready = deferred();
    const callback = vi.fn();
    const subscribe = vi.fn(() => vi.fn());
    subscribeAfterAuthReady(ready.promise, subscribe, callback);
    await Promise.resolve();
    expect(subscribe).not.toHaveBeenCalled();
    ready.resolve();
    await ready.promise;
    await Promise.resolve();
    expect(subscribe).toHaveBeenCalledWith(callback);
  });

  it('cancela com segurança antes ou depois da assinatura', async () => {
    const ready = deferred();
    const firebaseUnsubscribe = vi.fn();
    const subscribe = vi.fn(() => firebaseUnsubscribe);
    const stopBefore = subscribeAfterAuthReady(ready.promise, subscribe, vi.fn());
    stopBefore();
    ready.resolve();
    await ready.promise;
    await Promise.resolve();
    expect(subscribe).not.toHaveBeenCalled();

    const stopAfter = subscribeAfterAuthReady(Promise.resolve(), subscribe, vi.fn());
    await Promise.resolve();
    await Promise.resolve();
    stopAfter();
    expect(firebaseUnsubscribe).toHaveBeenCalledOnce();
  });

  it('inicializa a persistência antes de expor o estado do Auth', async () => {
    const source = await readFile(new URL('../js/config/firebase-config.js', import.meta.url), 'utf8');
    expect(source).toContain('initializeAuth(app');
    expect(source).toContain('indexedDBLocalPersistence');
    expect(source).toContain('browserLocalPersistence');
    expect(source).toContain('browserSessionPersistence');
    expect(source).toContain('auth.authStateReady()');
    expect(source).not.toContain('setPersistence(');
  });});