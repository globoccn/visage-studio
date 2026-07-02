# Ajuste 03 — Hydration, JSON e POST sem preflight

Ajustes aplicados no frontend Fleury após validação no navegador:

1. Corrigido erro de hydration do React/TanStack Start.
   - O header não renderiza mais `new Date()` diretamente no SSR.
   - Data e hora agora são preenchidas somente no cliente com `useClientClock()`.
   - `emptyDashboard()` não cria mais `updatedAt` com horário dinâmico durante a renderização inicial.

2. Corrigido erro `Unexpected end of JSON input`.
   - `fetchJSON()` agora lê o texto da resposta antes de fazer `JSON.parse`.
   - Se o n8n responder vazio, a tela mostra erro claro: `resposta vazia do n8n`.
   - Se o n8n responder texto que não é JSON, a tela mostra: `resposta não é JSON válido`.

3. Ajustado POST das configurações.
   - Removido header `Content-Type: application/json` para evitar preflight CORS em navegadores.
   - O corpo continua sendo JSON stringificado.
   - O workflow n8n deve aceitar `body` como string ou objeto.

4. Mantida a configuração original do `vite.config.ts`.
