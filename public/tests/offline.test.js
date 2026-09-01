import { JSDOM } from 'jsdom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { connectivityState, isTrustedDevice, setTrustedDevice } from '../js/utils/offline.js';

afterEach(() => vi.unstubAllGlobals());

describe('modo offline', () => {
  it('mantém cache persistente desativado por padrão e salva a escolha localmente', () => {
    const dom = new JSDOM('<!doctype html>', { url: 'https://mol.test/' });
    vi.stubGlobal('localStorage', dom.window.localStorage);
    expect(isTrustedDevice()).toBe(false);
    expect(setTrustedDevice(true)).toBe(true);
    expect(isTrustedDevice()).toBe(true);
    expect(setTrustedDevice(false)).toBe(true);
    expect(isTrustedDevice()).toBe(false);
    dom.window.close();
  });

  it('explica os estados online e offline sem depender da interface', () => {
    expect(connectivityState(true)).toMatchObject({ online: true, label: 'Online' });
    expect(connectivityState(false)).toMatchObject({ online: false, label: 'Offline' });
  });
});