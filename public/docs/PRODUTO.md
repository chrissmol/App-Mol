# Produto

## O que é o Mol

Mol é um aplicativo web fitness, instalável como PWA, voltado para pessoas que treinam musculação e querem organizar treino, dieta e evolução corporal em um único lugar.

A experiência foi pensada para uso real em celular: poucos passos, botões grandes, navegação inferior, tema claro/escuro, bloqueio de zoom e layout adaptado a iPhone, Android, tablet e modo horizontal.

## Público-alvo

- Pessoas que treinam em academia e querem registrar progresso.
- Personal trainers que precisam organizar treinos e acompanhar evolução de alunos.
- Academias pequenas que querem oferecer uma experiência digital simples aos alunos.
- Atletas recreativos que valorizam histórico, consistência e metas.

## Problema que resolve

Quem treina normalmente espalha informação em várias ferramentas: ficha no WhatsApp, dieta em PDF, peso em nota do celular, fotos na galeria e progresso na memória. Isso dificulta consistência e análise.

O Mol centraliza os dados principais do aluno em uma experiência leve, privada e focada no treino do dia.

## Proposta de valor

Organizar treino, dieta e evolução corporal em uma experiência mobile bonita, rápida e acessível, sem exigir app nativo e sem custo alto de infraestrutura.

## Funcionalidades atuais

- Login com Google.
- Rotinas de treino por usuário.
- Criação, edição, duplicação e exclusão de rotinas.
- Biblioteca de exercícios com filtros e favoritos.
- Detalhes técnicos por exercício com execução e erros comuns.
- Registro de treino com séries, carga, reps, RIR e descanso.
- Histórico de sessões concluídas.
- Métricas de volume e consistência.
- Dieta por refeições e alimentos.
- Perfil com dados pessoais, evolução corporal e configurações.
- Tema claro, escuro e automático pelo sistema.
- Backup e restauração de dados.
- PWA instalável na tela inicial.

## Diferenciais

- Mobile-first de verdade, não apenas responsivo.
- Baixo custo operacional com Firebase e site estático.
- Arquitetura simples para manter e evoluir.
- Testes automatizados para fluxos mobile.
- Interface com intenção de app profissional, inspirada em experiências como Hevy e apps modernos de rotina.
- Privacidade por usuário via Firebase Auth e Firestore Rules.

## Limitações atuais

- Ainda não há painel de treinador para gerenciar múltiplos alunos.
- Ainda não há cobrança integrada.
- A dieta usa base local/manual, sem backend próprio de nutrição.
- Notificações em PWA iOS têm limitações do próprio navegador/sistema.
- Testes E2E usam mock de Firebase para estabilidade local; fluxos reais de Google/Firebase precisam de validação manual no domínio publicado.

## Visão de produto

O Mol deve evoluir para uma plataforma simples o suficiente para qualquer pessoa usar sozinha, mas robusta o suficiente para um personal trainer prescrever, acompanhar e ajustar treinos e dieta de alunos.
