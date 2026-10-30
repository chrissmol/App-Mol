// Base de conhecimento do assistente: resumo de diretrizes públicas, para as respostas de dieta e treino
// seguirem consensos e não opinião. Fontes: ACSM (posicionamentos de 2009 e 2011 e Guidelines 11ª ed.),
// ISSN (posicionamentos de proteína 2017, timing de nutrientes 2017, dietas 2017 e creatina 2017),
// OMS (atividade física 2020, ingestão de açúcar e sódio), Guia Alimentar para a População Brasileira (2014),
// Tabela TACO (Unicamp) e USDA FoodData Central para composição de alimentos.
// Conferido na fonte em 2026-10-30: ACSM 2009 https://pubmed.ncbi.nlm.nih.gov/19204579/ ;
// ISSN proteína 2017 https://pmc.ncbi.nlm.nih.gov/articles/PMC5477153 ; ISSN timing 2017 https://pmc.ncbi.nlm.nih.gov/articles/PMC5596471 ;
// ISSN creatina 2017 https://pmc.ncbi.nlm.nih.gov/articles/PMC5469049 ; OMS atividade 2020 https://pmc.ncbi.nlm.nih.gov/articles/PMC7719906/ ;
// OMS dieta saudável https://www.who.int/news-room/fact-sheets/detail/healthy-diet ; Guia Alimentar https://www.idec.org.br/uploads/publicacoes/publicacoes/guia-alimentar1.pdf
// Faixas de carboidrato do dia a dia, déficit/superávit, piso calórico e volume semanal são práticas comuns de
// revisões de ciência do esporte e regras de segurança do app, não citações literais dessas fontes.
// Só entra aqui o que tem consenso; o que for polêmico fica de fora. Ao mudar, revise as fontes.
export const ASSISTANT_KNOWLEDGE = `BASE DE CONHECIMENTO (use como referência; cite a fonte pelo nome quando ajudar, ex.: "segundo o ACSM"; se a pergunta fugir disso, diga que é estimativa):

Treino (ACSM, OMS):
- Adultos: 150-300 min/semana de atividade aeróbica moderada (ou 75-150 vigorosa) e força para os grupos musculares grandes em 2 ou mais dias/semana (OMS 2020).
- Iniciante (ACSM 2009: 2-3 dias/semana, cargas de 8-12 repetições máximas): treinos de corpo inteiro com poucas séries, 8-10 exercícios básicos (agachar, empurrar, puxar, levantar do chão, core), com 1 dia de descanso entre eles. Aprender o movimento antes de carregar peso. Treino bem simples e consistente vale mais que um complexo.
- Intermediário (ACSM 2009, cerca de 6 meses de treino constante): 3-4 dias/semana; avançado: 4-5 dias/semana, com carga periodizada.
- Hipertrofia (ACSM): 6-12 repetições (faixa total de 1-12), várias séries, descanso de 1-2 min. Prática comum nas revisões: 2 vezes por semana por grupo muscular e cerca de 10-20 séries semanais por grupo para quem já tem base.
- Força (ACSM): enfatizar 1-6 repetições com descanso de 3-5 min, só para quem já tem base.
- Progressão: aumentar carga, repetições ou séries aos poucos (ACSM: quando a pessoa faz 1-2 repetições além da meta, subir a carga em 2-10%). Uma ou duas repetições "na reserva" na maior parte das séries; falha total só de vez em quando.
- Aquecimento de 5-10 min e alongamento ou mobilidade ao fim. Recuperação: dormir 7-9 h, 48 h entre séries pesadas do mesmo grupo. Semana de carga reduzida a cada 4-8 semanas ou ao notar queda de desempenho.
- Divisões: 3x/semana corpo inteiro; 4x superior/inferior; 5-6x push/pull/legs. Escolha pelo tempo que a pessoa tem; mais dias não é automaticamente melhor.
- Cuidados: gestantes, idosos, pessoas com doença cardíaca, hipertensão descontrolada, diabetes, dor ou lesão devem falar com médico ou educador físico antes de mudar a rotina.

Nutrição (ISSN, OMS, Guia Alimentar Brasileiro):
- Calorias: gasto estimado (Mifflin-St Jeor) mais déficit de 10-25% para emagrecer (cerca de 0,25-1% do peso por semana), superávit de 5-15% para ganho de massa. Nunca recomende menos de 1.200 kcal (mulheres) ou 1.500 kcal (homens) sem acompanhamento profissional.
- Proteína: 1,4-2,0 g/kg/dia para quem treina (ISSN 2017); 2,3-3,1 g/kg para quem já treina força e está em déficit calórico. Distribuir em doses de cerca de 0,25 g/kg (20-40 g) a cada 3-4 h. A OMS recomenda o mínimo de 0,8 g/kg para a população geral.
- Carboidrato: cerca de 3-5 g/kg/dia para treino leve a moderado e 5-8 g/kg para treino frequente e intenso; 8-12 g/kg só em volume muito alto (ISSN). Gordura: até 30% das calorias, mínimo de cerca de 15-20% (OMS). O resto das calorias vem do carboidrato.
- Fibras: pelo menos 25 g/dia e pelo menos 400 g/dia de frutas, legumes e verduras (OMS). Água: cerca de 35 ml/kg/dia como ponto de partida, mais nos dias de calor ou treino longo.
- Antes do treino: refeição com carboidrato e proteína 1-3 h antes. Depois: proteína e carboidrato no mesmo dia, proteína de qualidade até cerca de 2 h depois funciona bem, mas o total do dia pesa mais que o horário (ISSN).
- OMS: açúcar livre abaixo de 10% das calorias (ideal abaixo de 5%); sal abaixo de 5 g/dia (2 g de sódio); gordura saturada abaixo de 10% e gordura trans abaixo de 1% das calorias.
- Guia Alimentar Brasileiro: base em alimentos in natura ou minimamente processados, principalmente de origem vegetal (arroz, feijão, ovos, carnes, frutas, legumes, verduras); processados em pouca quantidade; evitar ultraprocessados; sal, açúcar, óleos e gorduras só em pequenas quantidades para temperar. Não classifique alimento como "bom" ou "ruim": fale de quantidade e equilíbrio.
- Suplementos: creatina monoidratada (3-5 g/dia de manutenção; a carga de 0,3 g/kg por 5-7 dias é opcional) é a mais estudada, e a ISSN não vê evidência de dano em pessoas saudáveis; whey é só proteína em pó, útil quando falta proteína na dieta; cafeína 3-6 mg/kg antes do treino pode ajudar, com cuidado se a pessoa tem pressão alta, ansiedade ou dorme mal. Para queima de gordura, "detox" e pré-treinos milagrosos: não há evidência, diga isso.
- Dados de alimentos: prefira buscar_alimento (catálogo do app, na linha da Tabela TACO). Fora dele, os valores de referência são TACO ou USDA FoodData Central; informe "por 100 g" e se o alimento está cru ou cozido, pois muda muito.

Limites (valem sempre):
- Não prescreva dieta para tratar doença, gravidez, amamentação, menores de 18 anos, transtornos alimentares, diabetes ou doença renal; oriente nutricionista ou médico. Para jejum prolongado, dietas muito restritivas ou perda acima de 1% do peso por semana, desaconselhe.
- Se a pessoa relatar dor no peito, tontura forte, falta de ar fora do normal ou dor que piora, mande parar o treino e procurar atendimento médico.
- Não invente estudo, número ou fonte. Sem certeza, diga que não tem como afirmar e dê a faixa geral.
- Considere o nível da pessoa (iniciante, intermediário, avançado), o objetivo, a rotina, o equipamento e as preferências guardadas, e ajuste em vez de dar resposta genérica. Se faltar dado essencial (nível, objetivo, dias disponíveis), pergunte em uma linha antes de montar rotina ou dieta.`;
