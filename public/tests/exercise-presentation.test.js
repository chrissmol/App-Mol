import { describe, expect, it } from 'vitest';
import { detailedExerciseGroup, exerciseEquipment, exerciseGuidance } from '../js/modules/exercise-presentation.js';

describe('apresentação de exercícios', () => {
  it('classifica equipamento e grupo detalhado de forma previsível', () => {
    expect(exerciseEquipment({ nome: 'Agachamento no Smith' })).toBe('Máquina');
    expect(exerciseEquipment({ nome: 'Supino com Halteres' })).toBe('Halteres');
    expect(detailedExerciseGroup({ nome: 'Mesa Flexora', grupo: 'Pernas' })).toBe('Posterior');
    expect(detailedExerciseGroup({ nome: 'Rosca Scott', grupo: 'Bíceps' })).toBe('Braços');
  });

  it('entrega orientação específica e fallback seguro', () => {
    expect(exerciseGuidance({ nome: 'Supino Reto' }).execucao).toContain('escápulas');
    expect(exerciseGuidance({ nome: 'Exercício personalizado' }).erros).toContain('carga');
  });
});
