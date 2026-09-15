export const WORKOUT_TEMPLATES = {
  'Upper / Lower': {
    description: '4 dias · superior/inferior com base forte',
    days: [1, 2, 4, 5],
    exercises: [
      ['Supino Reto (Barra)', 'Peito', 8, 10, 2, 120],
      ['Remada Curvada (Barra)', 'Costas', 8, 10, 2, 120],
      ['Desenvolvimento Militar (Barra)', 'Ombros', 6, 10, 2, 120],
      ['Agachamento Livre', 'Quadríceps', 6, 10, 2, 150],
      ['Levantamento Terra Romeno', 'Posterior', 8, 12, 2, 120],
      ['Rosca Direta (Barra)', 'Braços', 10, 12, 1, 75]
    ]
  },
  'Push Pull Legs': {
    description: '6 dias · push, pull e legs editável',
    days: [1, 2, 3, 4, 5, 6],
    exercises: [
      ['Supino Inclinado (Halter)', 'Peito', 8, 12, 2, 90],
      ['Desenvolvimento com Halteres', 'Ombros', 8, 12, 2, 90],
      ['Tríceps Pulley', 'Braços', 10, 15, 1, 60],
      ['Puxada Alta (Frente / Triângulo)', 'Costas', 8, 12, 2, 90],
      ['Remada Baixa (Triângulo)', 'Costas', 8, 12, 2, 90],
      ['Leg Press 45° com Pegada Alta e Fechada', 'Quadríceps', 10, 15, 2, 120]
    ]
  },
  'Full Body 3x': {
    description: '3 dias · simples, eficiente e fácil de manter',
    days: [1, 3, 5],
    exercises: [
      ['Agachamento Goblet com Halter', 'Pernas', 10, 12, 2, 90],
      ['Supino Reto (Halter)', 'Peito', 8, 12, 2, 90],
      ['Remada Curvada (Halter)', 'Costas', 8, 12, 2, 90],
      ['Elevação Lateral', 'Ombros', 12, 15, 1, 60],
      ['Prancha', 'Abdômen', 20, 45, 2, 60]
    ]
  },
  'Força 5x5': {
    description: '3 dias · cargas progressivas e poucas variações',
    days: [1, 3, 5],
    sets: 5,
    exercises: [
      ['Agachamento Livre', 'Quadríceps', 5, 5, 2, 180],
      ['Supino Reto (Barra)', 'Peito', 5, 5, 2, 180],
      ['Remada Curvada (Barra)', 'Costas', 5, 5, 2, 150],
      ['Desenvolvimento Militar (Barra)', 'Ombros', 5, 5, 2, 150]
    ]
  },
  'Casa / Sem academia': {
    description: 'Viagem · peso corporal, halteres e elástico',
    days: [1, 3, 5],
    exercises: [
      ['Flexão de Braço', 'Peito', 8, 20, 2, 60],
      ['Agachamento Livre', 'Quadríceps', 12, 25, 2, 60],
      ['Remada Curvada (Halter)', 'Costas', 10, 15, 2, 75],
      ['Elevação Lateral', 'Ombros', 12, 20, 1, 60],
      ['Prancha', 'Abdômen', 20, 60, 2, 45]
    ]
  }
};
