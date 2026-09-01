# Privacidade

Este documento é uma base operacional para o Mol. Antes de vender o produto publicamente, revisar com apoio jurídico para adequação à LGPD e ao modelo comercial escolhido.

## Dados coletados

O Mol pode armazenar dados informados pelo usuário, como:

- Nome, e-mail e foto do perfil Google.
- Rotinas de treino.
- Exercícios, séries, cargas, repetições, RIR e histórico de sessões.
- Dieta, refeições, alimentos e horários.
- Peso, altura, objetivo, medidas corporais e fotos de progresso.
- Preferências de tema, acessibilidade, unidades e configurações locais.

## Finalidade

Os dados são usados para:

- Exibir treinos e dietas do usuário.
- Registrar histórico e evolução.
- Calcular métricas de treino, consistência e progresso corporal.
- Personalizar a experiência no aparelho.
- Manter segurança e funcionamento da conta.

## Armazenamento

Os dados são armazenados no Firebase, usando Firebase Authentication e Cloud Firestore. Dados locais podem ser mantidos pelo navegador para login, preferências, cache PWA e funcionamento offline limitado.

## Compartilhamento

Na versão atual, os dados são privados do usuário autenticado. Não há compartilhamento com treinadores, academias ou terceiros dentro do produto atual.

Se o Mol evoluir para planos com personal trainer ou academia, será necessário criar permissões claras e consentimento explícito para compartilhamento.

## Fotos de progresso

Fotos corporais podem ser sensíveis. O usuário deve enviar fotos apenas se desejar. A aplicação deve limitar tamanho, formato e quantidade, e permitir exclusão.

## Exclusão de dados

O usuário deve poder excluir conta e dados associados. A exclusão precisa remover ou anonimizar dados privados relacionados à conta, conforme viabilidade técnica e obrigações legais.

## Segurança

A proteção principal é feita por autenticação Firebase e regras do Firestore que isolam dados por usuário. Mais detalhes estão em `SEGURANCA.md`.

## Contato

Definir um e-mail oficial antes de venda pública, por exemplo: suporte@seudominio.com.
