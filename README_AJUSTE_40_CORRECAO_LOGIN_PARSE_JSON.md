# Ajuste 40 — Correção do login e leitura da resposta JSON

## Causa identificada

A função `parseResponseJSON`, usada por `fetchAuthJSON`, havia sido removida de `src/routes/index.tsx` durante os ajustes do heatmap.

No envio do formulário de login, o fluxo chegava até:

```ts
return await parseResponseJSON<T>(res, url);
```

Como a função não existia no bundle, ocorria um `ReferenceError`. O `catch` da tela transformava qualquer erro em “Usuário ou senha inválidos”, ocultando a causa real.

## Correção

A função original e validada foi restaurada, preservando o contrato do workflow 07 e aceitando a resposta JSON do endpoint `/fleury-login`.

Nenhuma alteração foi feita no workflow, nos usuários, nas senhas, no heatmap ou no `vite.config.ts`.
