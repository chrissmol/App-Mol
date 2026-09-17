# Micro-agentes de qualidade

O Mol usa agentes determinísticos, executados localmente e no GitHub Actions. Eles não dependem de uma API paga de IA.

- `code`: lint e contratos de JavaScript.
- `unit`: regras de negócio e persistência.
- `html`: marcação válida.
- `css`: limites de complexidade e breakpoints.
- `security`: padrões locais de alto risco.
- `visual-and-flows`: temas, larguras, console e jornadas de interface.

Execute `npm run agents` dentro de `public/`. Os agentes rodam em paralelo e o comando falha se qualquer grupo falhar. Relatórios de interpretação por IA podem ser adicionados depois, mas a decisão de bloquear release deve permanecer baseada em verificações reproduzíveis.
