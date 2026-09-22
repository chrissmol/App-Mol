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
    terms: ['supino', 'chest press'],
    execucao: 'Apoie escápulas no banco, mantenha os pés firmes e desça a carga até uma posição confortável no peito. Empurre sem perder a retração dos ombros.',
    erros: 'Cotovelo excessivamente aberto, quadril saindo do banco, barra quicando no peito e ombros projetados à frente.',
  },
  {
    terms: ['agachamento', 'leg press', 'hack'],
    execucao: 'Mantenha o pé inteiro apoiado, joelhos acompanhando a linha dos pés e tronco firme. Desça somente até onde mantém coluna neutra e controle.',
    erros: 'Joelhos cedendo para dentro, calcanhar levantando, encurtar amplitude por carga alta e perder a lombar no fundo.',
  },
  {
    terms: ['extensora'],
    execucao: 'Ajuste o eixo da máquina ao joelho, mantenha quadril no encosto e estenda com controle. Pause brevemente no topo sem chutar a carga.',
    erros: 'Tirar o quadril do banco, usar impulso, travar o joelho com força e deixar a carga despencar.',
  },
  {
    terms: ['flexora', 'stiff', 'romeno', 'good morning'],
    execucao: 'Inicie pelo quadril: mantenha a coluna neutra, leve o quadril para trás e sinta alongar o posterior. Suba contraindo glúteos, sem hiperestender a lombar.',
    erros: 'Arredondar a lombar, dobrar demais o joelho no stiff, transformar o movimento em agachamento e usar balanço.',
  },
  {
    terms: ['pélvica', 'hip thrust', 'glute bridge'],
    execucao: 'Mantenha costelas baixas, queixo levemente recolhido e empurre o chão pelos calcanhares. Termine com quadril neutro e glúteos contraídos.',
    erros: 'Hiperestender a lombar no topo, abrir os joelhos sem controle, pés muito distantes e descer rápido demais.',
  },
  {
    terms: ['puxada', 'pulldown', 'barra fixa'],
    execucao: 'Comece deprimindo as escápulas e puxe os cotovelos em direção às costelas. Mantenha peito alto sem jogar o tronco para trás.',
    erros: 'Puxar só com bíceps, elevar ombros, usar balanço do corpo e encurtar a volta da carga.',
  },
  {
    terms: ['remada'],
    execucao: 'Trave o tronco, inicie o movimento pelas escápulas e leve os cotovelos para trás. Pause perto do fim da puxada e retorne devagar.',
    erros: 'Balançar o tronco, encolher os ombros, puxar para o pescoço e perder a posição lombar.',
  },
  {
    terms: ['lateral', 'ombro', 'desenvolvimento'],
    execucao: 'Mantenha costelas controladas e suba a carga no plano da escápula. Use amplitude confortável e cadência constante.',
    erros: 'Roubar com lombar, encolher trapézio, usar impulso e descer sem controle.',
  },
  {
    terms: ['rosca'],
    execucao: 'Mantenha cotovelos estáveis e punhos neutros. Suba contraindo bíceps e desça em dois a três segundos.',
    erros: 'Balançar o tronco, levar cotovelos à frente demais, dobrar punhos e encurtar a descida.',
  },
  {
    terms: ['tríceps', 'francês', 'testa'],
    execucao: 'Estabilize ombros e cotovelos; mova somente o antebraço. Estenda até contrair o tríceps sem perder o controle.',
    erros: 'Abrir cotovelos, usar ombro para empurrar, compensar com lombar e travar articulações com força.',
  },
];

const fallbackGuidance = {
  execucao: 'Ajuste o equipamento ao seu corpo, faça repetições lentas e mantenha amplitude que permita controle e postura estável.',
  erros: 'Aumentar a carga antes de dominar a técnica, usar impulso, encurtar a fase de retorno e ignorar desconforto articular.',
};

export function exerciseGuidance(exercise = {}) {
  const name = String(exercise.nome || '').toLocaleLowerCase('pt-BR');
  const rule = guidanceRules.find(item => item.terms.some(term => name.includes(term)));
  return rule ? { execucao: rule.execucao, erros: rule.erros } : { ...fallbackGuidance };
}
