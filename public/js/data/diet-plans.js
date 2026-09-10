const food = (id, nome, gramas, kcal100 = 0, proteina100 = 0, carbo100 = 0, gordura100 = 0) => ({
  id,
  nome,
  gramas,
  kcal100,
  proteina100,
  carbo100,
  gordura100
});

const planoSemIogurte = [
  {
    id: 'plano-sem-iogurte-r1',
    nome: 'R1 - Todos os dias',
    hora: '08:00',
    diasSemana: [0, 1, 2, 3, 4, 5, 6],
    observacao: 'Caso queira fazer mingau de aveia, pode colocar entre 120 e 200 ml de leite.',
    alimentos: [
      food('r1-banana', 'Banana - 1 unidade', 100, 98, 1.3, 26, 0.1),
      food('r1-pacoquita', 'Pacoquita - 1 unidade', 22, 516, 16, 46, 30),
      food('r1-pao-forma', 'Pao de forma - 6 fatias', 150, 253, 9.4, 44.1, 3.4),
      food('r1-ovos', 'Ovos inteiros - 2 unidades', 100, 146, 13.3, 0.6, 9.5)
    ]
  },
  {
    id: 'plano-sem-iogurte-r2-250',
    nome: 'R2 - Almoco 250 g arroz',
    hora: '12:00',
    diasSemana: [0, 1, 3, 4],
    observacao: 'Segunda, quarta, quinta e domingo. Feijao opcional, mas importante.',
    alimentos: [
      food('r2-250-arroz', 'Arroz', 250, 128, 2.5, 28.1, 0.2),
      food('r2-250-feijao', 'Feijao', 100, 76, 4.8, 13.6, 0.5),
      food('r2-250-frango', 'Frango', 150, 159, 32, 0, 2.5),
      food('r2-250-legumes', 'Legumes', 100, 25, 2.1, 4.4, 0.5)
    ]
  },
  {
    id: 'plano-sem-iogurte-r2-300',
    nome: 'R2 - Almoco 300 g arroz',
    hora: '12:00',
    diasSemana: [2, 5, 6],
    observacao: 'Terca, sexta e sabado. Feijao opcional, mas importante.',
    alimentos: [
      food('r2-300-arroz', 'Arroz', 300, 128, 2.5, 28.1, 0.2),
      food('r2-300-feijao', 'Feijao', 100, 76, 4.8, 13.6, 0.5),
      food('r2-300-frango', 'Frango', 150, 159, 32, 0, 2.5),
      food('r2-300-legumes', 'Legumes', 100, 25, 2.1, 4.4, 0.5)
    ]
  },
  {
    id: 'plano-sem-iogurte-r3',
    nome: 'R3 - Lanche',
    hora: '16:00',
    diasSemana: [0, 1, 2, 3, 4, 5, 6],
    observacao: 'Escolha a opcao salgada ou a opcao doce.',
    alimentos: [],
    gruposOpcoes: [{
      id: 'r3-opcoes',
      nome: 'Opcoes da R3',
      modo: 'alternativas',
      opcoes: [
        {
          id: 'r3-salgada',
          nome: 'Opcao salgada',
          alimentos: [
            food('r3-salgada-pao', 'Pao de forma - 3 fatias', 75, 253, 9.4, 44.1, 3.4),
            food('r3-salgada-frango', 'Frango', 50, 159, 32, 0, 2.5),
            food('r3-salgada-requeijao', 'Requeijao light', 30, 174, 9, 5, 12),
            food('r3-salgada-geleia', 'Geleia', 30, 250, 0, 65, 0)
          ]
        },
        {
          id: 'r3-doce',
          nome: 'Opcao doce',
          alimentos: [
            food('r3-doce-aveia', 'Aveia', 40, 394, 13.9, 66.6, 8.5),
            food('r3-doce-leite', 'Leite', 200, 61, 2.9, 4.5, 3.2),
            food('r3-doce-banana', 'Banana - 1 unidade', 100, 98, 1.3, 26, 0.1),
            food('r3-doce-whey', 'Whey', 30, 400, 80, 10, 6)
          ]
        }
      ]
    }]
  },
  {
    id: 'plano-sem-iogurte-r4-200',
    nome: 'R4 - Jantar 200 g arroz',
    hora: '20:00',
    diasSemana: [0, 2, 3, 4],
    observacao: 'Terca, quarta, quinta e domingo. Feijao opcional.',
    alimentos: [
      food('r4-200-arroz', 'Arroz', 200, 128, 2.5, 28.1, 0.2),
      food('r4-200-feijao', 'Feijao', 100, 76, 4.8, 13.6, 0.5),
      food('r4-200-frango', 'Frango', 150, 159, 32, 0, 2.5),
      food('r4-200-legumes', 'Legumes', 100, 25, 2.1, 4.4, 0.5),
      food('r4-200-abacaxi', 'Abacaxi', 100, 48, 0.5, 12.3, 0.1)
    ]
  },
  {
    id: 'plano-sem-iogurte-r4-250',
    nome: 'R4 - Jantar 250 g arroz',
    hora: '20:00',
    diasSemana: [1, 5],
    observacao: 'Segunda e sexta. Sabado nao tem R4 no plano.',
    alimentos: [
      food('r4-250-arroz', 'Arroz', 250, 128, 2.5, 28.1, 0.2),
      food('r4-250-feijao', 'Feijao', 100, 76, 4.8, 13.6, 0.5),
      food('r4-250-frango', 'Frango', 150, 159, 32, 0, 2.5),
      food('r4-250-legumes', 'Legumes', 100, 25, 2.1, 4.4, 0.5)
    ]
  }
];

export const DIET_PLANS = [
  {
    id: 'plano-alimentar-sem-iogurte',
    nome: 'Plano alimentar sem iogurte',
    descricao: 'Organizacao semanal com R2 e R4 por dia e R3 com opcao salgada ou doce.',
    refeicoes: planoSemIogurte
  }
];
