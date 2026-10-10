import { beforeEach, describe, expect, it, vi } from 'vitest';

const store = new Map();
let nextId = 1;
vi.mock('firebase/firestore', () => ({
  doc: (_db, collection, id) => ({ path: `${collection}/${id}`, id }),
  collection: (_db, name) => ({ name }),
  query: (ref, ...filters) => ({ ref, filters }),
  where: (field, op, value) => ({ field, value }),
  serverTimestamp: () => 'TS',
  getDoc: async ref => ({ exists: () => store.has(ref.path), data: () => store.get(ref.path) }),
  getDocs: async q => ({ docs: [...store].filter(([path, value]) => path.startsWith(`${q.ref.name}/`) && value.userId === q.filters[0].value).map(([path, value]) => ({ id: path.split('/')[1], data: () => value })) }),
  setDoc: async (ref, value) => { store.set(ref.path, value); },
  updateDoc: async (ref, value) => { store.set(ref.path, { ...store.get(ref.path), ...value }); },
  addDoc: async (ref, value) => { const id = `id${nextId++}`; store.set(`${ref.name}/${id}`, value); return { id }; },
  deleteDoc: async ref => { store.delete(ref.path); }
}));

const { createAssistantStore } = await import('../js/modules/assistant-store.js');
const { buildDietProposal, buildRoutineProposal } = await import('../js/modules/assistant.js');

describe('assistente: gravação com desfazer', () => {
  beforeEach(() => { store.clear(); nextId = 1; });

  it('troca a dieta mantendo o jejum e desfaz para a versão anterior', async () => {
    store.set('dietas/u1', { userId: 'u1', refeicoes: [{ id: 'm0', nome: 'Antiga', hora: '08:00', alimentos: [] }], jejum: { ativo: true, protocolo: '16:8' } });
    const api = createAssistantStore({}, 'u1');
    const { meals } = buildDietProposal({ refeicoes: [{ nome: 'Almoço', hora: '12:00', alimentos: [{ nome: 'Banana', gramas: 100 }] }] });
    const undo = await api.applyProposal({ tipo: 'dieta', meals });
    expect(store.get('dietas/u1').refeicoes[0].nome).toBe('Almoço');
    expect(store.get('dietas/u1').jejum.protocolo).toBe('16:8');
    await undo();
    expect(store.get('dietas/u1').refeicoes[0].nome).toBe('Antiga');
  });

  it('cria rotina da pessoa e o desfazer apaga', async () => {
    const api = createAssistantStore({}, 'u1');
    const { routine } = buildRoutineProposal({ nome: 'Pernas', exercicios: [{ nome: 'Agachamento', series: 3 }] }, []);
    const undo = await api.applyProposal({ tipo: 'rotina', routineId: null, routine });
    expect((await api.loadRoutines()).map(item => item.nome)).toEqual(['Pernas']);
    expect(store.get('treinos/id1').userId).toBe('u1');
    await undo();
    expect(await api.loadRoutines()).toEqual([]);
  });

  it('altera rotina existente e o desfazer restaura os campos', async () => {
    store.set('treinos/r1', { userId: 'u1', nome: 'Upper', exercicios: [{ nome: 'Supino' }], diasSemana: [1] });
    const api = createAssistantStore({}, 'u1');
    const { routine, id } = buildRoutineProposal({ id: 'r1', nome: 'Upper A', exercicios: [{ nome: 'Remada', series: 3 }] }, [{ id: 'r1' }]);
    const undo = await api.applyProposal({ tipo: 'rotina', routineId: id, routine });
    expect(store.get('treinos/r1').nome).toBe('Upper A');
    await undo();
    expect(store.get('treinos/r1')).toMatchObject({ nome: 'Upper', exercicios: [{ nome: 'Supino' }], diasSemana: [1] });
  });

  it('registra peso e o desfazer remove o registro', async () => {
    const api = createAssistantStore({}, 'u1');
    const undo = await api.applyProposal({ tipo: 'peso', pesoKg: 80.5 });
    expect(store.get('pesos/id1')).toMatchObject({ userId: 'u1', pesoKg: 80.5 });
    await undo();
    expect(store.has('pesos/id1')).toBe(false);
  });

  it('recusa proposta desconhecida', async () => {
    await expect(createAssistantStore({}, 'u1').applyProposal({ tipo: 'outra' })).rejects.toThrow();
  });
});
