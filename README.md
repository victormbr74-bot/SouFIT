# SouFIT Monorepo
Monorepo offline-first com foco em Web moderno, Mobile Expo e um core puro em Node/TypeScript que governa regras de pontos, ciclos e sincronização em nuvem.

## Visão geral
- **Offline-first primeiro**: todo fluxo roda localmente, a sincronização com Supabase acontece quando o usuário está online.
- **Monorepo unificado**: apps Web legacy, Web-MUI, Mobile e ferramentas compartilham o mesmo core puro e helpers de estado.
- **Tema Solo Leveling** aplicado globalmente, com o “cor do caçador” governando o palette em Web-MUI e Mobile.
- **Login/sincronização via Supabase** (Auth + Postgres) e snapshot JSON por usuário, com resolução simples de conflitos.

## Estrutura
```
/
  apps/
    web/         -> aplicativo atual (fallback, sem reescrever)
    web-mui/     -> nova UI em React + MUI + HashRouter
    mobile/      -> Expo + TypeScript + ThemeProvider
  packages/
    core/        -> Node/TS puro com regras, ciclos e helpers (exportado como @soufit/core)
  tools/         -> scripts Node (migrations, simulação, validação)
  package.json
  tsconfig.base.json
```

## Workspaces padrão
- `npm run bootstrap`: instala deps para apps, core e tools.
- `npm run build`: compila workspaces TS (`packages/core`, scripts do `/tools`).
- `npm run test`: roda testes declarados nos workspaces.
- `apps/web` deve permanecer intacto como fallback e só evoluir com adaptações compatíveis.

## Phases (roadmap imediato)
1. **Core compartilhado (fase 1)**: datas locais, pontos, runs, missões, streak, reconciliações e serialização versionada (`soufit_v3`). Esse core alimenta Web-MUI, Mobile e o legado quando possível.
2. **Ciclos automáticos (fase 2)**: reset semanal de treinos/dieta, prompt mensal sobre treino, penalidades diárias e lógica de streak integrada ao core.
3. **Cloud sync + Supabase (fase 3)**: tabela `user_state` com snapshot JSON, RLS por `auth.uid()`, push/pull com resolução de conflito (modal: manter local, usar nuvem, exportar backup).
4. **Web moderno (fase 4)**: novo app em `/apps/web-mui` com Vite + React + TypeScript + MUI + HashRouter; Drawer/AppBar/BottomNavigation; cards e listas; tema por cor do caçador (azul/roxo/vermelho/verde).
5. **Mobile MVP (fase 5)**: Expo RN + TypeScript + tabs; ThemeProvider + AsyncStorage; Supabase Auth + sync; reconciliações iniciais e prompt mensal.
6. **Web antigo (fase 6)**: mantido como fallback; corrigir UTF-8, trocar “NÍVEL” por “RANK” e integrar ao core de forma incremental.
7. **Tools (fase 7)**: scripts para validar imports (`validate-import.ts`), migrar storage (`migrate-storage.ts`) e simular dias/semanas/meses (`simulate-days.ts`).

## Supabase & Sync
1. Crie a tabela `user_state`:
   - `user_id uuid PRIMARY KEY REFERENCES auth.users(id)`
   - `app_state_json text`
   - `updated_at timestamptz DEFAULT now()`
   - `client_id text`
   - `version text`
2. Habilite RLS:
   ```sql
   CREATE POLICY select_own_state ON user_state FOR SELECT USING (user_id = auth.uid());
   CREATE POLICY upsert_own_state ON user_state FOR INSERT, UPDATE USING (user_id = auth.uid());
   ```
3. Variáveis ambientais esperadas:
   - `SUPABASE_URL`, `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` apenas para scripts seguros (não no cliente).
4. Estratégia:
   - Seriais JSON pelo `state.ts` do core (`serializeAppState`, `deserializeAppState`, versión `soufit_v3`).
   - Push/pull: upsert + fetch do estado do usuário; conflitos com `lastWriteWins` e modal de resolução.
   - Gatilhos de sync: abertura do app, voltar ao foco, a cada 2–5 minutos online (com debounce), após mudanças críticas.

## QA Target Checklist
1. Login e Sync funcionam (criar conta, logar, push/pull + conflito).
2. Reset semanal (em uma segunda simulada) zera marcações de treino/dieta e libera pontos.
3. Prompt mensal dispara ao mudar o mês (prompt: manter ou trocar treino, registra resposta).
4. Streak conta missões/treinos/corridas/peso por dia.
5. Penalidade diária com limite de 14 dias sem abrir o app (−10/dia).
6. Corridas importadas respeitam cap diário (virtualPoints) e não geram XP retroativo.
7. Tema global muda cor do caçador em TODO o app (web-mui + mobile, legado quando possível).
8. Textos com encoding limpo e “Rank do Caçador” em toda UI.

## Próximos passos imediatos
1. Reinforce `/packages/core` com os ciclos descritos e exporte `reconcileAll` + helpers.
2. Criar `/apps/web-mui` com Vite + React + MUI; usar HashRouter para GitHub Pages.
3. Mobile Expo agora integra Supabase Auth + sync; reconciliações + prompt mensal.
4. Tools executam validações/migrações para o novo formato `soufit_v3`.

## Testes sugeridos
- `npm run build` (root).
- Scripts específicos (`node tools/simulate-days.ts 7` etc).
- Manual: abrir Web-MUI + Mobile via expo, confirmar resets e prompt.
