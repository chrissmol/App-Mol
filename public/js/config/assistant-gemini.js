// "Cérebro" do assistente: Gemini pela camada gratuita do Firebase AI Logic.
// Para trocar de provedor, basta outra função com a mesma assinatura de `send`
// (ver runAssistantTurn em ../modules/assistant.js).
import { app } from './firebase-config.js';

// shortcut: nome do modelo fixo no código; mover para o Remote Config quando o Google aposentar este modelo.
export const ASSISTANT_MODEL = 'gemini-3.8-flash';

/** Abre uma conversa e devolve `send(parts) -> { text, functionCalls }`. */
export async function createGeminiSend({ systemInstruction, toolDeclarations }) {
  const { getAI, getGenerativeModel, GoogleAIBackend } = await import('firebase/ai');
  // Tokens App Check de uso único: exigidos pelos modelos atuais (proteção contra replay).
  const ai = getAI(app, { backend: new GoogleAIBackend(), useLimitedUseAppCheckTokens: true });
  const model = getGenerativeModel(ai, {
    model: ASSISTANT_MODEL,
    systemInstruction,
    tools: [{ functionDeclarations: toolDeclarations }],
    // Respostas curtas economizam a cota gratuita e combinam com a tela do celular.
    generationConfig: { maxOutputTokens: 1024, temperature: 0.4 }
  });
  const chat = model.startChat();
  return async parts => {
    const { response } = await chat.sendMessage(parts);
    const calls = response.functionCalls?.() || [];
    return { text: calls.length ? '' : response.text(), functionCalls: calls.map(call => ({ name: call.name, args: call.args || {} })) };
  };
}
