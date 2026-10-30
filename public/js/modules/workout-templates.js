// Modelos baseados em evidências; fontes e racional em docs/TREINOS_PRONTOS.md.
// Exercício: [nome da biblioteca, grupo, repsMin, repsMax, RIR alvo, descanso (s), séries, nota opcional]
const PROGRESSAO = 'Dupla progressão: ao bater o topo da faixa de reps em todas as séries com RIR 2 ou mais, suba a carga 2–5%.';

export const WORKOUT_TEMPLATES = {
  'Iniciante Full Body 3x': {
    description: '3 dias · iniciante · corpo todo, máquinas e halteres, séries fáceis de aprender',
    progression: `${PROGRESSAO} Nas 2 primeiras semanas pare com 3–4 reps de folga para aprender o movimento.`,
    routines: [
      { name: 'Corpo todo A', days: [1, 5], exercises: [
        ['Leg Press 45º', 'Pernas', 10, 12, 3, 120, 3, 'Sem leg press: Agachamento Goblet com Halter.'],
        ['Supino na Máquina (Chest Press)', 'Peito', 8, 12, 3, 90, 3, 'Sem máquina: Supino Reto (Halter).'],
        ['Puxada Alta (Frente / Triângulo)', 'Costas', 8, 12, 3, 90, 3],
        ['Elevação de Quadril no Solo (Glute Bridge)', 'Pernas', 10, 15, 3, 75, 2],
        ['Desenvolvimento com Halter', 'Ombros', 10, 12, 3, 75, 2],
        ['Prancha Frontal', 'Abdômen', 20, 40, 3, 60, 2, 'Valores em segundos.']
      ] },
      { name: 'Corpo todo B', days: [3], exercises: [
        ['Agachamento Goblet com Halter', 'Pernas', 10, 12, 3, 120, 3],
        ['Supino Inclinado (Halter)', 'Peito', 8, 12, 3, 90, 3],
        ['Remada Sentada na Máquina', 'Costas', 8, 12, 3, 90, 3, 'Sem máquina: Remada Baixa (Polia / Triângulo).'],
        ['Levantamento Terra Romeno com Halteres', 'Pernas', 10, 12, 3, 90, 2],
        ['Elevação Lateral com Halter', 'Ombros', 12, 15, 2, 60, 2],
        ['Abdominal Supra (Solo)', 'Abdômen', 12, 20, 2, 60, 2]
      ] }
    ]
  },
  'Upper / Lower': {
    description: '4 dias · intermediário · cada músculo 2x por semana, 10+ séries semanais',
    progression: PROGRESSAO,
    routines: [
      { name: 'Superior A', days: [1], exercises: [
        ['Supino Reto (Barra)', 'Peito', 6, 8, 2, 150, 3],
        ['Remada Curvada (Barra)', 'Costas', 6, 8, 2, 150, 3, 'Sem barra: Remada Curvada (Halter).'],
        ['Desenvolvimento com Halter', 'Ombros', 8, 10, 2, 120, 3],
        ['Puxada Alta (Supinada)', 'Costas', 8, 12, 2, 90, 3],
        ['Tríceps na Polia (Corda)', 'Tríceps', 10, 15, 1, 60, 2],
        ['Rosca Direta (Barra W)', 'Bíceps', 10, 15, 1, 60, 2]
      ] },
      { name: 'Inferior A', days: [2], exercises: [
        ['Agachamento Livre (Barra)', 'Pernas', 6, 8, 2, 180, 3, 'Sem rack: Leg Press 45º.'],
        ['Levantamento Terra Romeno (Romanian Deadlift com Barra)', 'Pernas', 8, 10, 2, 150, 3],
        ['Leg Press 45º', 'Pernas', 10, 12, 2, 120, 2],
        ['Mesa Flexora', 'Pernas', 10, 15, 1, 75, 3],
        ['Panturrilha em Pé na Máquina', 'Panturrilhas', 10, 15, 1, 60, 3],
        ['Abdominal na Polia (Crunch)', 'Abdômen', 10, 15, 1, 60, 2]
      ] },
      { name: 'Superior B', days: [4], exercises: [
        ['Supino Inclinado (Halter)', 'Peito', 8, 12, 2, 120, 3],
        ['Remada Baixa (Polia / Triângulo)', 'Costas', 8, 12, 2, 90, 3],
        ['Elevação Lateral na Polia', 'Ombros', 12, 20, 1, 60, 3, 'Sem polia: Elevação Lateral com Halter.'],
        ['Crucifixo na Máquina (Peck Deck)', 'Peito', 12, 15, 1, 60, 2],
        ['Face Pull na Polia', 'Ombros', 15, 20, 1, 60, 2],
        ['Tríceps Francês com Halter', 'Tríceps', 10, 15, 1, 60, 2],
        ['Rosca Martelo (Halter)', 'Bíceps', 10, 15, 1, 60, 2]
      ] },
      { name: 'Inferior B', days: [5], exercises: [
        ['Agachamento Hack', 'Pernas', 8, 12, 2, 150, 3],
        ['Elevação Pélvica (Barra)', 'Pernas', 8, 12, 2, 120, 3, 'Sem barra: Elevação Pélvica com Halter Único Apoiado no Quadril.'],
        ['Cadeira Extensora', 'Pernas', 12, 15, 1, 75, 3],
        ['Stiff (Halter)', 'Pernas', 10, 12, 2, 90, 2],
        ['Panturrilha Sentado na Máquina', 'Panturrilhas', 12, 20, 1, 60, 3],
        ['Prancha Frontal', 'Abdômen', 30, 60, 1, 60, 2, 'Valores em segundos.']
      ] }
    ]
  },
  'Push Pull Legs': {
    description: '6 dias · avançado · cada músculo 2x por semana, volume alto',
    progression: `${PROGRESSAO} Se o desempenho cair por 2 semanas seguidas, faça uma semana com metade das séries.`,
    routines: [
      { name: 'Push (empurrar)', days: [1, 4], exercises: [
        ['Supino Inclinado (Halter)', 'Peito', 6, 10, 2, 120, 3],
        ['Desenvolvimento com Halter', 'Ombros', 8, 10, 2, 120, 3],
        ['Crossover (Polia Alta)', 'Peito', 12, 15, 1, 60, 2],
        ['Elevação Lateral na Polia', 'Ombros', 12, 20, 1, 60, 4],
        ['Tríceps na Polia (Corda)', 'Tríceps', 10, 15, 1, 60, 3],
        ['Tríceps Francês na Polia', 'Tríceps', 10, 15, 1, 60, 2]
      ] },
      { name: 'Pull (puxar)', days: [2, 5], exercises: [
        ['Puxada Alta (Frente / Triângulo)', 'Costas', 8, 12, 2, 120, 3],
        ['Remada Cavalinho com Apoio de Peito (Chest-supported T-Bar)', 'Costas', 8, 12, 2, 120, 3],
        ['Remada Baixa (Polia / Triângulo)', 'Costas', 10, 12, 1, 90, 2],
        ['Face Pull na Polia', 'Ombros', 15, 20, 1, 60, 3],
        ['Rosca Direta (Barra W)', 'Bíceps', 8, 12, 1, 75, 3],
        ['Rosca Martelo (Halter)', 'Bíceps', 10, 15, 1, 60, 2]
      ] },
      { name: 'Legs (pernas)', days: [3, 6], exercises: [
        ['Agachamento Livre (Barra)', 'Pernas', 5, 8, 2, 180, 3, 'Sem rack: Agachamento Hack.'],
        ['Levantamento Terra Romeno (Romanian Deadlift com Barra)', 'Pernas', 8, 10, 2, 150, 3],
        ['Leg Press 45º', 'Pernas', 10, 15, 1, 120, 3],
        ['Mesa Flexora', 'Pernas', 10, 15, 1, 75, 3],
        ['Cadeira Extensora', 'Pernas', 12, 15, 1, 60, 2],
        ['Panturrilha em Pé na Máquina', 'Panturrilhas', 10, 15, 1, 60, 4]
      ] }
    ]
  },
  'Força A/B 5x5': {
    description: '3 dias · intermediário · agachamento, supino e terra com poucas variações',
    progression: 'Se completar todas as séries com a técnica boa, suba 2,5 kg (parte superior) ou 5 kg (parte inferior) na próxima sessão. Falhou 2 vezes seguidas: reduza 10%.',
    routines: [
      { name: 'Força A', days: [1, 5], exercises: [
        ['Agachamento Livre (Barra)', 'Pernas', 5, 5, 2, 180, 5],
        ['Supino Reto (Barra)', 'Peito', 5, 5, 2, 180, 5],
        ['Remada Curvada (Barra)', 'Costas', 5, 5, 2, 150, 5]
      ] },
      { name: 'Força B', days: [3], exercises: [
        ['Agachamento Livre (Barra)', 'Pernas', 5, 5, 2, 180, 5],
        ['Desenvolvimento Militar Estrito (Barra em Pé)', 'Ombros', 5, 5, 2, 150, 5],
        ['Levantamento Terra (Conventional Deadlift)', 'Costas', 5, 5, 2, 240, 1],
        ['Prancha Frontal', 'Abdômen', 30, 60, 2, 60, 2, 'Valores em segundos.']
      ] }
    ]
  },
  'Casa / Sem academia': {
    description: '3 dias · iniciante · peso corporal, halteres e elástico, ideal para viagem',
    progression: 'Sem carga para subir: aumente reps até o topo da faixa, depois use a variação mais difícil (ex.: flexão inclinada → flexão no solo → pés elevados) ou desacelere a descida (3 s).',
    routines: [
      { name: 'Casa A', days: [1, 5], exercises: [
        ['Flexão de Braço (Solo)', 'Peito', 8, 15, 2, 75, 3, 'Muito difícil: Flexão Inclinada (mãos no sofá ou na mesa).'],
        ['Afundo (Halter)', 'Pernas', 10, 15, 2, 75, 3, 'Sem halter: use mochila com livros.'],
        ['Remada Unilateral (Serrote com Halter)', 'Costas', 10, 15, 2, 75, 3],
        ['Elevação de Quadril no Solo (Glute Bridge)', 'Pernas', 12, 20, 2, 60, 3],
        ['Elevação Lateral com Halter', 'Ombros', 12, 20, 1, 60, 2],
        ['Prancha Frontal', 'Abdômen', 20, 60, 2, 45, 2, 'Valores em segundos.']
      ] },
      { name: 'Casa B', days: [3], exercises: [
        ['Agachamento Búlgaro (Halter)', 'Pernas', 8, 12, 2, 90, 3, 'Apoie o pé de trás no sofá.'],
        ['Flexão com os Pés Elevados', 'Peito', 6, 12, 2, 75, 3],
        ['Remada Curvada (Halter)', 'Costas', 10, 15, 2, 75, 3],
        ['Stiff (Halter)', 'Pernas', 10, 15, 2, 75, 3],
        ['Tríceps no Banco (Mergulho no Banco)', 'Tríceps', 8, 15, 2, 60, 2],
        ['Prancha Lateral', 'Abdômen', 20, 45, 2, 45, 2, 'Valores em segundos, cada lado.']
      ] }
    ]
  }
};
