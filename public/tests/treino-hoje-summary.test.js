import { describe, expect, it } from 'vitest';
import { resumo } from '../workers/treino-hoje/summary.js';

describe('resumo do treino do dia', () => {
  it('sem sessões: não treinou', () => expect(resumo([])).toEqual({ treinou: false }));
  it('soma sessões e conta só séries concluídas', () => {
    const s = { nomeRotina: 'Peito', duracaoSegundos: 3000, volumeTotal: 4000.4, concluidoEm: '2026-11-25T21:30:00Z', exercicios: [{ series: [{ concluida: true }, { concluida: false }] }, { series: [{ concluida: true }] }] };
    expect(resumo([s])).toEqual({ treinou: true, nome: 'Peito', minutos: 50, volumeKg: 4000, series: 2, hora: '18:30' });
  });
});
