import { readFile } from 'node:fs/promises';
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

const projectId = 'demo-mol';
let environment;

beforeAll(async () => {
  environment = await initializeTestEnvironment({
    projectId,
    firestore: { rules: await readFile(new URL('../firestore.rules', import.meta.url), 'utf8') }
  });
});

beforeEach(async () => environment.clearFirestore());
afterAll(async () => environment.cleanup());

const user = uid => environment.authenticatedContext(uid).firestore();
const routine = uid => ({ userId: uid, nome: 'Treino A', exercicios: [] });

describe('regras do Firestore', () => {
  it('isola perfis entre contas e bloqueia visitantes', async () => {
    await assertSucceeds(setDoc(doc(user('user-a'), 'users', 'user-a'), { name: 'A' }));
    await assertFails(getDoc(doc(user('user-b'), 'users', 'user-a')));
    await assertFails(getDoc(doc(environment.unauthenticatedContext().firestore(), 'users', 'user-a')));
  });

  it('bloqueia campos extras no perfil do usuário', async () => {
    const owner = user('user-a');
    await assertSucceeds(setDoc(doc(owner, 'users', 'user-a'), { name: 'A', metaSemanal: 3 }));
    await assertFails(setDoc(doc(owner, 'users', 'user-a'), { name: 'A', role: 'admin' }));
    await assertFails(setDoc(doc(owner, 'users', 'user-a'), { name: 'A', metaSemanal: 99 }));
  });


  it('valida campos estruturados do perfil e bloqueia preferências inválidas', async () => {
    const owner = user('user-a');
    const reference = doc(owner, 'users', 'user-a');
    await assertSucceeds(setDoc(reference, {
      name: 'A',
      metaSemanal: 3,
      dailyCalorieGoal: 2400,
      metaCalorias: 2400,
      macroGoals: { protein: 180, carbs: 250, fat: 70 },
      preferenciasAcessibilidade: { theme: 'system', contrast: false, largeText: true, reduceMotion: false, language: { mode: 'pt-BR', value: 'pt-BR' } },
      dashboardCards: [{ id: 'today-card', visible: true }],
      dashboardCardsUpdatedAt: '2026-09-02T12:00:00.000Z',
      exerciseLibraryPreferences: { favoritosExercicios: ['Supino'], recentesExercicios: [], exerciciosPersonalizados: [] },
      appModules: { treino: true, dieta: true, progresso: false, evolucao: false, conquistas: true },
      unidadePeso: 'kg',
      perfilPrivado: true,
      compartilharEstatisticas: false
    }));
    await assertFails(updateDoc(reference, { unidadePeso: 'stone' }));
    await assertFails(updateDoc(reference, { macroGoals: { protein: 9999 } }));
    await assertFails(updateDoc(reference, { preferenciasAcessibilidade: { theme: 'solarized' } }));
    await assertFails(updateDoc(reference, { preferenciasAcessibilidade: { language: { mode: 'fr-FR', value: 'fr-FR' } } }));
    await assertFails(updateDoc(reference, { dashboardCards: Array.from({ length: 11 }, (_, index) => ({ id: `card-${index}`, visible: true })) }));
    await assertFails(updateDoc(reference, { exerciseLibraryPreferences: { favoritosExercicios: Array.from({ length: 301 }, (_, index) => `ex-${index}`) } }));
    await assertFails(updateDoc(reference, { appModules: { treino: false, dieta: true } }));
    await assertFails(updateDoc(reference, { appModules: { treino: true, financeiro: true } }));
  });

  it('valida dono, nome e limite estrutural das rotinas', async () => {
    const owner = user('user-a');
    await assertSucceeds(setDoc(doc(owner, 'treinos', 'rotina-a'), routine('user-a')));
    await assertFails(setDoc(doc(owner, 'treinos', 'rotina-b'), routine('user-b')));
    await assertFails(setDoc(doc(owner, 'treinos', 'sem-nome'), { ...routine('user-a'), nome: '' }));
    await assertFails(setDoc(doc(owner, 'treinos', 'grande'), { ...routine('user-a'), exercicios: Array.from({ length: 61 }, () => ({})) }));
    await assertFails(setDoc(doc(owner, 'treinos', 'admin'), { ...routine('user-a'), admin: true }));
    await assertFails(getDoc(doc(user('user-b'), 'treinos', 'rotina-a')));
  });

  it('mantém sessões concluídas imutáveis', async () => {
    const owner = user('user-a');
    const reference = doc(owner, 'sessoes', 'sessao-a');
    await assertSucceeds(setDoc(reference, { userId: 'user-a', nomeRotina: 'Treino A', exercicios: [] }));
    await assertFails(setDoc(doc(owner, 'sessoes', 'sessao-extra'), { userId: 'user-a', nomeRotina: 'Treino A', exercicios: [], internalFlag: true }));
    await assertFails(updateDoc(reference, { nomeRotina: 'Alterado' }));
    await assertSucceeds(deleteDoc(reference));
  });

  it('aceita somente pesos plausíveis do próprio usuário', async () => {
    const owner = user('user-a');
    await assertSucceeds(setDoc(doc(owner, 'pesos', 'peso-a'), { userId: 'user-a', pesoKg: 75.5 }));
    await assertFails(setDoc(doc(owner, 'pesos', 'peso-baixo'), { userId: 'user-a', pesoKg: 10 }));
    await assertFails(setDoc(doc(owner, 'pesos', 'peso-alheio'), { userId: 'user-b', pesoKg: 80 }));
    await assertFails(setDoc(doc(owner, 'pesos', 'peso-extra'), { userId: 'user-a', pesoKg: 80, privado: false }));
  });

  it('protege a dieta pelo ID da conta e limita sua estrutura', async () => {
    const owner = user('user-a');
    const reference = doc(owner, 'dietas', 'user-a');
    await assertSucceeds(getDoc(reference));
    await assertSucceeds(setDoc(reference, { userId: 'user-a', refeicoes: [], atualizadoEm: 'agora' }));
    await assertSucceeds(setDoc(reference, { userId: 'user-a', refeicoes: [], jejum: { ativo: true, protocolo: '16:8', inicioJanela: '12:00', fimJanela: '20:00', diasSemana: [1, 2, 3], treino: 'flexivel', pausadoHoje: false }, atualizadoEm: 'agora' }));
    await assertFails(setDoc(doc(owner, 'dietas', 'outro-id'), { userId: 'user-a', refeicoes: [], atualizadoEm: 'agora' }));
    await assertFails(setDoc(reference, { userId: 'user-a', refeicoes: [], atualizadoEm: 'agora', campoExtra: true }));
    await assertFails(setDoc(reference, { userId: 'user-a', refeicoes: [], jejum: { ativo: true, role: 'admin' }, atualizadoEm: 'agora' }));
    await assertSucceeds(getDoc(reference));
    await assertFails(getDocs(query(collection(owner, 'dietas'), where('userId', '==', 'user-a'))));
    await assertFails(getDoc(doc(user('user-b'), 'dietas', 'user-a')));
  });
});
