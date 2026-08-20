import { describe, expect, it } from 'vitest';
import { normalizeBackup, parsePersonalData } from '../js/modules/personal-data.js';

describe('dados pessoais', () => {
  it('converte campos vazios para null sem gravar zeros', () => {
    expect(parsePersonalData({ height: '', goalWeight: '', weekly: '', goal: '' })).toEqual({ alturaCm: null, metaPesoKg: null, objetivo: '', metaSemanal: null });
  });

  it('rejeita altura e meta semanal fora dos limites', () => {
    expect(() => parsePersonalData({ height: '90', goalWeight: '70', weekly: '3', goal: 'Saúde' })).toThrow('altura');
    expect(() => parsePersonalData({ height: '180', goalWeight: '70', weekly: '8', goal: 'Saúde' })).toThrow('meta semanal');
  });
});

describe('backup pessoal', () => {
  it('preserva IDs no formato v2', () => {
    const result = normalizeBackup({ versao: 2, perfil: {}, dados: { treinos: [{ id: 'abc', data: { nome: 'A', exercicios: [] } }], sessoes: [], pesos: [], dietas: [] } });
    expect(result.entries.treinos[0].id).toBe('abc');
  });

  it('aceita o formato legado v1 sem confiar em IDs ausentes', () => {
    const result = normalizeBackup({ versao: 1, perfil: {}, dados: { treinos: [{ nome: 'A', exercicios: [] }], sessoes: [], pesos: [], dietas: [] } });
    expect(result.entries.treinos[0].id).toBeNull();
  });

  it('rejeita todos os dados antes de restaurar quando há registro inválido', () => {
    expect(() => normalizeBackup({ versao: 2, perfil: {}, dados: { treinos: [], sessoes: [], pesos: [{ id: 'p', data: { pesoKg: 900 } }], dietas: [] } })).toThrow('Peso inválido');
  });
});
