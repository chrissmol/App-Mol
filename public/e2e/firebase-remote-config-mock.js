// Remote Config nos testes: sem rede, devolve só os valores padrão do app.
export const getRemoteConfig = () => ({ settings: {}, defaultConfig: {} });
export const fetchAndActivate = async () => false;
export const getString = (config, key) => String(config.defaultConfig?.[key] ?? '');
