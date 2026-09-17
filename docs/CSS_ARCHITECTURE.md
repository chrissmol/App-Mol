# Arquitetura CSS do Mol

## Breakpoints oficiais

- Celular: abaixo de `768px`.
- Tablet e iPad: de `768px` a `1199px`.
- Desktop com mouse e teclado: a partir de `1200px`.

O layout de desktop não deve depender apenas de `hover` ou `pointer`, porque alguns iPads anunciam capacidades semelhantes às de um computador.

## Ordem de manutenção

1. Tokens e variáveis globais.
2. Base e acessibilidade.
3. Shell, cabeçalho e navegação.
4. Componentes compartilhados.
5. Páginas específicas.
6. Modais e estados temporários.
7. Breakpoints oficiais.
8. Temas visuais.

Antes de acrescentar uma regra, procure uma classe compartilhada existente. Evite sobrescrever a mesma propriedade em outra parte do arquivo e use `!important` somente para proteger contratos globais de layout ou acessibilidade.

## Contratos de qualidade

`npm run css:check` limita o crescimento de `!important`, media queries e combinações de breakpoint que podem fazer o iPad entrar no layout desktop. O CI executa esse comando junto com os testes do projeto.
