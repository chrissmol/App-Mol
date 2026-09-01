import { describe, expect, it } from 'vitest';
import { classifyEquipment, matchesExerciseSearch, nextLoadIncrement, progressionAdvice, rankExerciseSubstitutes } from '../js/modules/workout-coach.js';

describe('treinador de progressão', () => {
  const target = { repsMin: 8, repsMax: 12, rirAlvo: 2 };

  it('aumenta a carga apenas quando o topo da faixa foi atingido com RIR suficiente', () => {
    expect(progressionAdvice(target, [{ kg: 20, reps: 12, rir: 2 }])).toMatchObject({ state: 'increase', suggestedWeight: 22.5 });
    expect(progressionAdvice(target, [{ kg: 20, reps: 12, rir: 0 }]).state).toBe('reduce');
  });

  it('reduz cinco por cento quando desempenho fica abaixo do alvo', () => {
    expect(progressionAdvice(target, [{ kg: 100, reps: 6, rir: 0 }])).toMatchObject({ state: 'reduce', suggestedWeight: 95 });
  });

  it('identifica estabilidade sem inventar precisão clínica', () => {
    expect(progressionAdvice(target, [{ kg: 40, reps: 9, rir: 2 }, { kg: 40, reps: 9, rir: 2 }, { kg: 40, reps: 9, rir: 2 }]).state).toBe('plateau');
  });

  it('classifica equipamento e prioriza substituto do mesmo tipo', () => {
    expect(classifyEquipment('Supino com Halteres')).toBe('Halteres');
    const group = item => item.grupo;
    const ranked = rankExerciseSubstitutes({ nome: 'Supino com Halteres', grupo: 'Peito' }, [{ nome: 'Crucifixo na Polia', grupo: 'Peito' }, { nome: 'Supino Inclinado com Halteres', grupo: 'Peito' }], group);
    expect(ranked[0].nome).toContain('Halteres');
  });

  it('usa incrementos conservadores por faixa de carga', () => {
    expect(nextLoadIncrement(10)).toBe(1);
    expect(nextLoadIncrement(40)).toBe(2.5);
    expect(nextLoadIncrement(100)).toBe(5);
  });

  it('busca exercícios por palavras independentes, acentos e grupo', () => {
    const exercise = { nome: 'Supino Reto com Halteres', grupo: 'Peito' };
    const group = () => 'Peitoral';
    const equipment = () => 'Halteres';
    expect(matchesExerciseSearch(exercise, 'supino halteres', group, equipment)).toBe(true);
    expect(matchesExerciseSearch(exercise, 'halteres supino', group, equipment)).toBe(true);
    expect(matchesExerciseSearch(exercise, 'peitoral reto', group, equipment)).toBe(true);
    expect(matchesExerciseSearch(exercise, 'supíno peito', group, equipment)).toBe(true);
    expect(matchesExerciseSearch(exercise, 'supino barra', group, equipment)).toBe(false);
  });});