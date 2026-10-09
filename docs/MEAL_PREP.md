# Marmitas e cardápios

A área `pages/marmitas.html` usa as refeições cadastradas na dieta para planejar almoço e jantar. O número de potes é ajustável por perfil; os dias podem ser selecionados quando as porções variam. As metas do preparo são a soma das refeições escolhidas, não a meta diária inteira do perfil.

## Interface e arquitetura

- Shell, navegação, temas, ícones Lucide, campos e seletores compartilhados do Mol.
- `meal-prep.js`: funções puras para seleção semanal, ajuste das porções, totais e divisão do rendimento pesado.
- `meal-prep-store.js`: leitura das dietas, vínculo dos perfis e histórico no Firestore.
- `marmitas.js`: controlador de tela. Cardápios aparecem com nome e data; detalhes e reutilização ficam recolhidos.
- A página pertence ao módulo Dieta e é incluída no build e no cache do app shell.

## Cálculo

Todos os macros de cada ingrediente entram no ajuste por mínimos quadrados relativos, com quantidades entre zero e 2 kg por ingrediente/pote. Complementos podem ter porção fixa. Legumes comuns começam com 100 g fixos; os demais alimentos começam ajustáveis. Combinações inviáveis exibem as referências e resultados, sem afirmar equivalência.

O catálogo informa o estado do alimento pelo nome. Rendimento pronto/cru é informado pelo usuário. Pesos prontos medidos são distribuídos proporcionalmente; o arredondamento conserva o peso total. Valores nutricionais são estimativas, especialmente quando muda o teor de água. Pratos misturados com proporções diferentes podem exigir lotes separados.

## Compartilhamento

Convites usam códigos aleatórios, não podem ser listados e aceitam um participante por até dois dias. O convidado aceita e o autor confirma. Leitura da dieta exige vínculos recíprocos em `mealShares`. Os perfis privados continuam isolados. Desconectar encerra acesso à dieta e novos preparos compartilhados; os cardápios já compartilhados continuam acessíveis aos participantes originais.

`mealPreparations` contém snapshots imutáveis das quantidades e porções daquela ocasião. Preparar novamente recupera os ingredientes e calcula com a dieta atual. As regras e o hosting precisam ser publicados juntos para a funcionalidade funcionar em produção.

## Validação

`npm run check`, `npm run security:scan`, `npm run test:e2e` e `npm run check:rules`. Novos testes cobrem 5/10/14 potes, dois perfis, diferenças entre refeições, inviabilidade, rendimento, histórico/reutilização, acessibilidade e permissões. O CI também executa os micro-agentes determinísticos e a revisão Claude de PRs.

## Publicação sem login local

O workflow manual `deploy-production.yml` usa as credenciais já existentes no environment `production` do GitHub. Publica Firestore Rules e Hosting no mesmo comando após build/check, análise local de segurança, auditoria bloqueante das dependências de produção e testes de interface em desktop/Android.

A dependência transitiva `@grpc/grpc-js` foi fixada em 1.14.6 para remover os alertas de produção. Atualizações compatíveis do lockfile também corrigem undici e outras dependências. A auditoria completa continua no quality gate e pode reprovar por dependências de desenvolvimento: braces 3.0.3 ainda não tem release corrigida, e a migração do Tailwind exige trabalho separado. Esses avisos não são ocultados nem apresentados como auditoria completa aprovada.

A revisão Claude depende da instalação/autorização de sua GitHub App; sua indisponibilidade não substitui as verificações determinísticas nem uma revisão manual do código.
