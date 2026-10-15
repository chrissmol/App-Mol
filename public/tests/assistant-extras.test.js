import { describe, expect, it, vi } from 'vitest';
import { lookupBarcode, searchWikipedia } from '../js/modules/assistant-web.js';
import { MAX_FILE_BYTES, fileToPart, sheetsToText } from '../js/modules/assistant-files.js';
import { createAssistantTools, runAssistantTurn } from '../js/modules/assistant.js';

const json = body => ({ ok: true, json: async () => body });

describe('assistente: pesquisa na internet', () => {
  it('busca o artigo mais próximo na Wikipedia e devolve resumo com link', async () => {
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce(json({ query: { search: [{ title: 'Supino (exercício)' }] } }))
      .mockResolvedValueOnce(json({ title: 'Supino (exercício)', extract: 'O supino é um exercício.', content_urls: { mobile: { page: 'https://pt.m.wikipedia.org/wiki/Supino_(exerc%C3%ADcio)' } } }));
    const result = await searchWikipedia('supino', fetchImpl);
    expect(result).toMatchObject({ encontrado: true, titulo: 'Supino (exercício)', fonte: 'Wikipedia' });
    expect(fetchImpl.mock.calls[1][0]).toContain('Supino_(exerc');
  });

  it('não encontra artigo', async () => {
    expect(await searchWikipedia('zzzz', vi.fn().mockResolvedValue(json({ query: { search: [] } })))).toEqual({ encontrado: false });
  });

  it('lê nutrientes por código de barras e valida o código', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(json({ product: { product_name: 'Granola', brands: 'Marca', nutriments: { 'energy-kcal_100g': 390, proteins_100g: 9.5, carbohydrates_100g: 66.67, fat_100g: 10 } } }));
    expect(await lookupBarcode('7891000100103', fetchImpl)).toMatchObject({ encontrado: true, nome: 'Granola', porCemGramas: { kcal: 390, carboG: 66.7 } });
    expect((await lookupBarcode('123', fetchImpl)).erro).toMatch(/8 a 14/);
  });

  it('ferramentas de internet registram a fonte para a tela citar', async () => {
    const web = { searchWikipedia: async () => ({ encontrado: true, fonte: 'Wikipedia', titulo: 'Creatina', url: 'https://pt.wikipedia.org/wiki/Creatina' }), lookupBarcode: async () => ({ encontrado: false }) };
    const { executors, sources } = createAssistantTools({ loadDiet: async () => ({ meals: [] }), loadRoutines: async () => [], web });
    await executors.pesquisar_internet({ assunto: 'creatina' });
    await executors.buscar_codigo_de_barras({ codigo: '7891000100103' });
    expect(sources).toEqual([{ titulo: 'Creatina', url: 'https://pt.wikipedia.org/wiki/Creatina', fonte: 'Wikipedia' }]);
  });
});

describe('assistente: anexos', () => {
  it('envia foto e PDF como arquivo em base64', async () => {
    const image = await fileToPart(new File([new Uint8Array([1, 2, 3])], 'dieta.jpg', { type: 'image/jpeg' }));
    expect(image).toEqual({ inlineData: { mimeType: 'image/jpeg', data: 'AQID' } });
    const pdf = await fileToPart(new File(['%PDF'], 'treino.pdf', { type: '' }));
    expect(pdf.inlineData.mimeType).toBe('application/pdf');
  });

  it('transforma CSV e Excel em texto', async () => {
    expect((await fileToPart(new File(['Refeição;Alimento\nAlmoço;Arroz'], 'dieta.csv', { type: 'text/csv' }))).text).toContain('Almoço;Arroz');
    const readExcel = async () => [{ sheet: 'Segunda', data: [['Refeição', 'Alimento', 'g'], ['Almoço', 'Arroz', 150], [null, '', null]] }];
    const part = await fileToPart(new File(['x'], 'dieta.xlsx'), { readExcel });
    expect(part.text).toContain('# Aba: Segunda\nRefeição;Alimento;g\nAlmoço;Arroz;150');
    expect(sheetsToText([{ sheet: 'A', data: [['a;b', 'c\nd']] }])).toBe('# Aba: A\na b;c d');
  });

  it('recusa arquivo grande ou de formato desconhecido', async () => {
    await expect(fileToPart({ size: MAX_FILE_BYTES + 1, name: 'x.pdf' })).rejects.toThrow(/7 MB/);
    await expect(fileToPart(new File(['x'], 'musica.mp3', { type: 'audio/mpeg' }))).rejects.toThrow(/Formato não aceito/);
  });

  it('manda o anexo junto com a mensagem e aceita anexo sem texto', async () => {
    const send = vi.fn().mockResolvedValue({ text: 'Li sua dieta.' });
    const attachment = { inlineData: { mimeType: 'application/pdf', data: 'AA==' } };
    await runAssistantTurn({ send, executors: {}, message: '', attachments: [attachment] });
    expect(send.mock.calls[0][0]).toEqual([{ text: 'Analise o arquivo anexado.' }, attachment]);
  });
});

describe('assistente: resumo do cartão de confirmação', async () => {
  const { buildDietProposal, buildRoutineProposal, summarizeProposal } = await import('../js/modules/assistant.js');
  it('mostra dieta antes e depois com totais', () => {
    const before = buildDietProposal({ refeicoes: [{ nome: 'Almoço', hora: '12:00', alimentos: [{ nome: 'Arroz branco cozido', gramas: 150 }] }] }).meals;
    const after = buildDietProposal({ refeicoes: [{ nome: 'Almoço', hora: '12:00', alimentos: [{ nome: 'Batata-doce cozida', gramas: 200 }] }] }).meals;
    const summary = summarizeProposal({ tipo: 'dieta', resumo: 'Troca o arroz', meals: after }, { meals: before });
    expect(summary.antes).toEqual(['Almoço · 12:00: Arroz branco cozido 150\u00a0g']);
    expect(summary.depois).toEqual(['Almoço · 12:00: Batata-doce cozida 200\u00a0g']);
    expect(summary.totais.depois).toBe('154 kcal · P 1 g · C 37 g · G 0 g');
  });
  it('mostra rotina nova, rotina alterada e peso', () => {
    const { routine } = buildRoutineProposal({ nome: 'Pernas', exercicios: [{ nome: 'Agachamento', series: 4, repsMin: 8, repsMax: 10 }] }, []);
    expect(summarizeProposal({ tipo: 'rotina', routineId: null, routine }).titulo).toBe('Nova rotina: Pernas');
    const changed = summarizeProposal({ tipo: 'rotina', routineId: 'r1', routine }, { routines: [{ id: 'r1', nome: 'Upper', exercicios: [{ nome: 'Supino', series: [{}, {}], repsMin: 6, repsMax: 8 }] }] });
    expect(changed).toMatchObject({ titulo: 'Alterar rotina: Upper', antes: ['Supino: 2 × 6–8'], depois: ['Agachamento: 4 × 8–10'] });
    expect(summarizeProposal({ tipo: 'peso', pesoKg: 82.4 }).depois).toEqual(['82,4 kg hoje']);
  });
});

describe('assistente: diário de refeições', async () => {
  const { buildDiaryProposal, summarizeProposal, createAssistantTools: tools } = await import('../js/modules/assistant.js');
  it('propõe registrar o que a pessoa comeu, completando pelo catálogo', () => {
    const result = buildDiaryProposal({ alimentos: [{ nome: 'Arroz branco cozido', gramas: 150 }] });
    expect(result.alimentos[0]).toMatchObject({ nome: 'Arroz branco cozido', gramas: 150 });
    expect(result.alimentos[0].kcal100).toBeGreaterThan(0);
    expect(buildDiaryProposal({ alimentos: [{ nome: 'Prato desconhecido', gramas: 100 }] }).error).toMatch(/kcal100/);
    expect(buildDiaryProposal({ alimentos: [] }).error).toMatch(/ao menos um/);
  });
  it('mostra o cartão e lê o dia', async () => {
    const summary = summarizeProposal({ tipo: 'diario', resumo: 'Almoço', alimentos: [{ nome: 'Banana', gramas: 100, kcal100: 89, proteina100: 1.1, carbo100: 22.8, gordura100: 0.3 }] });
    expect(summary).toMatchObject({ titulo: 'Registrar no diário de hoje', depois: ['Banana 100 g'] });
    const { executors, proposals } = tools({ loadDiet: async () => ({ meals: [] }), loadRoutines: async () => [], loadDiary: async () => ({ itens: [{ nome: 'Banana', gramas: 100, kcal100: 89, proteina100: 1.1, carbo100: 22.8, gordura100: 0.3, hora: '08:00' }], aguaMl: 500 }) });
    expect(await executors.ver_meu_dia()).toMatchObject({ consumido: { kcal: 89 }, aguaMl: 500 });
    await executors.registrar_refeicao({ resumo: 'Lanche', alimentos: [{ nome: 'Banana', gramas: 120 }] });
    expect(proposals[0]).toMatchObject({ tipo: 'diario', resumo: 'Lanche' });
  });
});

describe('assistente: busca de alimentos por nome (Worker)', () => {
  it('chama o Worker e devolve os produtos', async () => {
    const { searchFoodsOnline, FOOD_SEARCH_URL } = await import('../js/modules/assistant-web.js');
    const fetchImpl = vi.fn().mockResolvedValue(json({ produtos: [{ nome: 'Granola', kcal100: 390 }] }));
    const result = await searchFoodsOnline(' granola ', fetchImpl);
    expect(fetchImpl.mock.calls[0][0]).toBe(`${FOOD_SEARCH_URL}?q=granola`);
    expect(result).toMatchObject({ encontrado: true, produtos: [{ nome: 'Granola' }] });
    expect(await searchFoodsOnline('a', fetchImpl)).toEqual({ encontrado: false, produtos: [] });
  });
});

describe('pet no chat', async () => {
  const { chatPetState } = await import('../js/utils/pet.js');
  it('escolhe apoio, curioso ou feliz', () => {
    expect(chatPetState('Estou com dor no joelho', 'Procure um profissional.')).toBe('apoio');
    expect(chatPetState('Monta meu treino', 'Você treina em casa ou na academia?')).toBe('curioso');
    expect(chatPetState('Quanto de proteína tem o ovo?', 'Cerca de 13 g por 100 g.')).toBe('feliz');
  });
});
