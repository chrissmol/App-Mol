import { describe, expect, it } from 'vitest';
import { cardAllowed, isPageAllowed, normalizeAppModules, presetFromModules } from '../js/utils/app-modules.js';

describe('módulos do aplicativo', () => {
  it('mantém treino sempre ativo e normaliza módulos desconhecidos', () => {
    expect(normalizeAppModules({ treino: false, dieta: false, lixo: true })).toEqual({
      treino: true,
      dieta: false,
      progresso: true,
      evolucao: true,
      conquistas: true,
    });
  });

  it('identifica presets principais', () => {
    expect(presetFromModules({ treino: true, dieta: true, progresso: true, evolucao: true, conquistas: true })).toBe('complete');
    expect(presetFromModules({ treino: true, dieta: false, progresso: false, evolucao: false, conquistas: false })).toBe('training');
    expect(presetFromModules({ treino: true, dieta: true, progresso: false, evolucao: false, conquistas: false })).toBe('trainingDiet');
  });

  it('bloqueia páginas e cards conforme módulos desligados', () => {
    const modules = normalizeAppModules({ dieta: false, progresso: false, evolucao: false });
    expect(isPageAllowed('treino.html', modules)).toBe(true);
    expect(isPageAllowed('dieta.html', modules)).toBe(false);
    expect(isPageAllowed('historico.html', modules)).toBe(false);
    expect(cardAllowed('today-card', modules)).toBe(true);
    expect(cardAllowed('next-meal-card', modules)).toBe(false);
    expect(cardAllowed('weight-card', modules)).toBe(false);
  });
});
