# Firebase gratuito — configuração do Mol

O Mol usa somente Firebase Authentication, Firestore e Firebase Hosting no plano **Spark** (gratuito).

## 1. Instalar a ferramenta de deploy

No terminal, dentro desta pasta do projeto:

```powershell
npm install -g firebase-tools
firebase login
firebase use app-mol-5f3dc
```

O login abre uma página do Google. Use a conta que administra o projeto Firebase.

## 2. Publicar as regras de segurança

As regras estão no arquivo `firestore.rules`. Para enviá-las ao Firebase:

```powershell
firebase deploy --only firestore:rules
```

No Console Firebase, confirme em **Firestore Database → Rules** que a data de publicação foi atualizada. Não edite regras diferentes somente pelo Console: mantenha este arquivo como fonte oficial.

## 3. Publicar o site

```powershell
firebase deploy --only hosting
```

O Hosting é gratuito para este projeto dentro das cotas do plano Spark. O arquivo `firebase.json` já está preparado para publicar a pasta atual.

## 4. Login Google em desenvolvimento e produção

No Console Firebase:

1. Abra **Authentication → Settings → Authorized domains**.
2. Mantenha `localhost`.
3. Adicione `127.0.0.1` para o Live Server, se ele aparecer na URL.
4. Para o site publicado, mantenha `app-mol-5f3dc.firebaseapp.com` e `app-mol-5f3dc.web.app`.

Não inclua portas (`:5500`) nessa lista.

## 5. Restringir a chave web sem custo

A chave Firebase no frontend é pública por natureza; a proteção real são as regras do Firestore. Ainda assim, no **Google Cloud Console → APIs e serviços → Credenciais**, restrinja a chave web por sites autorizados antes de divulgar o app. Faça isso depois do Hosting funcionar e teste login + Firestore em seguida.

## Checklist antes de convidar usuários

- [ ] `firebase deploy --only firestore:rules` executado.
- [ ] Login Google funciona no domínio publicado.
- [ ] Usuário A não consegue ler dados do usuário B.
- [ ] Criação, edição e conclusão de treino funcionam.
- [ ] Registro de peso funciona.
- [ ] Teste em celular e rede móvel.
