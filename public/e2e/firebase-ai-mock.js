// Gemini simulado para os testes e2e (MOL_E2E=1): respostas fixas conforme a
// pergunta, no mesmo formato do Firebase AI Logic.
const reply = (parts, calls = []) => ({
  response: {
    candidates: [{ content: { role: 'model', parts } }],
    functionCalls: () => (calls.length ? calls : undefined),
    text: () => parts.map(part => part.text || '').join('')
  }
});
const call = (name, args) => reply([{ functionCall: { name, args } }], [{ name, args }]);

const DIET_SWAP = {
  resumo: 'Troca a banana do café da manhã por aveia.',
  refeicoes: [
    { nome: 'Café da manhã', hora: '08:00', alimentos: [{ nome: 'Aveia em flocos', gramas: 40 }] },
    { nome: 'R3 - Lanche', hora: '16:00', alimentos: [{ nome: 'Pão de forma', gramas: 75, kcal100: 253, proteina100: 9, carbo100: 49, gordura100: 3.2 }] }
  ]
};

const FINAL = {
  buscar_alimento: 'Em 100 g de **arroz branco cozido** há cerca de 28,1 g de carboidrato.',
  propor_dieta: 'Preparei a troca. Confira e confirme abaixo.',
  registrar_peso: 'Confira o registro abaixo.',
  pesquisar_internet: 'Resumo da pesquisa.'
};

export const ThinkingLevel = { MINIMAL: 'MINIMAL', LOW: 'LOW', MEDIUM: 'MEDIUM', HIGH: 'HIGH' };
export class GoogleAIBackend {}
export const getAI = () => ({});
export const getGenerativeModel = () => ({
  async generateContent({ contents }) {
    await new Promise(resolve => setTimeout(resolve, 150));
    const last = contents.at(-1);
    const toolResult = last.parts.find(part => part.functionResponse);
    if (toolResult) return reply([{ text: FINAL[toolResult.functionResponse.name] || 'Pronto.' }]);
    const text = last.parts.map(part => part.text || '').join(' ').toLowerCase();
    const hasFile = last.parts.some(part => part.inlineData || /conteúdo do arquivo/i.test(part.text || ''));
    if (text.includes('python')) return reply([{ text: 'Só consigo ajudar com treino, exercícios, dieta, refeições, marmitas, peso e o uso do Mol.' }]);
    if (text.includes('arroz')) return call('buscar_alimento', { nome: 'arroz branco' });
    if (text.includes('troca') || hasFile) return call('propor_dieta', DIET_SWAP);
    if (text.includes('peso')) return call('registrar_peso', { pesoKg: 80.5 });
    return reply([{ text: 'Posso ajudar com treino, dieta e o uso do Mol.' }]);
  }
});
