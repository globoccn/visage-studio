# Validação da correção

## Resultado

- `npx tsc --noEmit`: concluído sem erros.
- `npm run build`: concluído com sucesso para cliente, SSR e Nitro.
- Cadastro ativo: 6 sensores (`EM300-01`, `EM300-02`, `EM300-03`, `EM300-04`, `AM103L-08`, `AM103L-15`).
- Heatmap ativo: 6 polígonos correspondentes aos sensores instalados.
- IDs dos 9 sensores removidos não aparecem no código ativo.
- Nova planta preservada e configurada com dimensão real `1532 × 1026`.
- `vite.config.ts` preservado exatamente com `allowedHosts: ["fleury-bh.2see.io"]`.
- A resposta de login continua aceitando objeto ou array do n8n.

## Proteções adicionadas

- Sensores removidos são descartados antes da normalização.
- Dashboard, histórico, alarmes, KPIs e contagens usam somente os seis sensores instalados.
- `expectedSensors` é sempre 6.
- Metadados, nomes, áreas e posições vêm do cadastro atual da nova planta.
- Sensores EM300 permanecem sem leitura de CO₂.

A validação não executa o endpoint real do n8n; ela confirma compilação, tipagem e consistência estática do frontend.
