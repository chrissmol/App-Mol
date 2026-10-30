// Conversa do assistente guardada na conta (assistenteConversa/{uid}) para continuar em qualquer aparelho.
// Só o texto das trocas; propostas e anexos não entram. Mantém as últimas trocas para o documento ficar pequeno.
export const HISTORY_LIMIT = 30;
export const HISTORY_TEXT_LIMIT = 4000;

/** @param {unknown} value @returns {{ role: 'user' | 'assistant', text: string }[]} */
export function normalizeHistory(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter(item => item && (item.role === 'user' || item.role === 'assistant') && typeof item.text === 'string' && item.text.trim())
    .map(item => ({ role: item.role, text: item.text.slice(0, HISTORY_TEXT_LIMIT) }))
    .slice(-HISTORY_LIMIT);
}

export function createAssistantHistory(db, uid) {
  const load = async () => {
    const { doc, getDoc } = await import('firebase/firestore');
    return normalizeHistory((await getDoc(doc(db, 'assistenteConversa', uid))).data()?.mensagens);
  };
  const save = async messages => {
    const { doc, setDoc } = await import('firebase/firestore');
    await setDoc(doc(db, 'assistenteConversa', uid), { userId: uid, mensagens: normalizeHistory(messages), atualizadoEm: new Date().toISOString() });
  };
  const clear = async () => {
    const { doc, deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'assistenteConversa', uid));
  };
  return { load, save, clear };
}
