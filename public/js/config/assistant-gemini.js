// "Cérebro" do assistente: Gemini pela camada gratuita do Firebase AI Logic.
// Para trocar de provedor, basta outra função com a mesma assinatura de `send`
// (ver runAssistantTurn em ../modules/assistant.js).
import { app } from './firebase-config.js';

// Flash-Lite: no teste real de 2026-10-10 respondeu em 2-8 s e acertou ferramentas e
// escopo; o 3.8 Flash levou 20-35 s e esgotou a cota gratuita mais rápido.
// Padrão quando o Remote Config não tem o parâmetro `assistant_model` ou não responde.
export const ASSISTANT_MODEL = 'gemini-3.5-flash-lite';

/**
 * Nome do modelo: parâmetro `assistant_model` do Remote Config (troca de modelo sem deploy,
 * no console do Firebase), com cache de 6 h. Qualquer falha cai no padrão acima.
 */
export async function assistantModelName() {
  try {
    const { getRemoteConfig, fetchAndActivate, getString } = await import('firebase/remote-config');
    const config = getRemoteConfig(app);
    config.settings.minimumFetchIntervalMillis = 6 * 60 * 60 * 1000;
    config.defaultConfig = { assistant_model: ASSISTANT_MODEL };
    await Promise.race([fetchAndActivate(config), new Promise(resolve => setTimeout(resolve, 3000))]);
    return getString(config, 'assistant_model').trim() || ASSISTANT_MODEL;
  } catch (error) {
    console.warn('[Mol] Remote Config indisponível; usando o modelo padrão:', error?.message);
    return ASSISTANT_MODEL;
  }
}

/** Mensagem para a pessoa quando a chamada à IA falha. */
export function describeAssistantError(error) {
  const status = Number(String(error?.message || '').match(/\[(\d{3})/)?.[1]);
  if (status === 429) return 'O limite gratuito de perguntas foi atingido. Tente de novo em 1 minuto.';
  if (status === 401 || status === 403) return 'O assistente não está liberado neste aparelho agora. Atualize a página e tente de novo.';
  if (!navigator.onLine) return 'Sem internet. Conecte-se para usar o assistente.';
  return 'O assistente não respondeu agora. Tente de novo em instantes.';
}

/** Abre uma conversa e devolve `send(parts) -> { text, functionCalls }`. */
export async function createGeminiSend({ systemInstruction, toolDeclarations, modelName }) {
  const [{ getAI, getGenerativeModel, GoogleAIBackend, ThinkingLevel }, chosenModel] = await Promise.all([import('firebase/ai'), modelName || assistantModelName()]);
  // Tokens App Check de uso único: exigidos pelos modelos atuais (proteção contra replay).
  const ai = getAI(app, { backend: new GoogleAIBackend(), useLimitedUseAppCheckTokens: true });
  const model = getGenerativeModel(ai, {
    model: chosenModel,
    systemInstruction,
    tools: [{ functionDeclarations: toolDeclarations }],
    // Respostas curtas economizam a cota gratuita e combinam com a tela do celular.
    // Pensamento baixo: as perguntas do app são diretas e a resposta fica bem mais rápida.
    generationConfig: { maxOutputTokens: 1024, temperature: 0.4, thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } }
  });
  // Histórico manual em vez de startChat(): o ChatSession do SDK 12 envia o
  // resultado das ferramentas com role "function", que os modelos Gemini 3
  // recusam (400). Aqui ele vai como "user", e a resposta do modelo volta
  // intacta (inclui a assinatura das chamadas de ferramenta).
  const history = [];
  return async parts => {
    const turn = { role: 'user', parts };
    const { response } = await model.generateContent({ contents: [...history, turn] });
    const reply = response.candidates?.[0]?.content;
    history.push(turn);
    if (reply) history.push({ ...reply, role: 'model' });
    const calls = response.functionCalls?.() || [];
    return { text: calls.length ? '' : response.text(), functionCalls: calls.map(call => ({ name: call.name, args: call.args || {} })) };
  };
}
