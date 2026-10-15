import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../js/config/firebase-config.js', () => ({ app: {} }));
const remote = { value: '', fail: false };
vi.mock('firebase/remote-config', () => ({
  getRemoteConfig: () => { if (remote.fail) throw new Error('sem rede'); return { settings: {}, defaultConfig: {} }; },
  fetchAndActivate: async () => true,
  getString: (config, key) => remote.value || config.defaultConfig[key]
}));

afterEach(() => { remote.value = ''; remote.fail = false; });

describe('modelo do assistente pelo Remote Config', () => {
  it('usa o parâmetro quando existe e o padrão quando não', async () => {
    const { assistantModelName, ASSISTANT_MODEL } = await import('../js/config/assistant-gemini.js');
    expect(await assistantModelName()).toBe(ASSISTANT_MODEL);
    remote.value = 'gemini-9-flash';
    expect(await assistantModelName()).toBe('gemini-9-flash');
  });

  it('cai no padrão se o Remote Config falhar', async () => {
    const { assistantModelName, ASSISTANT_MODEL } = await import('../js/config/assistant-gemini.js');
    remote.fail = true;
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(await assistantModelName()).toBe(ASSISTANT_MODEL);
  });
});
