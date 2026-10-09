import { readFile } from 'node:fs/promises';
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, Timestamp, updateDoc, where } from 'firebase/firestore';
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
    await assertSucceeds(setDoc(doc(owner, 'treinos', 'rotina-com-horario'), { ...routine('user-a'), horario: '18:30' }));
    await assertFails(setDoc(doc(owner, 'treinos', 'rotina-b'), routine('user-b')));
    await assertFails(setDoc(doc(owner, 'treinos', 'sem-nome'), { ...routine('user-a'), nome: '' }));
    await assertFails(setDoc(doc(owner, 'treinos', 'horario-invalido'), { ...routine('user-a'), horario: '25:99' }));
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

  it('limita expiresAt de clientErrors a até um ano no futuro e mantém isolamento entre contas', async () => {
    const owner = user('user-a');
    const admin = environment.authenticatedContext('admin-uid', { email: 'chrisouzamol@gmail.com' }).firestore();
    const days = value => Timestamp.fromMillis(Date.now() + value * 24 * 60 * 60 * 1000);
    await assertSucceeds(setDoc(doc(owner, 'clientErrors', 'erro-a'), { userId: 'user-a', message: 'falha', createdAt: days(0), expiresAt: days(90) }));
    await assertFails(setDoc(doc(owner, 'clientErrors', 'erro-longo'), { userId: 'user-a', message: 'falha', createdAt: days(0), expiresAt: days(400) }));
    await assertFails(setDoc(doc(owner, 'clientErrors', 'erro-alheio'), { userId: 'user-b', message: 'falha', createdAt: days(0), expiresAt: days(90) }));
    await assertFails(getDoc(doc(owner, 'clientErrors', 'erro-a')));
    await assertSucceeds(getDoc(doc(admin, 'clientErrors', 'erro-a')));
    await assertFails(deleteDoc(doc(owner, 'clientErrors', 'erro-a')));
    await assertSucceeds(deleteDoc(doc(admin, 'clientErrors', 'erro-a')));
  });

  it('permite ao dono apagar o próprio presence e bloqueia acesso alheio', async () => {
    const owner = user('user-a');
    const other = user('user-b');
    const admin = environment.authenticatedContext('admin-uid', { email: 'chrisouzamol@gmail.com' }).firestore();
    const reference = doc(owner, 'presence', 'user-a');
    await assertSucceeds(setDoc(reference, { userId: 'user-a', online: true }));
    await assertFails(getDoc(doc(other, 'presence', 'user-a')));
    await assertSucceeds(getDoc(doc(admin, 'presence', 'user-a')));
    await assertFails(deleteDoc(doc(other, 'presence', 'user-a')));
    await assertSucceeds(deleteDoc(reference));
  });
});

describe('compartilhamento das marmitas', () => {
  const share = (db, id, partnerId) => setDoc(doc(db, 'mealShares', id), { partnerId, name: id });
  it('exige consentimento dos dois e revoga leitura da dieta ao desconectar', async () => {
    const a = user('a'); const b = user('b'); const c = user('c');
    await assertSucceeds(setDoc(doc(a, 'dietas', 'a'), { userId: 'a', refeicoes: [] }));
    await assertSucceeds(share(b, 'b', 'a'));
    await assertFails(getDoc(doc(b, 'dietas', 'a')));
    await assertSucceeds(share(a, 'a', 'b'));
    await assertSucceeds(getDoc(doc(b, 'dietas', 'a')));
    await assertFails(getDoc(doc(c, 'dietas', 'a')));
    await assertFails(getDoc(doc(b, 'users', 'a')));
    await assertFails(share(c, 'a', 'c'));
    await assertSucceeds(deleteDoc(doc(a, 'mealShares', 'a')));
    await assertFails(getDoc(doc(b, 'dietas', 'a')));
  });
  it('não permite listar convites ou trocar quem aceitou', async () => {
    const a = user('a'); const b = user('b'); const c = user('c');
    const code = 'a'.repeat(32);
    const reference = doc(a, 'mealInvites', code);
    const { serverTimestamp } = await import('firebase/firestore');
    await assertSucceeds(setDoc(reference, { ownerId: 'a', ownerName: 'A', guestId: null, createdAt: serverTimestamp() }));
    await assertFails(getDocs(collection(b, 'mealInvites')));
    await assertSucceeds(updateDoc(doc(b, 'mealInvites', code), { guestId: 'b' }));
    await assertFails(updateDoc(doc(c, 'mealInvites', code), { guestId: 'c' }));
    await assertFails(updateDoc(doc(b, 'mealInvites', code), { ownerId: 'b' }));
  });
  it('isola o histórico, exige vínculo para compartilhar e permite consultar por participante', async () => {
    const a = user('a'); const b = user('b'); const c = user('c');
    const { serverTimestamp } = await import('firebase/firestore');
    const payload = { userId: 'a', partnerId: 'b', title: 'Lasanha', preparedOn: '2026-10-09', ingredients: [{}], preparation: { pots: [{}], batch: [{}] }, createdAt: serverTimestamp() };
    await assertFails(setDoc(doc(a, 'mealPreparations', 'first'), payload));
    await share(a, 'a', 'b'); await share(b, 'b', 'a');
    await assertSucceeds(setDoc(doc(a, 'mealPreparations', 'first'), payload));
    await assertSucceeds(getDocs(query(collection(b, 'mealPreparations'), where('partnerId', '==', 'b'))));
    await assertSucceeds(getDocs(query(collection(a, 'mealPreparations'), where('userId', '==', 'a'))));
    await assertFails(getDoc(doc(c, 'mealPreparations', 'first')));
    await assertFails(updateDoc(doc(b, 'mealPreparations', 'first'), { title: 'Outro' }));
    await assertFails(deleteDoc(doc(b, 'mealPreparations', 'first')));
    await deleteDoc(doc(a, 'mealShares', 'a'));
    await assertSucceeds(getDoc(doc(b, 'mealPreparations', 'first')));
    await assertFails(setDoc(doc(a, 'mealPreparations', 'second'), payload));
  });
});
