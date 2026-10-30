import { describe, expect, it } from 'vitest';
import { HISTORY_LIMIT, HISTORY_TEXT_LIMIT, normalizeHistory } from '../js/modules/assistant-history.js';
import { activeWorkoutFrom } from '../js/utils/active-workout.js';

describe('histórico do assistente na conta', () => {
  it('descarta entradas inválidas e limita tamanho e quantidade', () => {
    const many = Array.from({ length: HISTORY_LIMIT + 5 }, (_, index) => ({ role: index % 2 ? 'assistant' : 'user', text: `m${index}` }));
    const result = normalizeHistory([{ role: 'system', text: 'x' }, { role: 'user', text: '  ' }, null, { role: 'user', text: 'a'.repeat(HISTORY_TEXT_LIMIT + 10) }, ...many]);
    expect(result).toHaveLength(HISTORY_LIMIT);
    expect(result.at(-1).text).toBe(`m${HISTORY_LIMIT + 4}`);
    expect(normalizeHistory([{ role: 'user', text: 'a'.repeat(HISTORY_TEXT_LIMIT + 10) }])[0].text).toHaveLength(HISTORY_TEXT_LIMIT);
    expect(normalizeHistory('nada')).toEqual([]);
  });
});

describe('rascunho de treino espelhado', () => {
  it('continua sendo lido pela barra de treino em andamento', () => {
    const raw = JSON.stringify({ versao: 2, nomeRotina: 'A', iniciadaEm: new Date().toISOString(), atualizadoEm: new Date().toISOString() });
    expect(activeWorkoutFrom(raw)?.name).toBe('A');
  });
});
