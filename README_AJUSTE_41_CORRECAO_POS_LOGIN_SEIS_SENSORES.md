# Ajuste 41 — Correção da tela após login preservando seis sensores

- Restaurado o bloco funcional removido acidentalmente entre `HeatmapAreaOverlay` e `LayerSelector`.
- Mantidos os seis sensores instalados: 1, 2, 3, 4, 8 e 15.
- Mantida a nova planta e o heatmap de seis polígonos.
- Mantida a correção de login para respostas objeto ou array do n8n.
- Dashboard, histórico, alarmes, KPIs e contagens agora descartam sensores antigos antes da normalização.
- Total esperado fixado em 6 sensores.
- Metadados e posições da planta usam o cadastro atual, mesmo se o backend ainda enviar dados antigos.
- Sensores EM300 permanecem sem CO₂.
- `vite.config.ts` preservado sem alterações.
