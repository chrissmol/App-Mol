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
