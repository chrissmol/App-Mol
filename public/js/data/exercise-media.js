// Fotos de demonstração (2 quadros, posição inicial/final) para os
// exercícios mais comuns da biblioteca. Fonte: free-exercise-db
// (github.com/yuhonas/free-exercise-db, licença Unlicense/domínio
// público). Cada entrada foi conferida manualmente contra o nome e o
// equipamento do exercício correspondente no Mol antes de entrar aqui —
// não é correspondência automática, então a lista é pequena de propósito.
// Exercícios fora desta lista continuam usando o ícone genérico.
export const EXERCISE_MEDIA = {
  'Supino Reto com Pegada Invertida (Barra)': 'Barbell_Bench_Press_-_Medium_Grip',
  'Supino Inclinado com Pegada Fechada': 'Barbell_Incline_Bench_Press_-_Medium_Grip',
  'Agachamento Livre (Barra)': 'Barbell_Squat',
  'Agachamento Frontal no Smith': 'Front_Squat_Clean_Grip',
  'Leg Press 45º com Pegada Alta e Fechada': 'Leg_Press',
  'Cadeira Extensora com Isometria no Topo': 'Leg_Extensions',
  'Mesa Flexora com Ponta do Pé Estendida (Flexão Plantar)': 'Lying_Leg_Curls',
  'Cadeira Flexora Sentado com Tronco Inclinado à Frente': 'Seated_Leg_Curl',
  'Levantamento Terra Romeno (Romanian Deadlift com Barra)': 'Romanian_Deadlift',
  'Remada Curvada com Pegada Invertida (Supinada)': 'Bent_Over_Barbell_Row',
  'Remada Baixa com Barra Reta': 'Seated_Cable_Rows',
  'Puxada Alta com Pegada Curta Neutra': 'Close-Grip_Front_Lat_Pulldown',
  'Barra Fixa com Carga (Cinto)': 'Pullups',
  'Desenvolvimento Militar Estrito (Barra em Pé)': 'Standing_Military_Press',
  'Elevação Lateral Sentado com Halter': 'Seated_Side_Lateral_Raise',
  'Tríceps na Polia com Barra Reta (Invertida/Supinada)': 'Triceps_Pushdown',
  'Elevação Pélvica na Máquina Smith': 'Barbell_Hip_Thrust',
  'Panturrilha em Pé no Smith com Pés em Rotação Interna (Foco Lateral)': 'Standing_Calf_Raises',
  'Prancha Frontal com Apoio nos Antebraços e Elevação de Perna': 'Plank'
};

// A base precisa ser um literal estático em new URL(..., import.meta.url):
// o Vite reescreve esse padrão em tempo de build por análise estática, e
// não resolve corretamente um segmento dinâmico dentro da string.
const EXERCISE_MEDIA_BASE = new URL('../../assets/exercises', import.meta.url).href;

export function exerciseMediaFrames(exercise = {}) {
  const mediaId = EXERCISE_MEDIA[exercise.nome];
  if (!mediaId) return null;
  return [`${EXERCISE_MEDIA_BASE}/${mediaId}/0.jpg`, `${EXERCISE_MEDIA_BASE}/${mediaId}/1.jpg`];
}
