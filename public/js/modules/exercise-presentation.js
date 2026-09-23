export function exerciseEquipment(exercise = {}) {
  const name = String(exercise.nome || '').toLocaleLowerCase('pt-BR');
  if (['máquina', 'cadeira', 'smith', 'hack'].some(term => name.includes(term))) return 'Máquina';
  if (name.includes('polia') || name.includes('cabo')) return 'Polia';
  if (name.includes('halter')) return 'Halteres';
  if (name.includes('barra')) return 'Barra';
  return 'Peso corporal';
}

export function detailedExerciseGroup(exercise = {}) {
  const name = String(exercise.nome || '').toLocaleLowerCase('pt-BR');
  const group = String(exercise.grupo || 'Outros');
  if (['Peito', 'Costas', 'Ombros', 'Abdômen'].includes(group)) return group;
  if (['Bíceps', 'Tríceps', 'Antebraço'].includes(group)) return 'Braços';
  if (['flexora', 'stiff', 'romeno', 'nórdica', 'good morning'].some(term => name.includes(term))) return 'Posterior';
  if (['glúteo', 'pélvica', 'abdutora', 'abdução', 'hip thrust'].some(term => name.includes(term))) return 'Glúteos';
  if (group === 'Pernas') return 'Quadríceps';
  return group;
}

const MUSCLE_ZONE_BY_GROUP = {
  Peito: 'peito', Costas: 'costas', Ombros: 'ombros', Abdômen: 'abdomen',
  Bíceps: 'biceps', Tríceps: 'triceps', Antebraço: 'antebraco',
  Panturrilha: 'panturrilha', Panturrilhas: 'panturrilha'
};

// Zonas do mapa muscular. Segue a mesma lógica de palavras-chave de
// detailedExerciseGroup para separar pernas em quadríceps/posterior/glúteo,
// mas mantém braços separados (bíceps/tríceps/antebraço) em vez de
// agrupar em "Braços", porque o mapa corporal precisa da granularidade.
export function primaryMuscleZone(exercise = {}) {
  const name = String(exercise.nome || '').toLocaleLowerCase('pt-BR');
  const group = String(exercise.grupo || '');
  if (MUSCLE_ZONE_BY_GROUP[group]) return MUSCLE_ZONE_BY_GROUP[group];
  if (['flexora', 'stiff', 'romeno', 'nórdica', 'good morning'].some(term => name.includes(term))) return 'posterior';
  if (['glúteo', 'pélvica', 'abdutora', 'abdução', 'hip thrust'].some(term => name.includes(term))) return 'gluteo';
  if (group === 'Pernas') return 'quadriceps';
  return 'outros';
}

const SECONDARY_MUSCLE_RULES = [
  { terms: ['supino', 'chest press', 'crucifixo', 'peck deck', 'crossover'], zones: ['triceps', 'ombros'] },
  { terms: ['agachamento', 'leg press', 'hack', 'afundo', 'búlgaro', 'passada'], zones: ['gluteo', 'posterior'] },
  { terms: ['stiff', 'romeno', 'terra', 'good morning'], zones: ['gluteo', 'costas'] },
  // Restrito a "Costas" porque "puxada"/"remada" também aparecem em nomes
  // de exercícios de perna (ex.: "Mesa Flexora com Ponta do Pé Puxada").
  { terms: ['puxada', 'pulldown', 'remada', 'barra fixa'], zones: ['biceps'], onlyGroup: 'Costas' },
  { terms: ['desenvolvimento', 'arnold press', 'militar'], zones: ['triceps'] },
  { terms: ['elevação pélvica', 'hip thrust', 'ponte'], zones: ['posterior'] }
];

export function secondaryMuscleZones(exercise = {}) {
  const name = String(exercise.nome || '').toLocaleLowerCase('pt-BR');
  const primary = primaryMuscleZone(exercise);
  const zones = new Set();
  SECONDARY_MUSCLE_RULES.forEach(rule => {
    if (rule.onlyGroup && exercise.grupo !== rule.onlyGroup) return;
    if (rule.terms.some(term => name.includes(term))) rule.zones.forEach(zone => zones.add(zone));
  });
  zones.delete(primary);
  return [...zones];
}

const guidanceRules = [
  {
    key: 'supino',
    terms: ['supino', 'chest press', 'press de peito', 'squeeze press'],
    execucao: 'Apoie escápulas no banco, mantenha os pés firmes e desça a carga até uma posição confortável no peito. Empurre sem perder a retração dos ombros.',
    erros: 'Cotovelo excessivamente aberto, quadril saindo do banco, barra quicando no peito e ombros projetados à frente.',
  },
  {
    key: 'agachamento',
    terms: ['agachamento', 'leg press', 'hack'],
    execucao: 'Mantenha o pé inteiro apoiado, joelhos acompanhando a linha dos pés e tronco firme. Desça somente até onde mantém coluna neutra e controle.',
    erros: 'Joelhos cedendo para dentro, calcanhar levantando, encurtar amplitude por carga alta e perder a lombar no fundo.',
  },
  {
    key: 'extensora',
    terms: ['extensora'],
    execucao: 'Ajuste o eixo da máquina ao joelho, mantenha quadril no encosto e estenda com controle. Pause brevemente no topo sem chutar a carga.',
    erros: 'Tirar o quadril do banco, usar impulso, travar o joelho com força e deixar a carga despencar.',
  },
  {
    key: 'flexora',
    terms: ['flexora', 'stiff', 'romeno', 'good morning', 'nórdica', 'nordica', 'flexão de pernas', 'flexão de joelhos', 'ponte para posterior'],
    execucao: 'Inicie pelo quadril: mantenha a coluna neutra, leve o quadril para trás e sinta alongar o posterior. Suba contraindo glúteos, sem hiperestender a lombar.',
    erros: 'Arredondar a lombar, dobrar demais o joelho no stiff, transformar o movimento em agachamento e usar balanço.',
  },
  {
    key: 'pelvica',
    terms: ['pélvica', 'hip thrust', 'glute bridge'],
    execucao: 'Mantenha costelas baixas, queixo levemente recolhido e empurre o chão pelos calcanhares. Termine com quadril neutro e glúteos contraídos.',
    erros: 'Hiperestender a lombar no topo, abrir os joelhos sem controle, pés muito distantes e descer rápido demais.',
  },
  {
    key: 'puxada',
    terms: ['puxada', 'pulldown', 'barra fixa'],
    execucao: 'Comece deprimindo as escápulas e puxe os cotovelos em direção às costelas. Mantenha peito alto sem jogar o tronco para trás.',
    erros: 'Puxar só com bíceps, elevar ombros, usar balanço do corpo e encurtar a volta da carga.',
  },
  {
    key: 'remada',
    terms: ['remada', 'crucifixo inverso', 'reverse fly', 'face pull', 'y-raise'],
    execucao: 'Trave o tronco, inicie o movimento pelas escápulas e leve os cotovelos para trás. Pause perto do fim da puxada e retorne devagar.',
    erros: 'Balançar o tronco, encolher os ombros, puxar para o pescoço e perder a posição lombar.',
  },
  {
    key: 'lateral',
    terms: ['lateral', 'ombro', 'desenvolvimento', 'elevação frontal', 'encolhimento'],
    execucao: 'Mantenha costelas controladas e suba a carga no plano da escápula. Use amplitude confortável e cadência constante.',
    erros: 'Roubar com lombar, encolher trapézio, usar impulso e descer sem controle.',
  },
  {
    key: 'rosca',
    terms: ['rosca'],
    execucao: 'Mantenha cotovelos estáveis e punhos neutros. Suba contraindo bíceps e desça em dois a três segundos.',
    erros: 'Balançar o tronco, levar cotovelos à frente demais, dobrar punhos e encurtar a descida.',
  },
  {
    key: 'triceps',
    terms: ['tríceps', 'francês', 'testa'],
    execucao: 'Estabilize ombros e cotovelos; mova somente o antebraço. Estenda até contrair o tríceps sem perder o controle.',
    erros: 'Abrir cotovelos, usar ombro para empurrar, compensar com lombar e travar articulações com força.',
  },
  {
    key: 'crucifixo',
    terms: ['crucifixo', 'crossover'],
    execucao: 'Mantenha um leve dobra no cotovelo durante todo o movimento e abra os braços controlando até sentir alongar o peito. Feche trazendo as mãos uma em direção à outra.',
    erros: 'Dobrar e esticar o cotovelo como se fosse um supino, descer além do conforto do ombro e usar impulso pra fechar os braços.',
  },
  {
    key: 'flexao',
    terms: ['flexão de braço', 'flexão diamante', 'flexão declinada', 'flexão inclinada', 'flexão arqueira', 'archer push-up', 'flexão com palma', 'flexão com correntes', 'flexão com pegada aberta', 'flexão com os pés elevados', 'flexão na máquina assistida', 'push-up', 'push up'],
    execucao: 'Mantenha corpo alinhado da cabeça aos pés (prancha), desça com cotovelos a cerca de 45° do tronco até quase tocar o chão e empurre de volta.',
    erros: 'Quadril caindo ou subindo demais, cotovelos totalmente abertos a 90°, amplitude curta e cabeça projetada à frente.',
  },
  {
    key: 'pullover',
    terms: ['pullover'],
    execucao: 'Deitado, mantenha a lombar levemente apoiada e leve o peso num arco por trás da cabeça, sentindo alongar o peito e o dorsal. Retorne pelo mesmo arco.',
    erros: 'Dobrar demais o cotovelo (vira tríceps francês), arquear a lombar e usar impulso do tronco.',
  },
  {
    key: 'mergulho',
    terms: ['mergulho', 'dips', 'paralelas'],
    execucao: 'Desça com o tronco levemente inclinado à frente até um ângulo confortável no ombro e empurre de volta sem travar o cotovelo com força no topo.',
    erros: 'Descer além do conforto do ombro, deixar os ombros subirem até o pescoço e usar balanço das pernas.',
  },
  {
    key: 'terra',
    terms: ['levantamento terra', 'rack pull', 'deadlift', 'hiperextensão'],
    execucao: 'Inicie com a barra próxima ao corpo, quadril para trás e coluna neutra. Suba estendendo quadril e joelho juntos, terminando em pé sem hiperestender.',
    erros: 'Arredondar a lombar, a barra se afastar do corpo, puxar só com os braços e hiperestender no topo.',
  },
  {
    key: 'panturrilha',
    terms: ['panturrilha', 'tibial', 'ponta dos pés', 'ponta do pé'],
    execucao: 'Suba na ponta dos pés com amplitude completa, pause no topo e desça controlando até alongar bem a panturrilha.',
    erros: 'Fazer repetições curtas e rápidas, usar impulso do quadril e nunca descer abaixo do apoio.',
  },
  {
    key: 'abdomen',
    terms: ['abdominal', 'prancha', 'russian twist', 'woodchopper', 'hollow body', 'ab wheel', 'v-up', 'core anti-rotação', 'elevação de joelhos'],
    execucao: 'Ative o abdômen antes de mover, curve ou estabilize a coluna com controle e evite puxar o pescoço com as mãos.',
    erros: 'Puxar o pescoço, usar impulso das pernas ou braços e prender a respiração o treino inteiro.',
  },
  {
    key: 'antebraco',
    terms: ['punho', 'pinça com anilhas', 'fazendeiro', "farmer"],
    execucao: 'Apoie o antebraço estável e mova só o punho ou os dedos, com amplitude completa e controle na volta.',
    erros: 'Balançar o antebraço inteiro, usar carga alta demais e encurtar a amplitude do punho.',
  },
  {
    key: 'abducao',
    terms: ['abdutora', 'adutora', 'abdução de quadril', 'adução de quadril', 'clamshell', 'frog pump'],
    execucao: 'Mantenha o tronco estável e mova só o quadril, contraindo no ponto de maior abertura ou fechamento antes de voltar devagar.',
    erros: 'Balançar o tronco, usar impulso e deixar a carga jogar a perna de volta sem controle.',
  },
  {
    key: 'afundo',
    terms: ['afundo', 'passada', 'step-up', 'caixotão'],
    execucao: 'Dê o passo mantendo o tronco ereto, desça até o joelho de trás quase tocar o chão e empurre pelo calcanhar da frente pra voltar.',
    erros: 'Joelho da frente ultrapassar muito a ponta do pé, perder o equilíbrio lateral e apoiar peso no joelho de trás.',
  },
  {
    key: 'coice',
    terms: ['glúteo', 'coice', 'extensão de quadril', 'glute drive', 'pull-through'],
    execucao: 'Mantenha a coluna neutra e o tronco estável, estenda o quadril contraindo o glúteo sem compensar com a lombar.',
    erros: 'Arquear a lombar pra ganhar amplitude, balançar o tronco e usar carga que impede o controle no retorno.',
  },
];

const fallbackGuidance = {
  execucao: 'Ajuste o equipamento ao seu corpo, faça repetições lentas e mantenha amplitude que permita controle e postura estável.',
  erros: 'Aumentar a carga antes de dominar a técnica, usar impulso, encurtar a fase de retorno e ignorar desconforto articular.',
};

function matchingGuidanceRule(exercise = {}) {
  const name = String(exercise.nome || '').toLocaleLowerCase('pt-BR');
  return guidanceRules.find(item => item.terms.some(term => name.includes(term)));
}

export function exerciseGuidance(exercise = {}) {
  const rule = matchingGuidanceRule(exercise);
  return rule ? { execucao: rule.execucao, erros: rule.erros } : { ...fallbackGuidance };
}

// Categoria de padrão de movimento usada pra escolher a pose ilustrada do
// exercício (ver exercise-poses.js) — reaproveita a mesma classificação
// por palavra-chave já usada em exerciseGuidance, pra não ter duas fontes
// de verdade sobre "que tipo de movimento é esse exercício".
export function movementCategory(exercise = {}) {
  return matchingGuidanceRule(exercise)?.key || 'generic';
}
