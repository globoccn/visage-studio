# Ajuste 01 — Cadastro real dos sensores no frontend

Este ZIP contém o primeiro ajuste do frontend para aderir aos workflows n8n.

## O que foi alterado

Arquivo alterado:

- `src/routes/index.tsx`

Substituído o cadastro local `sensorRegistry` que ainda usava `pendente01...pendente15` pelos 15 dispositivos reais Milesight:

- 6 sensores `EM300-TH`: `EM300-01` a `EM300-06`
- 9 sensores `AM103L`: `AM103L-07` a `AM103L-15`

Os campos de leitura inicial (`temperature`, `humidity`, `co2`, `battery`, `rssi`, `snr`) foram deixados como `null`, para evitar exibição de leituras falsas no cadastro base.

## Observação importante

Este é apenas o primeiro ajuste. Ainda permanecem para as próximas etapas:

1. controlar/remover mocks automáticos;
2. ajustar o endpoint `/fleury-dashboard-latest` para usar Redis nos cards de Hoje;
3. integrar alarmes com os limites salvos;
4. revisar CORS dos workflows.
