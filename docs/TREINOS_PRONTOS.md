# Treinos pré-prontos: critérios e fontes

Os modelos ficam em `public/js/modules/workout-templates.js`. Cada modelo cria uma rotina por dia de treino (ex.: Superior A, Inferior A), com séries, faixa de repetições, folga alvo (RIR), descanso e nota de progressão já preenchidos. Todos os exercícios existem na biblioteca do app (um teste garante isso).

## Critérios aplicados

| Decisão | Regra usada | Base |
|---|---|---|
| Frequência | Iniciante: corpo todo 2–3x/semana. Intermediário/avançado: cada músculo 2x/semana (Upper/Lower, PPL) | ACSM 2009; Schoenfeld 2016 |
| Volume | Iniciante 6–10 séries semanais por músculo; intermediário e avançado 10+ | Schoenfeld 2017; ACSM 2009 |
| Repetições | Compostos pesados 5–10; acessórios 10–20. Faixas de 5–30 reps dão hipertrofia parecida se próximas da falha | Schoenfeld 2017; NSCA 2016 |
| Proximidade da falha | Iniciante 3 reps de folga nas primeiras semanas, depois 2. Isoladores 1. Força 2 | Zourdos 2016 |
| Descanso | 2–4 min em compostos pesados (ACSM: 3–5 min nos mais pesados); 60–90 s em isoladores | Schoenfeld 2016 (descanso) |
| Ordem | Grandes grupos e compostos primeiro, isoladores e core por último | ACSM 2009; NSCA 2016 |
| Progressão | Dupla progressão: bateu o topo da faixa com folga, subir 2–5% da carga; força: +2,5 kg (superior) e +5 kg (inferior) por sessão | ACSM 2009; Kraemer e Ratamess 2004 |
| Alternativas | Cada exercício que exige barra, rack ou máquina traz uma alternativa na nota; o modelo "Casa" usa regressões e progressões de flexão | NSCA 2016 |

## Modelos

- **Iniciante Full Body 3x**: A/B alternando, máquinas e halteres, 3 séries.
- **Upper / Lower**: 4 dias, dois treinos de superior e dois de inferior (um mais pesado, um com mais volume).
- **Push Pull Legs**: 6 dias, cada músculo 2x/semana, ~12–16 séries semanais por grupo.
- **Força A/B 5x5**: agachamento em todo treino, supino/remada alternando com desenvolvimento/terra.
- **Casa / Sem academia**: peso corporal, halteres e elástico, progressão por variação do exercício.

## Fontes

- Garber CE et al. ACSM Position Stand: quantity and quality of exercise. *Med Sci Sports Exerc* 2011;43(7):1334-59.
- ACSM Position Stand: Progression models in resistance training for healthy adults. *Med Sci Sports Exerc* 2009;41(3):687-708.
- Kraemer WJ, Ratamess NA. Fundamentals of resistance training: progression and exercise prescription. *Med Sci Sports Exerc* 2004;36(4):674-88.
- Schoenfeld BJ, Ogborn D, Krieger JW. Effects of resistance training frequency on measures of muscle hypertrophy. *Sports Med* 2016;46:1689-97.
- Schoenfeld BJ, Ogborn D, Krieger JW. Dose-response relationship between weekly resistance training volume and increases in muscle mass: a systematic review and meta-analysis. *J Sports Sci* 2017;35(11):1073-82.
- Schoenfeld BJ, Grgic J, Ogborn D, Krieger JW. Strength and hypertrophy adaptations between low- vs. high-load resistance training: a systematic review and meta-analysis. *J Strength Cond Res* 2017;31(12):3508-23.
- Schoenfeld BJ, Pope ZK, Benik FM et al. Longer interset rest periods enhance muscle strength and hypertrophy in resistance-trained men. *J Strength Cond Res* 2016;30(7):1805-12.
- Zourdos MC et al. Novel resistance training-specific RPE scale measuring repetitions in reserve. *J Strength Cond Res* 2016;30(1):267-75.
- Haff GG, Triplett NT (eds). *Essentials of Strength Training and Conditioning*, 4th ed. NSCA, 2016.
- Jäger R et al. ISSN Position Stand: protein and exercise. *J Int Soc Sports Nutr* 2017;14:20 (proteína 1,4–2,0 g/kg/dia).
- Bull FC et al. WHO guidelines on physical activity and sedentary behaviour. *Br J Sports Med* 2020;54:1451-62.

Verificação (2026-10-30): título, periódico, volume e páginas conferidos no PubMed e no Crossref. Pelo ACSM 2009: iniciante 2–3 dias por semana com 8–12 RM; intermediário 3–4 dias e avançado 4–5 dias, com descanso de 3–5 min nos exercícios pesados. Schoenfeld 2016: treinar cada músculo 2x por semana supera 1x, com volume igualado; 3x contra 2x segue indefinido.
