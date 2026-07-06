# Ajuste 38 — Heatmap V4.1 Escalas

Base: `fleury_frontend_ajuste_37_heatmap_v4_organico`.

Escopo: alteração conservadora apenas na renderização lógica/visual dos heatmaps de Umidade e CO₂.

## Alterações

- Umidade:
  - A escala visual agora respeita a legenda operacional.
  - 40–60% permanece verde/ideal.
  - Abaixo de 40% tende para seco/quente.
  - Acima de 60% tende para úmido/frio.

- CO₂:
  - Removido fallback por sensor mais próximo para zonas sem sensor CO₂.
  - Áreas EM300 permanecem neutras no modo CO₂.
  - Somente zonas com AM103L próprio recebem camada térmica de CO₂.

## Não alterado

- Posição dos sensores.
- Polígonos S1–S15.
- Heatmap de temperatura.
- Layout geral do dashboard.
- Integração com backend/n8n.
