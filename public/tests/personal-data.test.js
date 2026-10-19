import { describe, expect, it } from 'vitest';
import { normalizeBackup, parsePersonalData } from '../js/modules/personal-data.js';

describe('dados pessoais', () => {
  it('converte campos vazios para null sem gravar zeros', () => {
    expect(parsePersonalData({ height: '', goalWeight: '', weekly: '', goal: '' })).toEqual({ sexo: '', nascimento: '', nivelAtividade: '', alturaCm: null, metaPesoKg: null, objetivo: '', metaSemanal: null, ritmoMetaKg: null });
  });

  it('valida sexo, nascimento e nível de atividade', () => {
    expect(parsePersonalData({ sex: 'feminino', birth: '1996-10-11', activity: 'leve', goal: 'Saúde' })).toMatchObject({ sexo: 'feminino', nascimento: '1996-10-11', nivelAtividade: 'leve' });
    expect(() => parsePersonalData({ sex: 'x' })).toThrow('sexo');
    expect(() => parsePersonalData({ birth: '11/10/1996' })).toThrow('nascimento');
    expect(() => parsePersonalData({ activity: 'extremo' })).toThrow('atividade');
  });

  it('rejeita altura e meta semanal fora dos limites', () => {
    expect(() => parsePersonalData({ height: '90', goalWeight: '70', weekly: '3', goal: 'Saúde' })).toThrow('altura');
    expect(() => parsePersonalData({ height: '180', goalWeight: '70', weekly: '8', goal: 'Saúde' })).toThrow('meta semanal');
  });

  it('aceita só os ritmos de 0,25 e 0,5 kg por semana', () => {
    expect(parsePersonalData({ goal: 'Emagrecimento', pace: '0.5' }).ritmoMetaKg).toBe(0.5);
    expect(() => parsePersonalData({ goal: 'Emagrecimento', pace: '1' })).toThrow('ritmo');
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
