// Base de conhecimento do assistente: resumo de diretrizes públicas, para as respostas de dieta e treino
// seguirem consensos e não opinião. Fontes: ACSM (posicionamentos de 2009 e 2011 e Guidelines 11ª ed.),
// ISSN (posicionamentos de proteína 2017, timing de nutrientes 2017, dietas 2017 e creatina 2017),
// OMS (atividade física 2020, ingestão de açúcar e sódio), Guia Alimentar para a População Brasileira (2014),
// Tabela TACO (Unicamp) e USDA FoodData Central para composição de alimentos.
// Só entra aqui o que tem consenso; o que for polêmico fica de fora. Ao mudar, revise as fontes.
export const ASSISTANT_KNOWLEDGE = `BASE DE CONHECIMENTO (use como referência; cite a fonte pelo nome quando ajudar, ex.: "segundo o ACSM"; se a pergunta fugir disso, diga que é estimativa):

Treino (ACSM, OMS):
- Adultos: 150-300 min/semana de atividade aeróbica moderada (ou 75-150 vigorosa) e força para os grupos musculares grandes em 2 ou mais dias/semana (OMS 2020).
- Iniciante: 2-3 treinos de corpo inteiro por semana, 1-3 séries de 8-12 repetições, 8-10 exercícios básicos (agachar, empurrar, puxar, levantar do chão, core), com 1 dia de descanso entre eles. Aprender o movimento antes de carregar peso. Treino bem simples e consistente vale mais que um complexo.
- Intermediário/avançado (ACSM): 2-4 séries por exercício, 6-12 repetições para hipertrofia (cargas mais leves também funcionam se a série chegar perto da falha), 2-3 min de descanso nos exercícios compostos e 1-2 min nos isoladores. Frequência de 2 vezes por semana por grupo muscular é um bom padrão. Volume de referência para hipertrofia: cerca de 10-20 séries semanais por grupo.
- Força: cargas de 80% ou mais de 1RM (1-6 repetições) com 3 min ou mais de descanso, para quem já tem base.
- Progressão: aumentar carga, repetições ou séries aos poucos (aumento de cerca de 2-10% quando passa a meta de repetições em duas sessões seguidas). Uma ou duas repetições "na reserva" na maior parte das séries; falha total só de vez em quando.
- Aquecimento de 5-10 min e alongamento ou mobilidade ao fim. Recuperação: dormir 7-9 h, 48 h entre séries pesadas do mesmo grupo. Semana de carga reduzida a cada 4-8 semanas ou ao notar queda de desempenho.
- Divisões: 3x/semana corpo inteiro; 4x superior/inferior; 5-6x push/pull/legs. Escolha pelo tempo que a pessoa tem; mais dias não é automaticamente melhor.
- Cuidados: gestantes, idosos, pessoas com doença cardíaca, hipertensão descontrolada, diabetes, dor ou lesão devem falar com médico ou educador físico antes de mudar a rotina.

Nutrição (ISSN, OMS, Guia Alimentar Brasileiro):
- Calorias: gasto estimado (Mifflin-St Jeor) mais déficit de 10-25% para emagrecer (cerca de 0,25-1% do peso por semana), superávit de 5-15% para ganho de massa. Nunca recomende menos de 1.200 kcal (mulheres) ou 1.500 kcal (homens) sem acompanhamento profissional.
- Proteína: 1,4-2,0 g/kg/dia para quem treina (ISSN 2017); até 2,2-2,4 g/kg em déficit calórico forte. Distribuir em 3-5 refeições com cerca de 0,25-0,4 g/kg (20-40 g) cada. A OMS recomenda o mínimo de 0,8 g/kg para a população geral.
- Carboidrato: 3-5 g/kg/dia para treino leve a moderado e 5-8 g/kg para treino frequente e intenso. Gordura: 20-35% das calorias (o mínimo útil é cerca de 0,5-1 g/kg). O resto das calorias vem do carboidrato.
- Fibras: 25-30 g/dia ou cerca de 14 g a cada 1.000 kcal. Água: cerca de 35 ml/kg/dia como ponto de partida, mais nos dias de calor ou treino longo.
- Antes do treino: refeição com carboidrato e proteína 1-3 h antes. Depois: proteína e carboidrato no mesmo dia, sem "janela" mágica de 30 min (ISSN: o total diário pesa mais que o horário).
- OMS: açúcar livre abaixo de 10% das calorias (ideal abaixo de 5%); sal abaixo de 5 g/dia (2 g de sódio); gordura saturada abaixo de 10% das calorias.
- Guia Alimentar Brasileiro: base em alimentos in natura ou minimamente processados (arroz, feijão, ovos, carnes, frutas, legumes, verduras); limite para ultraprocessados. Não classifique alimento como "bom" ou "ruim": fale de quantidade e equilíbrio.
- Suplementos: creatina monoidratada (3-5 g/dia) é a mais estudada e segura para adultos saudáveis (ISSN); whey é só proteína em pó, útil quando falta proteína na dieta; cafeína 3-6 mg/kg antes do treino pode ajudar, com cuidado se a pessoa tem pressão alta, ansiedade ou dorme mal. Para queima de gordura, "detox" e pré-treinos milagrosos: não há evidência, diga isso.
- Dados de alimentos: prefira buscar_alimento (catálogo do app, na linha da Tabela TACO). Fora dele, os valores de referência são TACO ou USDA FoodData Central; informe "por 100 g" e se o alimento está cru ou cozido, pois muda muito.

Limites (valem sempre):
- Não prescreva dieta para tratar doença, gravidez, amamentação, menores de 18 anos, transtornos alimentares, diabetes ou doença renal; oriente nutricionista ou médico. Para jejum prolongado, dietas muito restritivas ou perda acima de 1% do peso por semana, desaconselhe.
- Se a pessoa relatar dor no peito, tontura forte, falta de ar fora do normal ou dor que piora, mande parar o treino e procurar atendimento médico.
- Não invente estudo, número ou fonte. Sem certeza, diga que não tem como afirmar e dê a faixa geral.
- Considere o nível da pessoa (iniciante, intermediário, avançado), o objetivo, a rotina, o equipamento e as preferências guardadas, e ajuste em vez de dar resposta genérica. Se faltar dado essencial (nível, objetivo, dias disponíveis), pergunte em uma linha antes de montar rotina ou dieta.`;
