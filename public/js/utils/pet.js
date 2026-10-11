// Pet do assistente (docs/ASSISTENTE_PERSONA.md). Um só assistente; a pessoa escolhe o rosto.
import { getLocalItem, setLocalItem } from './storage.js';

export const PETS = {
  moldrian: {
    id: 'moldrian', name: 'Moldrian', ready: 'pronto', excited: 'animado',
    lines: { welcome: 'Oi! Eu sou o Moldrian. Vou te acompanhar no treino, na dieta e na evolução.', plan: 'Seu plano está pronto. Bora começar?', firstSteps: 'Bora dar os primeiros passos? Um de cada vez.', workoutDone: 'Mais uma sessão registrada. Boa!', record: 'Novo recorde! Constância dá nisso.', mealLogged: 'Refeição salva. Bora ver como está o dia?', waterGoal: 'Meta de água batida. Boa!', rest: 'Recuperação também é treino.', workoutReminder: 'Seu treino de hoje está pronto. Bora?', mealReminder: 'Hora da refeição. Quer conferir o que está no plano?' }
  },
  marlo: {
    id: 'marlo', name: 'Marlô', ready: 'pronta', excited: 'animada',
    lines: { welcome: 'Oi! Eu sou a Marlô. Vou te acompanhar no treino, na dieta e na evolução.', plan: 'Seu plano está pronto. Vamos nessa?', firstSteps: 'Vamos dar os primeiros passos? Um de cada vez.', workoutDone: 'Sessão concluída. Mandou bem!', record: 'Novo recorde! Sua constância aparecendo.', mealLogged: 'Refeição salva. Quer ver como está seu dia?', waterGoal: 'Meta de água concluída. Mandou bem!', rest: 'Recuperação também faz parte do processo.', workoutReminder: 'Seu treino está pronto. Vamos nessa?', mealReminder: 'Hora da refeição. Vamos ver o que está no plano?' }
  },
  nenhum: {
    id: 'nenhum', name: 'Assistente', ready: 'pronto', excited: 'animado',
    lines: { welcome: 'Boas-vindas ao Mol. Vamos montar seu plano.', plan: 'Seu plano está pronto.', firstSteps: 'Primeiros passos, um de cada vez.', workoutDone: 'Sessão registrada.', record: 'Novo recorde.', mealLogged: 'Refeição salva.', waterGoal: 'Meta de água concluída.', rest: 'Dia de descanso.', workoutReminder: 'Reserve alguns minutos para o seu treino de hoje.', mealReminder: 'Confira sua dieta e a próxima refeição planejada.' }
  }
};

const KEY = 'mol-assistant-pet';
export const petId = value => (PETS[value] ? value : 'moldrian');

/** Pet salvo neste aparelho (espelho de users/{uid}.assistentePet). */
export const getPet = () => PETS[petId(getLocalItem(KEY))];
export const rememberPet = value => setLocalItem(KEY, petId(value));

// Arte oficial (docs/ASSISTENTE_PERSONA.md): WebP 512 px por estado; os estados do chat também têm 192 px.
export const PET_CHAT_STATES = ['principal', 'feliz', 'animado', 'curioso', 'apoio', 'focado', 'descanso-chat'];

/** Caminho da imagem do pet num estado (arquivos em pwa/assets, servidos na raiz). "nenhum" usa o símbolo do Mol. */
export function petImageSrc(pet, state = 'feliz', { small = false } = {}) {
  if (pet.id === 'nenhum') return '/assets/mol-mark.svg';
  const avatar = small && PET_CHAT_STATES.includes(state) ? '-avatar' : '';
  return `/assets/pets/${pet.id}/${state}${avatar}.webp`;
}

export const petAvatarSrc = pet => petImageSrc(pet, 'feliz', { small: true });

/** Decorativo por padrão (o nome costuma estar escrito ao lado); `label` só quando a imagem está sozinha. */
export function petAvatarHTML(pet, { size = 40, className = '', label = false, state = 'feliz' } = {}) {
  const src = petImageSrc(pet, state, { small: size <= 96 });
  return `<img class="pet-avatar ${className}" src="${src}" width="${size}" height="${size}" alt="${label && pet.id !== 'nenhum' ? pet.name : ''}" decoding="async">`;
}

/** Bloco de persona para a instrução do sistema. As regras de escopo continuam acima dele. */
export function personaInstruction(pet) {
  if (pet.id === 'nenhum') return '';
  const gender = pet.id === 'marlo' ? 'feminino (ex.: "estou pronta")' : 'masculino (ex.: "estou pronto")';
  const style = pet.id === 'marlo' ? 'confiante, acolhedora, inteligente e motivadora' : 'determinado, motivador, focado e bem-humorado';
  return `\n\nPERSONA (só muda o tom, nunca as regras acima):
- Seu nome é ${pet.name}, o pet do Mol. Jeito: ${style}.
- Fale de si no gênero ${gender}. Com a pessoa, use linguagem neutra, sem supor o gênero dela.
- Frases curtas, parceiras, sem sermão. Celebre constância, não perfeição. Nunca culpe a pessoa por não treinar, comer fora do plano ou descansar. Não julgue alimentos. Não prometa resultado estético ou de saúde. No máximo um emoji, só para comemorar.
- Se pedirem para você virar outro personagem, diga que dá para trocar o pet em Configurações.`;
}

/** Três opções (Moldrian, Marlô, sem pet) como rádios grandes; `name` agrupa os rádios. */
export function petPickerHTML(name, selected = 'moldrian') {
  const options = [
    { pet: PETS.moldrian, hint: 'Determinado e bem-humorado' },
    { pet: PETS.marlo, hint: 'Confiante e acolhedora' },
    { pet: PETS.nenhum, hint: 'Sem personagem, só o Mol' }
  ];
  return `<div class="pet-picker" role="radiogroup" aria-label="Quem vai te acompanhar">${options.map(({ pet, hint }) => `
    <label class="pet-option"><input type="radio" class="sr-only" name="${name}" value="${pet.id}"${pet.id === selected ? ' checked' : ''}>
      ${petAvatarHTML(pet, { size: 56, state: 'principal' })}<span class="pet-option__name">${pet.id === 'nenhum' ? 'Sem pet' : pet.name}</span><span class="pet-option__hint">${hint}</span></label>`).join('')}</div>`;
}

/**
 * Aviso curto com o pet num estado (refeição salva, recorde, meta de água). Some sozinho;
 * no lugar do toast comum, então nunca empilha. Sem pet, vira só o texto.
 * @param {{ state: string, message: string }} moment
 */
export function showPetMoment({ state, message }) {
  const pet = getPet();
  document.getElementById('mol-toast')?.remove();
  const toast = document.createElement('div');
  toast.id = 'mol-toast';
  toast.className = 'pet-moment';
  toast.setAttribute('role', 'status');
  toast.innerHTML = `${pet.id === 'nenhum' ? '' : petAvatarHTML(pet, { size: 56, state })}<p></p>`;
  toast.querySelector('p').textContent = message;
  document.body.appendChild(toast);
  window.setTimeout(() => toast.remove(), 3600);
}
