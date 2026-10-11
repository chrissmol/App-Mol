import { describe, expect, it, vi } from 'vitest';

vi.mock('../js/config/firebase-config.js', () => ({ app: {} }));
import {
  ASSISTANT_SYSTEM_INSTRUCTION,
  ASSISTANT_TOOL_DECLARATIONS,
  MAX_MESSAGE_CHARS,
  OFF_TOPIC_REPLY,
  buildDietProposal,
  buildRoutineProposal,
  buildWeightProposal,
  createAssistantTools,
  runAssistantTurn
} from '../js/modules/assistant.js';

const meal = (overrides = {}) => ({ nome: 'Almoço', hora: '12:30', alimentos: [{ nome: 'Arroz branco cozido', gramas: 150 }], ...overrides });
const routines = [{ id: 'r1', nome: 'Upper', diasSemana: [1, 4], exercicios: [{ nome: 'Supino Reto com Barra', grupo: 'Peito', series: [{}, {}], repsMin: 8, repsMax: 12 }] }];
const data = { loadDiet: async () => ({ meals: buildDietProposal({ refeicoes: [meal()] }).meals }), loadRoutines: async () => routines };

describe('assistente: escopo e declarações', () => {
  it('restringe o assunto ao que o app cobre e fixa a resposta de recusa', () => {
    expect(ASSISTANT_SYSTEM_INSTRUCTION).toContain('ESCOPO');
    expect(ASSISTANT_SYSTEM_INSTRUCTION).toContain(OFF_TOPIC_REPLY);
    expect(ASSISTANT_SYSTEM_INSTRUCTION).toMatch(/programação, matemática/);
  });

  it('toda ferramenta declarada tem executor', () => {
    const { executors } = createAssistantTools(data);
    expect(ASSISTANT_TOOL_DECLARATIONS.map(tool => tool.name).sort()).toEqual(Object.keys(executors).sort());
  });
});

describe('assistente: ferramentas de leitura', () => {
  it('busca alimento no catálogo com macros por 100 g', async () => {
    const { executors } = createAssistantTools(data);
    const result = await executors.buscar_alimento({ nome: 'arroz branco' });
    expect(result.porCemGramas[0]).toMatchObject({ nome: 'Arroz branco cozido', carboG: 28.1 });
  });

  it('fora do catálogo, procura no Open Food Facts e cita a fonte', async () => {
    const web = { searchWikipedia: async () => ({}), lookupBarcode: async () => ({}), searchFoodsOnline: async term => (term === 'granola x' ? { encontrado: true, url: 'https://world.openfoodfacts.org/cgi/search.pl?search_terms=granola', produtos: [{ nome: 'Granola', marca: 'Marca', kcal100: 390, proteina100: 9.5, carbo100: 66.7, gordura100: 10 }] } : { encontrado: false, produtos: [] }) };
    const { executors, sources } = createAssistantTools({ ...data, web });
    expect(await executors.buscar_alimento({ nome: 'xyz inexistente' })).toEqual({ encontrado: false, dica: 'Não está no catálogo do app nem no Open Food Facts.' });
    expect(await executors.buscar_alimento({ nome: 'granola x' })).toMatchObject({ encontrado: true, porCemGramas: [{ nome: 'Granola · Marca', kcal: 390 }] });
    expect(sources[0]).toMatchObject({ fonte: 'Open Food Facts' });
  });

  it('busca exercício sem diferenciar acento', async () => {
    const { executors } = createAssistantTools(data);
    const result = await executors.buscar_exercicio({ nome: 'supino' });
    expect(result.encontrado).toBe(true);
    expect(result.exercicios.every(item => /supino/i.test(item.nome))).toBe(true);
  });

  it('resume dieta e treinos da pessoa', async () => {
    const { executors } = createAssistantTools(data);
    const diet = await executors.ver_minha_dieta();
    expect(diet.refeicoes[0]).toMatchObject({ nome: 'Almoço', hora: '12:30' });
    expect(diet.totalDiarioAproximado.carboG).toBeCloseTo(42.2, 1);
    const training = await executors.ver_meus_treinos();
    expect(training.rotinas[0]).toMatchObject({ id: 'r1', nome: 'Upper', exercicios: [{ nome: 'Supino Reto com Barra', series: 2 }] });
  });
});

describe('assistente: propostas', () => {
  it('completa macros de alimentos do catálogo e normaliza a dieta', () => {
    const { meals } = buildDietProposal({ refeicoes: [meal()] });
    expect(meals[0].alimentos[0]).toMatchObject({ nome: 'Arroz branco cozido', gramas: 150, carbo100: 28.1 });
    expect(meals[0].diasSemana).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  it('recusa alimento fora do catálogo sem macros, horário inválido e excesso de refeições', () => {
    expect(buildDietProposal({ refeicoes: [meal({ alimentos: [{ nome: 'Molho caseiro', gramas: 30 }] })] }).error).toMatch(/não está no catálogo/);
    expect(buildDietProposal({ refeicoes: [meal({ hora: '25:00' })] }).error).toMatch(/horário/);
    expect(buildDietProposal({ refeicoes: Array.from({ length: 13 }, () => meal()) }).error).toMatch(/12 refeições/);
  });

  it('monta rotina nova com séries padrão e respeita limites', () => {
    const { routine, id } = buildRoutineProposal({ nome: 'Pernas', diasSemana: [2], exercicios: [{ nome: 'Agachamento Frontal no Smith', series: 3, repsMin: 6, repsMax: 10 }] }, routines);
    expect(id).toBeUndefined();
    expect(routine.exercicios[0]).toMatchObject({ nome: 'Agachamento Frontal no Smith', grupo: 'Pernas', repsMin: 6, repsMax: 10 });
    expect(routine.exercicios[0].series).toHaveLength(3);
    expect(buildRoutineProposal({ nome: 'X', exercicios: [{ nome: 'Supino', series: 0 }] }, routines).error).toMatch(/séries/);
    expect(buildRoutineProposal({ id: 'nao-existe', nome: 'X', exercicios: [{ nome: 'Supino', series: 3 }] }, routines).error).toMatch(/não encontrada/);
  });

  it('identifica alteração de rotina existente', () => {
    expect(buildRoutineProposal({ id: 'r1', nome: 'Upper A', exercicios: [{ nome: 'Supino', series: 4 }] }, routines).id).toBe('r1');
  });

  it('valida o peso entre 20 e 400 kg', () => {
    expect(buildWeightProposal({ pesoKg: 82.35 })).toEqual({ pesoKg: 82.4 });
    expect(buildWeightProposal({ pesoKg: 10 }).error).toMatch(/entre 20 e 400/);
  });

  it('ferramentas de ação só criam propostas, nunca gravam', async () => {
    const { executors, proposals } = createAssistantTools(data);
    expect(await executors.propor_dieta({ resumo: 'Troca o almoço', refeicoes: [meal()] })).toMatchObject({ status: 'aguardando_confirmacao' });
    expect(await executors.registrar_peso({ pesoKg: 5 })).toHaveProperty('erro');
    expect(proposals.map(item => item.tipo)).toEqual(['dieta']);
  });
});

describe('assistente: laço de conversa', () => {
  it('executa a ferramenta pedida e devolve o texto final', async () => {
    const send = vi.fn()
      .mockResolvedValueOnce({ text: '', functionCalls: [{ name: 'buscar_alimento', args: { nome: 'arroz' } }] })
      .mockResolvedValueOnce({ text: '100 g de arroz branco cozido têm 28,1 g de carboidrato.', functionCalls: [] });
    const { executors } = createAssistantTools(data);
    const result = await runAssistantTurn({ send, executors, message: 'Quanto carbo tem no arroz?' });
    expect(result.text).toMatch(/28,1 g/);
    expect(send.mock.calls[1][0][0].functionResponse.name).toBe('buscar_alimento');
    expect(send.mock.calls[1][0][0].functionResponse.response.encontrado).toBe(true);
  });

  it('devolve erro da ferramenta ao modelo em vez de quebrar', async () => {
    const send = vi.fn()
      .mockResolvedValueOnce({ functionCalls: [{ name: 'ver_minha_dieta', args: {} }] })
      .mockResolvedValueOnce({ text: 'Não consegui ler sua dieta agora.' });
    const failing = createAssistantTools({ loadDiet: async () => { throw new Error('offline'); }, loadRoutines: async () => [] });
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = await runAssistantTurn({ send, executors: failing.executors, message: 'minha dieta' });
    expect(send.mock.calls[1][0][0].functionResponse.response.erro).toBeTruthy();
    expect(result.text).toMatch(/Não consegui/);
  });

  it('para depois do limite de passos e recusa mensagem longa demais', async () => {
    const send = vi.fn().mockResolvedValue({ functionCalls: [{ name: 'buscar_alimento', args: { nome: 'arroz' } }] });
    const { executors } = createAssistantTools(data);
    expect((await runAssistantTurn({ send, executors, message: 'loop', maxSteps: 2 })).stopped).toBe(true);
    const long = await runAssistantTurn({ send: vi.fn(), executors, message: 'a'.repeat(MAX_MESSAGE_CHARS + 1) });
    expect(long.stopped).toBe(true);
  });
});

describe('assistente: mensagens de erro do Gemini', () => {
  it('traduz cota, App Check e falha genérica', async () => {
    vi.stubGlobal('navigator', { onLine: true });
    const { describeAssistantError } = await import('../js/config/assistant-gemini.js');
    expect(describeAssistantError(new Error('AI: Error fetching ...: [429 ] You exceeded your current quota'))).toMatch(/limite gratuito/);
    expect(describeAssistantError(new Error('[401 ] Firebase App Check token is invalid'))).toMatch(/não está liberado/);
    expect(describeAssistantError(new Error('boom'))).toMatch(/não respondeu/);
    vi.unstubAllGlobals();
  });
});
