# SouFIT (Jogador Edition)
SouFIT é uma SPA focada em treinos, dieta e progresso com vibe RPG. Mantém navegação por hash (`#home`, `#workout`, etc.) e agora exige autenticação Firebase para liberar as rotas internas. O termo “Jogador” aparece em toda a UI e ajuda a reforçar o posicionamento temático.

## Executar o app localmente
1. Instale dependências (para outras ferramentas do mono-repo): `npm install`
2. Inicie um servidor estático (recomendado para testar offline):
   ```bash
   python -m http.server 5500
   ```
3. Acesse `http://localhost:5500/index.html` ou publique a pasta no GitHub Pages — o app é totalmente estático.

## Configurar Firebase (Auth + Firestore + Storage)
1. Crie um projeto em console.firebase.google.com.
2. Ative o método de autenticação por **E-mail/Senha** em Authentication.
3. Crie um banco Firestore em modo de produção e habilite o Storage com a localização desejada.
4. Copie o snippet de configuração do Firebase e cole em `apps/web/firebase.js`, substituindo os valores `YOUR_API_KEY`, `YOUR_PROJECT`, etc. As credenciais ficam prontas na própria aplicação, pois a segurança depende das regras do Firestore/Storage.
5. Garantia offline-first: `firebase.js` já chama `enableIndexedDbPersistence` para Firestore e `setPersistence(browserLocalPersistence)` para Auth.

### Regras recomendadas do Firebase (Firestore)
```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Regras recomendadas do Firebase Storage
```storage
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /diets/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Fluxo de autenticação e onboarding
- Rotas de autenticação: `#auth-login`, `#auth-signup` e `#auth-onboarding`.
- Usuário não autenticado é redirecionado automaticamente para o login (ou signup).
- Após o cadastro, o app exige onboarding obrigatório antes de liberar `#home`, `#workout`, `#diet`, `#results`, `#speed` e `#profile`.
- O fluxo de onboarding coleta idade, peso, altura, medidas, objetivo, frequência, grupos musculares, nível e tema. Ao concluir, gera automaticamente treino + dieta e marca `profileCompleted = true`.

## Recursos principais
- **Tema claro/escuro**: alternância instantânea com `body.theme-light` e `body.theme-dark`, armazenamento local e persistência no perfil (Firestore + cache).
- **Treino automático**: biblioteca local de exercícios, splits adaptados à frequência e prioridade de grupos. O jogador pode editar, excluir e adicionar exercícios via modal, além de regenerar o plano com confirmação.
- **Dieta automática**: cálculo de macros com base em idade, peso, altura e objetivo. Permite adicionar refeições, itens, editar/excluir e armazenar em Firestore.
- **Upload de PDF de dieta**: botão “Upload PDF” envia o arquivo para `diets/{uid}/current.pdf` no Firebase Storage e mostra pré-visualização com `<object>`. O botão “Remover PDF” apaga o link e sincroniza.
- **Offline-first**: Firestore persistence ativada, cache local em `localStorage` (perfil, plano, dieta). Mudanças são sincronizadas assim que há internet novamente.
- **Sincronização multi-dispositivo**: o Firebase é a fonte de verdade. Quando outro dispositivo altera dados, aparece um modal de conflito com opções para manter dados locais, usar dados do servidor ou exportar backup JSON.

## Testes e verificação
1. **Login/cadastro**: use as rotas `#auth-login` e `#auth-signup`. Depois de criar a conta, você é levado ao onboarding (`#auth-onboarding`).
2. **Onboarding**: preencha dados básicos, medidas e preferências. Ao finalizar, o app gera treino e dieta e libera `#home`.
3. **Editar treinos/dieta**: navegue para `#workout` e `#diet` para adicionar/excluir/exercícios e itens. Use “Regenerar plano” ou “Regenerar dieta” para recalcular com base nas preferências.
4. **Tema**: toque no `Alternar Tema` (sidebar ou perfil) para mudar o modo claro/escuro instantaneamente.
5. **Upload de PDF**: no dashboard de dieta, use “Upload PDF” para enviar um arquivo; a pré-visualização aparece na mesma página. Use “Remover PDF” para limpar a referência.
6. **Offline**: abra DevTools > Network > Offline. Faça alterações em treino/dieta; o app mostra que está offline e salva localmente. Volte a ficar online e o Firestore sincroniza automaticamente.
7. **Conflito**: edite o plano em dois navegadores diferentes; se houver conflito (ambos editados offline), surge modal com opções “manter”, “usar servidor” e “exportar backup JSON”.
8. **Sincronizar manual**: use o botão “Sincronizar agora” no dashboard ou perfil para forçar a gravação imediata.

## Observações
- A interface segue a nova linguagem “Jogador” e elementos de RPG (cartões com sombras suaves, ícones alinhados e tipografia Space Grotesk).
- O aplicativo permanece compatível com GitHub Pages — não há backend próprio.
- Não há necessidade de Node.js para rodar o front-end; serve estático é suficiente.
